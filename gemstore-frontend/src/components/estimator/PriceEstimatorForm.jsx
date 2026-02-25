import React, { useState } from 'react';
import { usePriceEstimator } from '../../hooks/usePriceEstimator';
import PriceResult from './PriceResult';
import './Estimator.css';

// Gem type icons
const gemIcons = {
  sapphire: '💎',
  ruby: '❤️',
  emerald: '💚',
  diamond: '💠',
};

function PriceEstimatorForm({ compact = false, fullPage = false, onCreateListing }) {
  const {
    formData,
    result,
    loading,
    error,
    options,
    serviceAvailable,
    handleChange,
    estimatePrice,
    resetForm,
    getAvailableColors,
    getAvailableOrigins,
  } = usePriceEstimator();

  const [showAdvanced, setShowAdvanced] = useState(false);

  if (!serviceAvailable) {
    return (
      <div className="estimator-unavailable">
        <span className="unavailable-icon">⚠️</span>
        <span className="unavailable-text">
          {compact ? 'Service unavailable' : 'Price estimation service is currently unavailable'}
        </span>
      </div>
    );
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    estimatePrice();
  };

  const handleCreateListing = () => {
    if (onCreateListing && result) {
      onCreateListing({
        ...formData,
        estimatedPrice: result.predicted_price_lkr,
        qualityGrade: result.quality_grade,
      });
    }
  };

  const availableColors = getAvailableColors();
  const availableOrigins = getAvailableOrigins();

  // Compact version for rightbar
  if (compact) {
    return (
      <form className="estimator-form estimator-form--compact" onSubmit={handleSubmit}>
        {/* Gem Type - Compact */}
        <div className="form-section">
          <label className="form-label">Type</label>
          <select
            className="compact-select"
            value={formData.gemType}
            onChange={(e) => handleChange('gemType', e.target.value)}
          >
            {options?.gemTypes?.map((type) => (
              <option key={type} value={type}>
                {gemIcons[type]} {type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Carat Weight - Compact */}
        <div className="form-section">
          <label className="form-label">Carat</label>
          <div className="carat-input-wrapper">
            <input
              type="number"
              step="0.1"
              min="0.1"
              max="50"
              placeholder="2.5"
              value={formData.caratWeight}
              onChange={(e) => handleChange('caratWeight', e.target.value)}
              className="carat-input carat-input--compact"
              required
            />
            <span className="carat-suffix">ct</span>
          </div>
        </div>

        {/* Color - Compact */}
        <div className="form-section">
          <label className="form-label">Color</label>
          <select
            className="compact-select"
            value={formData.gemColor}
            onChange={(e) => handleChange('gemColor', e.target.value)}
          >
            {availableColors.map((color) => (
              <option key={color} value={color}>
                {color.charAt(0).toUpperCase() + color.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Quality - Compact */}
        <div className="form-section">
          <label className="form-label">Quality</label>
          <select
            className="compact-select"
            value={formData.colorQuality}
            onChange={(e) => handleChange('colorQuality', e.target.value)}
          >
            {options?.colorQualities?.map((q) => (
              <option key={q} value={q}>
                {q.charAt(0).toUpperCase() + q.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Treatment - Compact */}
        <div className="form-section">
          <label className="form-label">Treatment</label>
          <div className="treatment-selector treatment-selector--compact">
            {['Heated', 'Unheated'].map((t) => (
              <button
                key={t}
                type="button"
                className={`treatment-btn treatment-btn--compact ${formData.treatment === t ? 'active' : ''}`}
                onClick={() => handleChange('treatment', t)}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="estimator-error estimator-error--compact">
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          className="estimate-btn estimate-btn--compact"
          disabled={loading || !formData.caratWeight}
        >
          {loading ? 'Calculating...' : '✨ Estimate'}
        </button>

        {/* Compact Result */}
        {result && (
          <div className="compact-result">
            <div className="compact-result-price">
              <span className="compact-price-label">Estimated</span>
              <span className="compact-price-value">
                ${result.predicted_price_usd.toLocaleString()}
              </span>
              <span className="compact-price-secondary">
                {result.predicted_price_lkr.toLocaleString()} LKR
              </span>
            </div>
            <div className="compact-result-meta">
              <span className={`compact-badge grade-${result.quality_grade.toLowerCase()}`}>
                {result.quality_grade}
              </span>
              <span className={`compact-badge confidence-${result.confidence}`}>
                {result.confidence}
              </span>
            </div>
            <button 
              type="button" 
              className="compact-reset-btn"
              onClick={resetForm}
            >
              New Estimate
            </button>
          </div>
        )}
      </form>
    );
  }

  // Full version (existing code - keep your current implementation)
  return (
    <form className={`estimator-form ${fullPage ? 'estimator-form--full' : ''}`} onSubmit={handleSubmit}>
      {/* Gem Type Selection */}
      <div className="form-section">
        <label className="form-label">Gemstone Type</label>
        <div className="gem-type-grid">
          {options?.gemTypes?.map((type) => (
            <button
              key={type}
              type="button"
              className={`gem-type-btn ${formData.gemType === type ? 'active' : ''}`}
              onClick={() => handleChange('gemType', type)}
            >
              <span className="gem-icon">{gemIcons[type]}</span>
              <span className="gem-name">{type.charAt(0).toUpperCase() + type.slice(1)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Carat Weight */}
      <div className="form-section">
        <label className="form-label">
          Carat Weight
          <span className="label-hint">Size of the gem</span>
        </label>
        <div className="carat-input-wrapper">
          <input
            type="number"
            step="0.01"
            min="0.1"
            max="100"
            placeholder="e.g. 2.5"
            value={formData.caratWeight}
            onChange={(e) => handleChange('caratWeight', e.target.value)}
            className="carat-input"
            required
          />
          <span className="carat-suffix">ct</span>
        </div>
        <div className="carat-presets">
          {[0.5, 1, 2, 3, 5].map((ct) => (
            <button
              key={ct}
              type="button"
              className={`preset-btn ${parseFloat(formData.caratWeight) === ct ? 'active' : ''}`}
              onClick={() => handleChange('caratWeight', ct.toString())}
            >
              {ct}ct
            </button>
          ))}
        </div>
      </div>

      {/* Color Selection */}
      <div className="form-section">
        <label className="form-label">Color</label>
        <div className="color-grid">
          {availableColors.map((color) => (
            <button
              key={color}
              type="button"
              className={`color-btn ${formData.gemColor === color ? 'active' : ''}`}
              onClick={() => handleChange('gemColor', color)}
              style={{ '--color-accent': getColorHex(color) }}
            >
              <span className="color-dot"></span>
              <span className="color-name">{formatLabel(color)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Color Quality */}
      <div className="form-section">
        <label className="form-label">
          Color Quality
          <span className="label-hint">{getQualityDescription(formData.colorQuality)}</span>
        </label>
        <div className="quality-selector">
          {options?.colorQualities?.map((quality) => (
            <button
              key={quality}
              type="button"
              className={`quality-btn ${formData.colorQuality === quality ? 'active' : ''}`}
              onClick={() => handleChange('colorQuality', quality)}
            >
              {formatLabel(quality)}
            </button>
          ))}
        </div>
      </div>

      {/* Treatment */}
      <div className="form-section">
        <label className="form-label">
          Treatment
          <span className="label-hint">
            {formData.treatment === 'Unheated' ? '🌟 Premium (Natural)' : 'Industry standard'}
          </span>
        </label>
        <div className="treatment-selector">
          {(formData.gemType === 'emerald' ? ['Oiled', 'Unheated'] : ['Heated', 'Unheated']).map((treatment) => (
            <button
              key={treatment}
              type="button"
              className={`treatment-btn ${formData.treatment === treatment ? 'active' : ''} ${treatment === 'Unheated' ? 'premium' : ''}`}
              onClick={() => handleChange('treatment', treatment)}
            >
              {treatment === 'Unheated' && <span className="premium-badge">★</span>}
              {treatment}
            </button>
          ))}
        </div>
      </div>

      {/* Origin */}
      <div className="form-section">
        <label className="form-label">Origin</label>
        <select
          className="origin-select"
          value={formData.origin}
          onChange={(e) => handleChange('origin', e.target.value)}
        >
          {availableOrigins.map((origin) => (
            <option key={origin} value={origin}>
              {formatOriginLabel(origin)}
            </option>
          ))}
        </select>
      </div>

      {/* Advanced Options Toggle */}
      <button
        type="button"
        className="advanced-toggle"
        onClick={() => setShowAdvanced(!showAdvanced)}
      >
        {showAdvanced ? '▼ Hide' : '▶ Show'} Advanced Options
      </button>

      {/* Advanced Options */}
      {showAdvanced && (
        <div className="advanced-section">
          <div className="form-section">
            <label className="form-label">
              Clarity
              <span className="label-value">{options?.clarityScores?.[formData.clarityScore]}</span>
            </label>
            <input
              type="range"
              min="1"
              max="5"
              value={formData.clarityScore}
              onChange={(e) => handleChange('clarityScore', parseInt(e.target.value))}
              className="slider"
            />
            <div className="slider-labels">
              <span>Included</span>
              <span>Loupe Clean</span>
            </div>
          </div>

          <div className="form-section">
            <label className="form-label">
              Cut Grade
              <span className="label-value">{options?.cutGradeScores?.[formData.cutGradeScore]}</span>
            </label>
            <input
              type="range"
              min="1"
              max="5"
              value={formData.cutGradeScore}
              onChange={(e) => handleChange('cutGradeScore', parseInt(e.target.value))}
              className="slider"
            />
            <div className="slider-labels">
              <span>Poor</span>
              <span>Excellent</span>
            </div>
          </div>

          <div className="form-section">
            <label className="form-label">Shape</label>
            <select
              className="shape-select"
              value={formData.shape}
              onChange={(e) => handleChange('shape', e.target.value)}
            >
              {options?.shapes?.map((shape) => (
                <option key={shape} value={shape}>{formatLabel(shape)}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="estimator-error">
          <span className="error-icon">⚠️</span>
          {error}
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        className={`estimate-btn ${loading ? 'loading' : ''}`}
        disabled={loading || !formData.caratWeight}
      >
        {loading ? (
          <>
            <span className="spinner"></span>
            Calculating...
          </>
        ) : (
          <>
            <span className="btn-icon">✨</span>
            Estimate Price
          </>
        )}
      </button>

      {/* Result */}
      {result && (
        <PriceResult 
          result={result} 
          onReset={resetForm}
          onCreateListing={handleCreateListing}
        />
      )}
    </form>
  );
}

// Helper functions
const formatLabel = (str) => str.split(/[_\s]/).map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

const formatOriginLabel = (origin) => {
  const labels = {
    'sri lanka': '🇱🇰 Sri Lanka (Ceylon)',
    'myanmar': '🇲🇲 Myanmar (Burma)',
    'colombia': '🇨🇴 Colombia',
    'madagascar': '🇲🇬 Madagascar',
    'mozambique': '🇲🇿 Mozambique',
    'zambia': '🇿🇲 Zambia',
    'other': '🌍 Other',
  };
  return labels[origin] || formatLabel(origin);
};

const getColorHex = (color) => {
  const colors = {
    blue: '#1e90ff', red: '#dc143c', pink: '#ff69b4', green: '#00a86b',
    yellow: '#ffd700', white: '#f5f5f5', orange: '#ff8c00', purple: '#8b5cf6',
    teal: '#008080', padparadscha: '#ff7f50', other: '#9ca3af',
  };
  return colors[color] || '#6b7280';
};

const getQualityDescription = (quality) => {
  const desc = {
    vivid: 'Exceptional, saturated', royal: 'Deep, rich color',
    cornflower: 'Medium-light blue', normal: 'Standard saturation', light: 'Lighter color',
  };
  return desc[quality] || '';
};

export default PriceEstimatorForm;