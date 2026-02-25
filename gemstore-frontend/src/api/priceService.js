import { API_BASE_URL, getAuthToken } from './config';

const PRICE_API_BASE = `${API_BASE_URL}/api/v1/gems/price`;

/**
 * Get price prediction for a gem
 */
export const predictGemPrice = async (gemData, token) => {
  // Use passed token or get from localStorage
  const authToken = token || getAuthToken();
  
  const response = await fetch(`${PRICE_API_BASE}/predict`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`,
    },
    body: JSON.stringify({
      gem_type: gemData.gemType,
      carat_weight: parseFloat(gemData.caratWeight),
      gem_color: gemData.gemColor,
      color_quality: gemData.colorQuality,
      clarity_score: parseInt(gemData.clarityScore),
      cut_grade_score: parseInt(gemData.cutGradeScore),
      shape: gemData.shape,
      origin: gemData.origin,
      treatment: gemData.treatment,
    }),
  });

  if (!response.ok) {
    let message = 'Failed to get price prediction';
    try {
      const error = await response.json();
      message = error.detail || error.message || message;
    } catch {
      // ignore JSON parse error
    }
    throw new Error(message);
  }

  return response.json();
};

/**
 * Get available options for the estimator (public endpoint)
 */
export const getPriceOptions = async () => {
  const response = await fetch(`${PRICE_API_BASE}/options`);
  
  if (!response.ok) {
    throw new Error('Failed to get options');
  }

  return response.json();
};

/**
 * Check if price service is available (public endpoint)
 */
export const checkPriceServiceHealth = async () => {
  try {
    const response = await fetch(`${PRICE_API_BASE}/health`);
    if (!response.ok) return false;
    const data = await response.json();
    return data.status === 'healthy' && data.model_loaded;
  } catch {
    return false;
  }
};

/**
 * Quick estimate with minimal parameters
 */
export const quickEstimate = async (params) => {
  const token = getAuthToken();
  const queryParams = new URLSearchParams(params);
  
  const response = await fetch(`${PRICE_API_BASE}/estimate/quick?${queryParams}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to get quick estimate');
  }

  return response.json();
};