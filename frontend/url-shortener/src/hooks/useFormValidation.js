import { useState, useCallback } from 'react';
import { debounce } from '../utils/authHelpers';

/**
 * Custom hook for handling form state and validation
 * @param {object} initialValues - Initial form values
 * @param {function} validationRules - Function that returns validation errors
 * @param {number} debounceMs - Debounce delay for validation (default: 300ms)
 */
export function useFormValidation(initialValues, validationRules, debounceMs = 300) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isValidating, setIsValidating] = useState(false);

  // Debounced validation function
  const debouncedValidate = useCallback(
    debounce((formValues) => {
      setIsValidating(true);
      const validationErrors = validationRules(formValues);
      setErrors(validationErrors);
      setIsValidating(false);
    }, debounceMs),
    [validationRules, debounceMs]
  );

  const handleChange = useCallback((field) => (event) => {
    const value = event.target.value;
    const newValues = { ...values, [field]: value };
    
    setValues(newValues);
    
    // Clear error for this field if it exists
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
    
    // Trigger debounced validation
    debouncedValidate(newValues);
  }, [values, errors, debouncedValidate]);

  const handleBlur = useCallback((field) => () => {
    setTouched(prev => ({ ...prev, [field]: true }));
    
    // Validate immediately on blur
    const validationErrors = validationRules(values);
    if (validationErrors[field]) {
      setErrors(prev => ({ ...prev, [field]: validationErrors[field] }));
    }
  }, [values, validationRules]);

  const handleFocus = useCallback((field) => () => {
    // Clear error when field is focused
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  }, [errors]);

  const validateAll = useCallback(() => {
    const validationErrors = validationRules(values);
    setErrors(validationErrors);
    
    // Mark all fields as touched
    const allTouched = {};
    Object.keys(values).forEach(key => {
      allTouched[key] = true;
    });
    setTouched(allTouched);
    
    return Object.keys(validationErrors).length === 0;
  }, [values, validationRules]);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsValidating(false);
  }, [initialValues]);

  const setFieldValue = useCallback((field, value) => {
    setValues(prev => ({ ...prev, [field]: value }));
  }, []);

  const setFieldError = useCallback((field, error) => {
    setErrors(prev => ({ ...prev, [field]: error }));
  }, []);

  return {
    values,
    errors,
    touched,
    isValidating,
    handleChange,
    handleBlur,
    handleFocus,
    validateAll,
    reset,
    setFieldValue,
    setFieldError,
    isValid: Object.keys(errors).length === 0
  };
}