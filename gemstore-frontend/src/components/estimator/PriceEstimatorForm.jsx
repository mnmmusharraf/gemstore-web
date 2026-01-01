import React from "react";
import "./Estimator.css";

function PriceEstimatorForm() {
  return (
    <form className="estimator-form">
      <div className="form-field">
        <label>Gemstone Type</label>
        <input placeholder="e.g. Ruby" />
      </div>
      <div className="form-field">
        <label>Carat Weight</label>
        <input placeholder="e.g. 2.0" />
      </div>
      <div className="form-field">
        <label>Quality (Color / Clarity)</label>
        <input placeholder="e.g. Vivid Red, VS" />
      </div>
      <button type="button" className="secondary-btn">
        Estimate Price
      </button>

      <div className="estimator-result">
        <span className="estimator-label">Estimated Range</span>
        <span className="estimator-value">$1,800 – $2,200</span>
        <span className="estimator-sub">Based on recent similar listings</span>
      </div>
    </form>
  );
}

export default PriceEstimatorForm;