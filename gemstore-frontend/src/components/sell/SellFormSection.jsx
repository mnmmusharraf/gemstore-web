import React from "react";
import "../../styles/SellFormSection.css";

function SellFormSection() {
  return (
    <div className="panel-card">
      <form className="sell-form">
        <div className="form-row">
          <div className="form-field">
            <label>Gemstone Type</label>
            <input placeholder="e.g. Emerald, Ruby, Sapphire" />
          </div>
          <div className="form-field">
            <label>Carat Weight</label>
            <input placeholder="e.g. 1.5" />
          </div>
        </div>

        <div className="form-row">
          <div className="form-field">
            <label>Color</label>
            <input placeholder="e.g. Vivid Green" />
          </div>
          <div className="form-field">
            <label>Clarity</label>
            <input placeholder="e.g. VS1, Eye-clean" />
          </div>
        </div>

        <div className="form-row">
          <div className="form-field">
            <label>Origin</label>
            <input placeholder="e.g. Colombia, Sri Lanka" />
          </div>
          <div className="form-field">
            <label>Asking Price (USD)</label>
            <input placeholder="e.g. 2500" />
          </div>
        </div>

        <div className="form-field">
          <label>Description</label>
          <textarea
            rows={3}
            placeholder="Describe the gemstone, its certification, and any other important details."
          />
        </div>

        <div className="form-field">
          <label>Photos</label>
          <div className="upload-box">
            <span>Drag & drop images here or click to browse</span>
          </div>
        </div>

        <button type="button" className="primary-btn">
          Preview Listing
        </button>
      </form>
    </div>
  );
}

export default SellFormSection;