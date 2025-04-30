
import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, Upload } from 'lucide-react';
import { CONTACT_CATEGORIES } from '@/utils/adminApi';

interface CSVImporterProps {
  onImport: (data: any[]) => void;
  expectedFields: string[];
  entityName: string;
  buttonText?: string;
}

const CSVImporter = ({ onImport, expectedFields, entityName, buttonText = "Select CSV File" }: CSVImporterProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [importDisabled, setImportDisabled] = useState(true);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  
  const isNetworkContactImport = expectedFields.includes('category');
  const validCategories = CONTACT_CATEGORIES.map(cat => cat.value);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    setError(null);
    setValidationErrors([]);
    
    if (!selectedFile) {
      setFile(null);
      setPreviewData([]);
      return;
    }
    
    if (selectedFile.type !== "text/csv" && !selectedFile.name.endsWith('.csv')) {
      setError("Please upload a CSV file.");
      setFile(null);
      return;
    }
    
    setFile(selectedFile);
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const result = parseCSV(text);
        
        if (result.length === 0) {
          setError("The CSV file is empty.");
          setPreviewData([]);
          setImportDisabled(true);
          return;
        }
        
        // Validate headers
        const headers = Object.keys(result[0]);
        const missingFields = expectedFields.filter(field => 
          field === 'name' && !headers.includes(field)
        );
        
        if (missingFields.length > 0) {
          setError(`Required fields missing: ${missingFields.join(', ')}`);
          setPreviewData([]);
          setImportDisabled(true);
          return;
        }
        
        // Validate required fields and perform data validation
        const errors: string[] = [];
        let hasRequiredFields = true;
        
        // Check if any record is missing required fields
        result.forEach((record, index) => {
          if (!record.name || record.name.trim() === '') {
            errors.push(`Row ${index + 1}: Missing required field 'name'`);
            hasRequiredFields = false;
          }
          
          // For network contacts, validate category
          if (isNetworkContactImport) {
            if (!record.category || record.category.trim() === '') {
              errors.push(`Row ${index + 1}: Missing required field 'category'`);
              hasRequiredFields = false;
            } else if (!validCategories.includes(record.category)) {
              errors.push(`Row ${index + 1}: Invalid category '${record.category}'. Valid options are: ${validCategories.join(', ')}`);
              hasRequiredFields = false;
            }
          }
        });
        
        setValidationErrors(errors);
        setPreviewData(result);
        setImportDisabled(!hasRequiredFields);
      } catch (err: any) {
        setError(`Error parsing CSV: ${err.message}`);
        setPreviewData([]);
        setImportDisabled(true);
      }
    };
    
    reader.readAsText(selectedFile);
  };

  const parseCSV = (csvText: string) => {
    const lines = csvText.split(/\r\n|\n/);
    const result = [];
    const headers = lines[0].split(',').map(header => header.trim());
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      // Split by comma but respect quoted values
      let row: string[] = [];
      let insideQuote = false;
      let currentValue = '';
      
      for (let j = 0; j < line.length; j++) {
        const char = line[j];
        
        if (char === '"') {
          insideQuote = !insideQuote;
        } else if (char === ',' && !insideQuote) {
          row.push(currentValue.trim());
          currentValue = '';
        } else {
          currentValue += char;
        }
      }
      
      row.push(currentValue.trim()); // Add the last value
      
      const obj: Record<string, any> = {};
      headers.forEach((header, index) => {
        if (header && index < row.length) {
          let value = row[index];
          
          // Remove surrounding quotes if present
          if (value.startsWith('"') && value.endsWith('"')) {
            value = value.substring(1, value.length - 1);
          }
          
          // Convert "true"/"false" strings to boolean for boolean fields
          if (header === 'is_lp' || header === 'is_admin') {
            obj[header] = value.toLowerCase() === 'true';
          } 
          // Convert numeric fields to numbers
          else if (['founded_year', 'investment_year'].includes(header) && !isNaN(Number(value))) {
            obj[header] = value ? Number(value) : null;
          }
          // All other fields remain strings
          else {
            obj[header] = value;
          }
        }
      });
      
      result.push(obj);
    }
    
    return result;
  };

  const handleImport = useCallback(() => {
    if (!file || importDisabled) return;
    onImport(previewData);
  }, [file, previewData, onImport, importDisabled]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="csvFile">Upload {entityName} CSV file</Label>
        <input
          id="csvFile"
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="hidden"
        />
        <Button 
          variant="outline" 
          className="w-full py-8 border-dashed hover:border-neutral-400 flex flex-col items-center justify-center gap-2"
          onClick={() => document.getElementById('csvFile')?.click()}
        >
          <Upload className="h-6 w-6 text-neutral-500" />
          <span>{buttonText}</span>
          <span className="text-sm text-neutral-500">{file ? file.name : '.csv files only'}</span>
        </Button>
      </div>
      
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {validationErrors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Validation Errors</AlertTitle>
          <AlertDescription>
            <ul className="list-disc pl-4 mt-2">
              {validationErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}
      
      {previewData.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Preview ({previewData.length} records):</h3>
          <Card>
            <CardContent className="p-4 overflow-auto max-h-48">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b">
                    {Object.keys(previewData[0]).map((header) => (
                      <th key={header} className="p-2 text-left">{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {previewData.slice(0, 5).map((row, rowIndex) => (
                    <tr key={rowIndex} className="border-b">
                      {Object.entries(row).map(([key, value]) => (
                        <td key={key} className="p-2">
                          {typeof value === 'boolean' ? value.toString() : (value as string)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {previewData.length > 5 && (
                <p className="text-xs text-gray-500 mt-2">
                  {previewData.length - 5} more records...
                </p>
              )}
            </CardContent>
          </Card>
          
          <Button 
            onClick={handleImport} 
            disabled={importDisabled}
            className="w-full"
          >
            Import {previewData.length} {entityName}
          </Button>
        </div>
      )}
    </div>
  );
};

export default CSVImporter;
