import React from "react";
import "./ReportSection.css";

function ReportSection() {
  return (
    <div className="panel-card">
      <h3 className="panel-title">Report a Listing or User</h3>
      <p className="panel-subtitle">
        Help keep Gemstore safe. Your report is confidential and reviewed by our team.
      </p>

      <form className="report-form">
        <div className="form-field">
          <label>What are you reporting?</label>
          <select defaultValue="">
            <option value="" disabled>
              Select an option
            </option>
            <option value="fraud">Suspicious / fraudulent activity</option>
            <option value="fake">Fake or misrepresented gemstone</option>
            <option value="abuse">Harassment or abusive behavior</option>
            <option value="other">Other safety concern</option>
          </select>
        </div>

        <div className="form-field">
          <label>Listing URL or Username (optional)</label>
          <input placeholder="@username or link to listing" />
        </div>

        <div className="form-field">
          <label>Details</label>
          <textarea
            rows={4}
            placeholder="Describe what happened. Include any important details that will help us review."
          />
        </div>

        <button type="button" className="primary-btn">
          Submit Report
        </button>
      </form>
    </div>
  );
}

export default ReportSection;