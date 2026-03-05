import React, { useState } from 'react';
import reportService from '../../api/reportService';
import { toast } from 'sonner';
import './ReportModal.css';

function ReportModal({
  isOpen,
  onClose,
  reportType = 'LISTING',
  targetId,
  targetTitle,
}) {
  const [selectedReason, setSelectedReason] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const reasons = reportService.getReportReasons(reportType);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedReason) {
      toast.error('Please select a reason');
      return;
    }

    setSubmitting(true);

    try {
      const reportData = {
        reportType,
        reason: selectedReason,
        description: description.trim() || null,
      };

      // Set the appropriate ID field
      if (reportType === 'LISTING') {
        reportData.listingId = targetId;
      } else if (reportType === 'USER') {
        reportData.userId = targetId;
      } else if (reportType === 'MESSAGE') {
        reportData.messageId = targetId;
      }

      await reportService.createReport(reportData);
      toast.success('Report submitted. Thank you for helping keep our community safe.');
      handleClose();
    } catch (error) {
      console.error('Failed to submit report:', error);
      if (error.message?.includes('already reported')) {
        toast.error('You have already reported this item');
      } else {
        toast.error('Failed to submit report. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedReason('');
    setDescription('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="report-modal-overlay" onClick={handleClose}>
      <div className="report-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="report-modal-header">
          <h3>Report {reportType.toLowerCase()}</h3>
          <button className="report-modal-close" onClick={handleClose}>
            <CloseIcon size={20} />
          </button>
        </div>

        {/* Target info */}
        {targetTitle && (
          <div className="report-target">
            <span className="report-target-label">Reporting:</span>
            <span className="report-target-title">{targetTitle}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="report-reasons">
            <label className="report-label">Why are you reporting this?</label>
            {reasons.map((reason) => (
              <label key={reason.value} className="report-reason-option">
                <input
                  type="radio"
                  name="reason"
                  value={reason.value}
                  checked={selectedReason === reason.value}
                  onChange={(e) => setSelectedReason(e.target.value)}
                />
                <span className="report-reason-radio"></span>
                <span className="report-reason-text">{reason.label}</span>
              </label>
            ))}
          </div>

          <div className="report-description">
            <label className="report-label">Additional details (optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide any additional information..."
              maxLength={500}
            />
            <span className="report-char-count">{description.length}/500</span>
          </div>

          <div className="report-modal-footer">
            <button
              type="button"
              className="report-cancel-btn"
              onClick={handleClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="report-submit-btn"
              disabled={!selectedReason || submitting}
            >
              {submitting ? 'Submitting...' : 'Submit Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* Close Icon */
const CloseIcon = ({ size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

export default ReportModal;