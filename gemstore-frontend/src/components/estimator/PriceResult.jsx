import React from 'react';
import './Estimator.css';

function PriceResult({ result, onReset }) {
  if (!result) return null;

  const {
    predicted_price_lkr,
    predicted_price_usd,
    price_range_low_lkr,
    price_range_high_lkr,
    confidence,
    quality_grade,
    gem_summary,
    price_factors,
    warnings,
  } = result;

  const formatPrice = (price, currency = 'LKR') => {
    if (currency === 'USD') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
      }).format(price);
    }
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getConfidenceColor = (conf) => {
    switch (conf) {
      case 'high':
        return 'confidence-high';
      case 'medium':
        return 'confidence-medium';
      default:
        return 'confidence-low';
    }
  };

  const getGradeColor = (grade) => {
    switch (grade) {
      case 'AAA':
        return 'grade-aaa';
      case 'AA':
        return 'grade-aa';
      case 'A':
        return 'grade-a';
      default:
        return 'grade-other';
    }
  };

  return (
    <div className="price-result">
      {/* Main Price */}
      <div className="result-header">
        <div className="result-label">Estimated Value</div>
        <div className="result-price">
          <span className="price-main">{formatPrice(predicted_price_usd, 'USD')}</span>
          <span className="price-secondary">{formatPrice(predicted_price_lkr)}</span>
        </div>
      </div>

      {/* Price Range */}
      <div className="result-range">
        <div className="range-bar">
          <div className="range-fill"></div>
          <div className="range-marker"></div>
        </div>
        <div className="range-labels">
          <span>{formatPrice(price_range_low_lkr)}</span>
          <span className="range-text">Price Range</span>
          <span>{formatPrice(price_range_high_lkr)}</span>
        </div>
      </div>

      {/* Quality & Confidence Badges */}
      <div className="result-badges">
        <div className={`badge ${getGradeColor(quality_grade)}`}>
          <span className="badge-label">Quality</span>
          <span className="badge-value">{quality_grade}</span>
        </div>
        <div className={`badge ${getConfidenceColor(confidence)}`}>
          <span className="badge-label">Confidence</span>
          <span className="badge-value">{confidence.charAt(0).toUpperCase() + confidence.slice(1)}</span>
        </div>
      </div>

      {/* Gem Summary */}
      <div className="result-summary">
        <div className="summary-title">Gem Details</div>
        <div className="summary-grid">
          <div className="summary-item">
            <span className="summary-label">Type</span>
            <span className="summary-value">{gem_summary.type}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Weight</span>
            <span className="summary-value">{gem_summary.weight}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Origin</span>
            <span className="summary-value">{gem_summary.origin}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Treatment</span>
            <span className="summary-value">{gem_summary.treatment}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Color</span>
            <span className="summary-value">{gem_summary.color_quality}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Clarity</span>
            <span className="summary-value">{gem_summary.clarity}</span>
          </div>
        </div>
      </div>

      {/* Price Factors */}
      <div className="result-factors">
        <div className="factors-title">Price Factors</div>
        <div className="factors-list">
          {Object.entries(price_factors).map(([key, value]) => (
            <div key={key} className="factor-item">
              <span className="factor-label">{formatFactorLabel(key)}</span>
              <span className={`factor-value ${getFactorClass(value)}`}>{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Warnings */}
      {warnings && warnings.length > 0 && (
        <div className="result-warnings">
          {warnings.map((warning, index) => (
            <div key={index} className="warning-item">
              {warning}
            </div>
          ))}
        </div>
      )}

      {/* Action Buttons */}
      <div className="result-actions">
        <button type="button" className="action-btn secondary" onClick={onReset}>
          New Estimate
        </button>
        <button type="button" className="action-btn primary">
          Create Listing
        </button>
      </div>
    </div>
  );
}

const formatFactorLabel = (key) => {
  const labels = {
    origin_impact: '🌍 Origin',
    color_quality_impact: '🎨 Color Quality',
    treatment_impact: '⚗️ Treatment',
    size_impact: '📏 Size',
  };
  return labels[key] || key;
};

const getFactorClass = (value) => {
  if (value.includes('+')) return 'factor-positive';
  if (value.includes('-')) return 'factor-negative';
  return 'factor-neutral';
};

export default PriceResult;