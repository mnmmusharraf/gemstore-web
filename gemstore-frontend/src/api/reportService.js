import { API_BASE_URL, getAuthHeaders, handleResponse } from './config';

const reportService = {
  /**
   * Create a new report
   */
  async createReport(reportData) {
    const response = await fetch(`${API_BASE_URL}/api/v1/reports`, {
      method: 'POST',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reportData),
    });
    return handleResponse(response);
  },

  /**
   * Get user's submitted reports
   */
  async getMyReports(page = 0, size = 20) {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/reports/my-reports?page=${page}&size=${size}`,
      { headers: getAuthHeaders() }
    );
    return handleResponse(response);
  },

  /**
   * Check if user has reported a listing
   */
  async hasReportedListing(listingId) {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/reports/check/listing/${listingId}`,
      { headers: getAuthHeaders() }
    );
    return handleResponse(response);
  },

  /**
   * Get report reasons for UI
   */
  getReportReasons(type = 'LISTING') {
    const reasons = {
      LISTING: [
        { value: 'FAKE_LISTING', label: 'Fake or misleading listing' },
        { value: 'MISLEADING_PHOTOS', label: 'Misleading photos' },
        { value: 'WRONG_PRICE', label: 'Incorrect price' },
        { value: 'COUNTERFEIT', label: 'Counterfeit gemstone' },
        { value: 'ALREADY_SOLD', label: 'Item already sold' },
        { value: 'SPAM', label: 'Spam' },
        { value: 'OTHER', label: 'Other' },
      ],
      USER: [
        { value: 'SCAMMER', label: 'Scammer / Fraud' },
        { value: 'HARASSMENT', label: 'Harassment' },
        { value: 'FAKE_ACCOUNT', label: 'Fake account' },
        { value: 'IMPERSONATION', label: 'Impersonation' },
        { value: 'SPAM', label: 'Spam' },
        { value: 'OTHER', label: 'Other' },
      ],
      MESSAGE: [
        { value: 'HARASSMENT', label: 'Harassment' },
        { value: 'SPAM', label: 'Spam' },
        { value: 'INAPPROPRIATE_CONTENT', label: 'Inappropriate content' },
        { value: 'FRAUD', label: 'Fraud attempt' },
        { value: 'OTHER', label: 'Other' },
      ],
    };
    return reasons[type] || reasons.LISTING;
  },

  /**
   * Get report types
   */
  getReportTypes() {
    return [
      { value: 'LISTING', label: 'Listing' },
      { value: 'USER', label: 'User' },
      { value: 'MESSAGE', label: 'Message' },
    ];
  },
};

export default reportService;