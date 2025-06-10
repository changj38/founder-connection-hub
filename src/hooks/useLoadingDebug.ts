
import { useEffect, useRef } from 'react';

export const useLoadingDebug = (loading: boolean, componentName: string) => {
  const startTime = useRef<number | null>(null);
  const warningShown = useRef(false);

  useEffect(() => {
    if (loading) {
      startTime.current = Date.now();
      warningShown.current = false;
      console.log(`${componentName}: Loading started`);

      // Set up warning timer
      const warningTimer = setTimeout(() => {
        if (loading && !warningShown.current) {
          console.warn(`${componentName}: Loading exceeded 5 seconds`);
          warningShown.current = true;
        }
      }, 5000);

      // Set up error timer
      const errorTimer = setTimeout(() => {
        if (loading) {
          console.error(`${componentName}: Loading exceeded 10 seconds - possible infinite loading state`);
        }
      }, 10000);

      return () => {
        clearTimeout(warningTimer);
        clearTimeout(errorTimer);
      };
    } else {
      if (startTime.current) {
        const duration = Date.now() - startTime.current;
        console.log(`${componentName}: Loading completed in ${duration}ms`);
        startTime.current = null;
      }
    }
  }, [loading, componentName]);
};
