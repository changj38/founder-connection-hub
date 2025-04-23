
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Upload, FileWarning, CheckCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface CSVImporterProps {
  onImport: (data: any[]) => Promise<void>;
  expectedFields: string[];
  entityName: string;
  buttonText?: string;
}

const CSVImporter = ({ onImport, expectedFields, entityName, buttonText = "Import CSV" }: CSVImporterProps) => {
  const { toast } = useToast();
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  
  const parseCSV = (text: string): { headers: string[], data: string[][] } => {
    const rows = text.split(/\r?\n/).filter(row => row.trim());
    const headers = rows[0].split(',').map(h => h.trim());
    
    const data = rows.slice(1).map(row => {
      // Handle quoted values with commas inside them
      const values: string[] = [];
      let currentValue = '';
      let insideQuote = false;
      
      for (let i = 0; i < row.length; i++) {
        const char = row[i];
        
        if (char === '"' && (i === 0 || row[i-1] !== '\\')) {
          insideQuote = !insideQuote;
        } else if (char === ',' && !insideQuote) {
          values.push(currentValue.trim());
          currentValue = '';
        } else {
          currentValue += char;
        }
      }
      
      // Add the last value
      values.push(currentValue.trim());
      
      return values;
    });
    
    return { headers, data };
  };

  const validateData = (parsed: { headers: string[], data: string[][] }): { valid: boolean, errors: string[] } => {
    const errors: string[] = [];
    
    // Check if required fields are present
    const missingFields = expectedFields.filter(field => !parsed.headers.includes(field));
    if (missingFields.length > 0) {
      errors.push(`Missing required fields: ${missingFields.join(', ')}`);
    }
    
    // Check for empty required fields in data
    // For our use case, only 'name' is truly required
    const nameFieldIndex = parsed.headers.indexOf('name');
    
    if (nameFieldIndex >= 0) {
      parsed.data.forEach((row, rowIndex) => {
        if (!row[nameFieldIndex] || row[nameFieldIndex].trim() === '') {
          errors.push(`Row ${rowIndex + 1}: Missing required 'name' field`);
        }
      });
    } else {
      // If name field is not found in headers but it's required, add error
      if (expectedFields.includes('name')) {
        errors.push("The 'name' field is required but was not found in the CSV headers");
      }
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  };

  const transformData = (parsed: { headers: string[], data: string[][] }): any[] => {
    return parsed.data.map(row => {
      const item: Record<string, any> = {};
      
      parsed.headers.forEach((header, index) => {
        // Convert to appropriate types
        let value = row[index] || '';
        
        if (header === 'is_lp') {
          // Convert "true", "yes", "1" to boolean true
          item[header] = ['true', 'yes', '1'].includes(value.toLowerCase());
        } else if (['founded_year', 'investment_year'].includes(header) && value) {
          const year = parseInt(value, 10);
          item[header] = isNaN(year) ? null : year;
        } else {
          item[header] = value || null;
        }
      });
      
      return item;
    }).filter(item => item.name && item.name.trim() !== ''); // Ensure we only return items with valid names
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setIsValidating(true);
    setValidationErrors([]);
    
    try {
      const text = await file.text();
      const parsed = parseCSV(text);
      
      // Validate data
      const validation = validateData(parsed);
      
      if (!validation.valid) {
        setValidationErrors(validation.errors);
        setIsValidating(false);
        return;
      }
      
      // Transform data to proper format
      const transformedData = transformData(parsed);
      
      // Check if we have any valid data with names
      if (transformedData.length === 0) {
        setValidationErrors(['No valid data found. Each entry must have a name.']);
        setIsValidating(false);
        return;
      }
      
      setIsValidating(false);
      setIsImporting(true);
      
      // Start import process
      await onImport(transformedData);
      
      toast({
        title: "Import Successful",
        description: `${transformedData.length} ${entityName} imported successfully.`,
      });
      
    } catch (error: any) {
      console.error("CSV import error:", error);
      toast({
        title: "Import Failed",
        description: `Error: ${error.message || "Unknown error occurred"}`,
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
      setImportProgress(0);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div>
      <input
        type="file"
        accept=".csv"
        onChange={handleFileChange}
        ref={fileInputRef}
        className="hidden"
      />
      
      <Button 
        onClick={triggerFileInput} 
        variant="outline"
        disabled={isImporting || isValidating}
        className="gap-2"
      >
        <Upload size={16} />
        {buttonText}
      </Button>
      
      {isValidating && (
        <Card className="mt-4">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-amber-600">
              <FileWarning size={18} />
              <span>Validating CSV file...</span>
            </div>
          </CardContent>
        </Card>
      )}
      
      {validationErrors.length > 0 && (
        <Alert variant="destructive" className="mt-4">
          <AlertDescription>
            <div className="font-bold mb-1">CSV Validation Failed:</div>
            <ul className="list-disc pl-5">
              {validationErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}
      
      {isImporting && (
        <Card className="mt-4">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <span>Importing data...</span>
            </div>
            <Progress value={importProgress} className="h-2" />
          </CardContent>
        </Card>
      )}
      
      <div className="mt-2 text-xs text-gray-500">
        <p>Expected CSV format: {expectedFields.join(', ')}</p>
      </div>
    </div>
  );
};

export default CSVImporter;
