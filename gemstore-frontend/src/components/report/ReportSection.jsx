import React, { useState, useEffect } from 'react';
import reportService from '../../api/reportService';
import LoadingSpinner from '../common/LoadingSpinner';
import './ReportSection.css';

function ReportSection() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await reportService.getMyReports();
      setReports(response.data?.content || []);
    } catch (err) {
      console.error('Failed to fetch reports:', err);
      setError('Failed to load your reports');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'PENDING':
        return 'status-pending';
      case 'REVIEWING':
        return 'status-reviewing';
      case 'RESOLVED':
        return 'status-resolved';
      case 'DISMISSED':
        return 'status-dismissed';
      default:
        return '';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatReason = (reason) => {
    return reason
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  if (loading) {
    return (
      <div className="report-section">
        <LoadingSpinner message="Loading your reports..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="report-section">
        <div className="report-error">
          <p>{error}</p>
          <button onClick={fetchReports}>Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="report-section">
      <div className="report-section-header">
        <h2>My Reports</h2>
        <p className="report-section-subtitle">
          Reports you've submitted to help keep our community safe
        </p>
      </div>

      {reports.length === 0 ? (
        <div className="report-empty">
          <div className="report-empty-icon">📋</div>
          <h3>No reports yet</h3>
          <p>You haven't submitted any reports yet.</p>
        </div>
      ) : (
        <div className="report-list">
          {reports.map((report) => (
            <div key={report.id} className="report-card">
              <div className="report-card-header">
                <span className="report-type">{report.reportType}</span>
                <span className={`report-status ${getStatusBadgeClass(report.status)}`}>
                  {report.status}
                </span>
              </div>

              <div className="report-card-body">
                <div className="report-reason">
                  <strong>Reason:</strong> {formatReason(report.reason)}
                </div>

                {report.reportedListingTitle && (
                  <div className="report-target-info">
                    <strong>Listing:</strong> {report.reportedListingTitle}
                  </div>
                )}

                {report.reportedUsername && (
                  <div className="report-target-info">
                    <strong>User:</strong> @{report.reportedUsername}
                  </div>
                )}

                {report.description && (
                  <div className="report-description-text">
                    <strong>Details:</strong> {report.description}
                  </div>
                )}
              </div>

              <div className="report-card-footer">
                <span className="report-date">
                  Submitted {formatDate(report.createdAt)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ReportSection;