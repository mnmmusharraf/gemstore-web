import { useState, useEffect, useCallback } from 'react';
import { predictGemPrice, getPriceOptions, checkPriceServiceHealth } from '../api/priceService';
import { getAuthToken } from '../api/config';  // ✅ Use your existing config helper

const initialFormState = {
  gemType: 'sapphire',
  caratWeight: '',
  gemColor: 'blue',
  colorQuality: 'normal',
  clarityScore: 3,
  cutGradeScore: 3,
  shape: 'oval',
  origin: 'sri lanka',
  treatment: 'Heated',
};

export const usePriceEstimator = () => {
  const [formData, setFormData] = useState(initialFormState);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [options, setOptions] = useState(null);
  const [serviceAvailable, setServiceAvailable] = useState(true);

  // Load options on mount
  useEffect(() => {
    const loadOptions = async () => {
      try {
        const opts = await getPriceOptions();
        setOptions(opts);
      } catch (err) {
        console.error('Failed to load options:', err);
        setOptions(getDefaultOptions());
      }
    };

    const checkHealth = async () => {
      const available = await checkPriceServiceHealth();
      setServiceAvailable(available);
    };

    loadOptions();
    checkHealth();
  }, []);

  // Update available colors when gem type changes
  const getAvailableColors = useCallback(() => {
    if (!options?.gemColors) return getDefaultOptions().gemColors[formData.gemType] || [];
    return options.gemColors[formData.gemType] || [];
  }, [options, formData.gemType]);

  // Update available origins when gem type changes
  const getAvailableOrigins = useCallback(() => {
    if (!options?.origins) return getDefaultOptions().origins[formData.gemType] || [];
    return options.origins[formData.gemType] || [];
  }, [options, formData.gemType]);

  // Handle form field changes
  const handleChange = useCallback((field, value) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      if (field === 'gemType') {
        const defaultOpts = getDefaultOptions();
        const colors = options?.gemColors?.[value] || defaultOpts.gemColors[value] || [];
        const origins = options?.origins?.[value] || defaultOpts.origins[value] || [];
        
        newData.gemColor = colors[0] || 'blue';
        newData.origin = origins[0] || 'sri lanka';
        
        if (value === 'emerald') {
          newData.treatment = 'Oiled';
        } else {
          newData.treatment = 'Heated';
        }
      }
      
      return newData;
    });
    
    setResult(null);
    setError(null);
  }, [options]);

  // Submit form
  const estimatePrice = useCallback(async () => {
    if (!formData.caratWeight || parseFloat(formData.caratWeight) <= 0) {
      setError('Please enter a valid carat weight');
      return;
    }

    // ✅ Get token from localStorage using your config helper
    const token = getAuthToken();
    
    if (!token) {
      setError('Please login to use price estimation');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const prediction = await predictGemPrice(formData, token);
      setResult(prediction);
    } catch (err) {
      setError(err.message || 'Failed to get price estimate');
      setResult(null);
    } finally {
      setLoading(false);
    }
  }, [formData]);

  // Reset form
  const resetForm = useCallback(() => {
    setFormData(initialFormState);
    setResult(null);
    setError(null);
  }, []);

  return {
    formData,
    result,
    loading,
    error,
    options: options || getDefaultOptions(),
    serviceAvailable,
    handleChange,
    estimatePrice,
    resetForm,
    getAvailableColors,
    getAvailableOrigins,
  };
};

// Default options
const getDefaultOptions = () => ({
  gemTypes: ['sapphire', 'ruby', 'emerald', 'diamond'],
  gemColors: {
    sapphire: ['blue', 'pink', 'yellow', 'white', 'orange', 'purple', 'teal', 'padparadscha'],
    ruby: ['red', 'pink'],
    emerald: ['green'],
    diamond: ['white', 'yellow', 'pink', 'blue'],
  },
  colorQualities: ['vivid', 'royal', 'cornflower', 'normal', 'light'],
  shapes: ['oval', 'cushion', 'round', 'emerald', 'pear', 'heart', 'marquise', 'princess'],
  origins: {
    sapphire: ['sri lanka', 'myanmar', 'madagascar', 'tanzania', 'other'],
    ruby: ['myanmar', 'mozambique', 'sri lanka', 'thailand', 'other'],
    emerald: ['colombia', 'zambia', 'afghanistan', 'brazil', 'other'],
    diamond: ['south africa', 'russia', 'botswana', 'other'],
  },
  treatments: ['Heated', 'Unheated', 'Oiled'],
  clarityScores: {
    1: 'Heavily Included',
    2: 'Included',
    3: 'Slightly Included',
    4: 'Eye Clean',
    5: 'Loupe Clean',
  },
  cutGradeScores: {
    1: 'Poor',
    2: 'Fair',
    3: 'Good',
    4: 'Very Good',
    5: 'Excellent',
  },
});

export default usePriceEstimator;