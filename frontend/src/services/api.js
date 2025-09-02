// services/api.js
import axios from 'axios';
import { getToken, removeToken } from '../utils/auth';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      removeToken();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/signin', credentials),
  logout: () => api.post('/auth/signout'),
};

// Dashboard API
export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
};

// Employees API
export const employeesAPI = {
  getAll: (params = {}) => api.get('/employees', { params }),
  getById: (id) => api.get(`/employees/${id}`),
  create: (data) => api.post('/employees', data),
  update: (id, data) => api.put(`/employees/${id}`, data),
  delete: (id) => api.delete(`/employees/${id}`),
  search: (params) => api.get('/employees/search', { params }),
};

// Enhanced Bench Candidates API with comprehensive document management
export const benchCandidatesAPI = {
  getAll: (params = {}) => api.get('/bench-candidates', { params }),
  getById: (id) => api.get(`/bench-candidates/${id}`),
  create: (formData) => {
    return api.post('/bench-candidates', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  update: (id, formData) => {
    return api.put(`/bench-candidates/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  delete: (id) => api.delete(`/bench-candidates/${id}`),
  search: (params) => api.get('/bench-candidates/search', { params }),
  
  // Enhanced Document Management APIs
  getDocuments: (candidateId) => api.get(`/bench-candidates/${candidateId}/documents`),
  
  // Single document upload with type specification
  uploadDocument: (candidateId, file, documentType = 'OTHER') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType', documentType);
    return api.post(`/bench-candidates/${candidateId}/documents`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  // Multiple documents upload with types
  uploadMultipleDocuments: (candidateId, files, documentTypes = []) => {
    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append('files', file);
      formData.append('documentTypes', documentTypes[index] || 'OTHER');
    });
    return api.post(`/bench-candidates/${candidateId}/documents/multiple`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Bulk document upload with individual type specification
  uploadDocumentsWithTypes: (candidateId, documentsData) => {
    const formData = new FormData();
    documentsData.forEach((docData, index) => {
      formData.append('files', docData.file);
      formData.append(`documentType_${index}`, docData.type || 'OTHER');
      if (docData.description) {
        formData.append(`description_${index}`, docData.description);
      }
    });
    formData.append('fileCount', documentsData.length.toString());
    return api.post(`/bench-candidates/${candidateId}/documents/bulk`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Document download with proper blob handling
  downloadDocument: (candidateId, documentId) => {
    return api.get(`/bench-candidates/${candidateId}/documents/${documentId}/download`, {
      responseType: 'blob',
      timeout: 30000, // 30 second timeout for large files
    });
  },

  // Document preview (for supported file types)
  previewDocument: (candidateId, documentId) => {
    return api.get(`/bench-candidates/${candidateId}/documents/${documentId}/preview`, {
      responseType: 'blob',
    });
  },

  // Delete document with confirmation
  deleteDocument: (candidateId, documentId) => {
    return api.delete(`/bench-candidates/${candidateId}/documents/${documentId}`);
  },

  // Get document metadata and information
  getDocumentInfo: (candidateId, documentId) => {
    return api.get(`/bench-candidates/${candidateId}/documents/${documentId}/info`);
  },

  // Update document type or metadata
  updateDocument: (candidateId, documentId, updateData) => {
    return api.put(`/bench-candidates/${candidateId}/documents/${documentId}`, updateData);
  },

  // Get documents by type
  getDocumentsByType: (candidateId, documentType) => {
    return api.get(`/bench-candidates/${candidateId}/documents/type/${documentType}`);
  },

  // Search documents
  searchDocuments: (candidateId, searchTerm) => {
    return api.get(`/bench-candidates/${candidateId}/documents/search`, {
      params: { q: searchTerm }
    });
  },

  // Get document sharing link (if implemented)
  getDocumentShareLink: (candidateId, documentId, expiresInHours = 24) => {
    return api.post(`/bench-candidates/${candidateId}/documents/${documentId}/share`, {
      expiresInHours
    });
  },

  // Batch delete documents
  deleteDocuments: (candidateId, documentIds) => {
    return api.delete(`/bench-candidates/${candidateId}/documents/batch`, {
      data: { documentIds }
    });
  },

  // Legacy resume download (for backward compatibility)
  downloadResume: (id) => {
    return api.get(`/bench-candidates/${id}/resume`, {
      responseType: 'blob',
    });
  },

  // Candidate profile export
  exportProfile: (id, format = 'pdf') => {
    return api.get(`/bench-candidates/${id}/export`, {
      params: { format },
      responseType: 'blob',
    });
  },

  // Bulk operations
  bulkUpdate: (candidateIds, updateData) => {
    return api.put('/bench-candidates/bulk', {
      candidateIds,
      updateData
    });
  },

  bulkDelete: (candidateIds) => {
    return api.delete('/bench-candidates/bulk', {
      data: { candidateIds }
    });
  },

  // Advanced search with filters
  advancedSearch: (searchCriteria) => {
    return api.post('/bench-candidates/advanced-search', searchCriteria);
  },

  // Get candidate statistics
  getCandidateStats: (id) => {
    return api.get(`/bench-candidates/${id}/statistics`);
  },
};

// Working Candidates API with enhanced features
export const workingCandidatesAPI = {
  getAll: (params = {}) => api.get('/working-candidates', { params }),
  getById: (id) => api.get(`/working-candidates/${id}`),
  create: (data) => api.post('/working-candidates', data),
  update: (id, data) => api.put(`/working-candidates/${id}`, data),
  delete: (id) => api.delete(`/working-candidates/${id}`),
  search: (params) => api.get('/working-candidates/search', { params }),

  // Document management for working candidates
  getDocuments: (candidateId) => api.get(`/working-candidates/${candidateId}/documents`),
  uploadDocument: (candidateId, file, documentType = 'OTHER') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType', documentType);
    return api.post(`/working-candidates/${candidateId}/documents`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  downloadDocument: (candidateId, documentId) => {
    return api.get(`/working-candidates/${candidateId}/documents/${documentId}/download`, {
      responseType: 'blob',
    });
  },
  deleteDocument: (candidateId, documentId) => {
    return api.delete(`/working-candidates/${candidateId}/documents/${documentId}`);
  },

  // Performance tracking
  getPerformanceMetrics: (id) => {
    return api.get(`/working-candidates/${id}/performance`);
  },

  // Contract and billing information
  getContractInfo: (id) => {
    return api.get(`/working-candidates/${id}/contract`);
  },

  updateContractInfo: (id, contractData) => {
    return api.put(`/working-candidates/${id}/contract`, contractData);
  },
};

// Enhanced Candidate Activities API
export const candidateActivitiesAPI = {
  getByCandidateId: (candidateId) => api.get(`/candidate-activities/candidate/${candidateId}`),
  create: (data) => api.post('/candidate-activities', data),
  update: (id, data) => api.put(`/candidate-activities/${id}`, data),
  delete: (id) => api.delete(`/candidate-activities/${id}`),
  
  // Activity analytics
  getActivitySummary: (candidateId) => api.get(`/candidate-activities/candidate/${candidateId}/summary`),
  
  // Bulk operations
  bulkCreate: (activities) => api.post('/candidate-activities/bulk', { activities }),
  
  // Activity timeline
  getTimeline: (candidateId, startDate, endDate) => {
    return api.get(`/candidate-activities/candidate/${candidateId}/timeline`, {
      params: { startDate, endDate }
    });
  },

  // Activity types and templates
  getActivityTypes: () => api.get('/candidate-activities/types'),
  getActivityTemplates: () => api.get('/candidate-activities/templates'),

  // Export activities
  exportActivities: (candidateId, format = 'xlsx') => {
    return api.get(`/candidate-activities/candidate/${candidateId}/export`, {
      params: { format },
      responseType: 'blob',
    });
  },
};

// Original Candidates API (for all candidates view) - Enhanced
export const candidatesAPI = {
  getAll: (params = {}) => api.get('/candidates', { params }),
  getById: (id) => api.get(`/candidates/${id}`),
  create: (formData) => {
    return api.post('/candidates', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  update: (id, formData) => {
    return api.put(`/candidates/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  delete: (id) => api.delete(`/candidates/${id}`),
  search: (params) => api.get('/candidates/search', { params }),
  getByStatus: (status) => api.get(`/candidates/status/${status}`),
  downloadResume: (id) => {
    return api.get(`/candidates/${id}/resume`, {
      responseType: 'blob',
    });
  },

  // Enhanced search and filtering
  advancedSearch: (searchCriteria) => {
    return api.post('/candidates/advanced-search', searchCriteria);
  },

  // Candidate matching
  findSimilarCandidates: (id, limit = 10) => {
    return api.get(`/candidates/${id}/similar`, { params: { limit } });
  },

  // Bulk operations
  bulkStatusUpdate: (candidateIds, newStatus) => {
    return api.put('/candidates/bulk/status', {
      candidateIds,
      status: newStatus
    });
  },

  // Analytics
  getCandidateMetrics: () => api.get('/candidates/metrics'),
  getSkillDistribution: () => api.get('/candidates/skills/distribution'),
  getLocationAnalytics: () => api.get('/candidates/locations/analytics'),
};

// Enhanced Vendors API
export const vendorsAPI = {
  getAll: (params = {}) => api.get('/vendors', { params }),
  getById: (id) => api.get(`/vendors/${id}`),
  create: (data) => api.post('/vendors', data),
  update: (id, data) => api.put(`/vendors/${id}`, data),
  delete: (id) => api.delete(`/vendors/${id}`),
  search: (params) => api.get('/vendors/search', { params }),
  getByStatus: (status) => api.get(`/vendors/status/${status}`),
  getTopPerformers: (limit = 10) => api.get(`/vendors/top-performers`, { params: { limit } }),

  // Vendor performance analytics
  getPerformanceMetrics: (id) => api.get(`/vendors/${id}/performance`),
  getSubmissionHistory: (id, params = {}) => api.get(`/vendors/${id}/submissions`, { params }),
  getPlacementHistory: (id, params = {}) => api.get(`/vendors/${id}/placements`, { params }),

  // Vendor relationship management
  addNote: (id, note) => api.post(`/vendors/${id}/notes`, { note }),
  getNotes: (id) => api.get(`/vendors/${id}/notes`),
  updateNote: (id, noteId, note) => api.put(`/vendors/${id}/notes/${noteId}`, { note }),
  deleteNote: (id, noteId) => api.delete(`/vendors/${id}/notes/${noteId}`),

  // Vendor communications
  getContactHistory: (id) => api.get(`/vendors/${id}/contacts`),
  recordContact: (id, contactData) => api.post(`/vendors/${id}/contacts`, contactData),

  // Vendor contracts and agreements
  uploadContract: (id, file) => {
    const formData = new FormData();
    formData.append('contract', file);
    return api.post(`/vendors/${id}/contracts`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  getContracts: (id) => api.get(`/vendors/${id}/contracts`),
  downloadContract: (id, contractId) => {
    return api.get(`/vendors/${id}/contracts/${contractId}`, {
      responseType: 'blob',
    });
  },

  // Bulk operations
  bulkUpdate: (vendorIds, updateData) => {
    return api.put('/vendors/bulk', {
      vendorIds,
      updateData
    });
  },

  bulkStatusUpdate: (vendorIds, status) => {
    return api.put('/vendors/bulk/status', {
      vendorIds,
      status
    });
  },

  // Vendor analytics and reporting
  getVendorAnalytics: () => api.get('/vendors/analytics'),
  exportVendors: (format = 'xlsx') => {
    return api.get('/vendors/export', {
      params: { format },
      responseType: 'blob',
    });
  },
};

// Enhanced Analytics API
export const analyticsAPI = {
  getOverview: () => api.get('/dashboard/stats'),
  getConsultantPerformance: () => api.get('/dashboard/consultant-performance'),
  getVendorAnalytics: () => api.get('/dashboard/vendor-analytics'),
  getSubmissionTrends: (days = 30) => api.get(`/dashboard/submission-trends`, { params: { days } }),
  getSkillDemand: () => api.get('/dashboard/skill-demand'),

  // Advanced analytics
  getPlacementTrends: (period = '3months') => api.get('/analytics/placement-trends', { params: { period } }),
  getCandidateLifecycle: () => api.get('/analytics/candidate-lifecycle'),
  getRevenueAnalytics: (startDate, endDate) => {
    return api.get('/analytics/revenue', {
      params: { startDate, endDate }
    });
  },
  getMarketAnalytics: () => api.get('/analytics/market-trends'),
  getCompetitorAnalysis: () => api.get('/analytics/competitors'),

  // Custom reports
  generateReport: (reportConfig) => {
    return api.post('/analytics/reports/generate', reportConfig, {
      responseType: 'blob',
    });
  },
  
  getReportTemplates: () => api.get('/analytics/reports/templates'),
  saveReportTemplate: (template) => api.post('/analytics/reports/templates', template),

  // Real-time analytics
  getLiveMetrics: () => api.get('/analytics/live-metrics'),
  getDashboardWidgets: () => api.get('/analytics/dashboard-widgets'),
  
  // Export capabilities
  exportAnalytics: (type, format = 'xlsx') => {
    return api.get(`/analytics/export/${type}`, {
      params: { format },
      responseType: 'blob',
    });
  },
};

// File Upload Utilities
export const fileUploadAPI = {
  // Validate file before upload
  validateFile: (file, allowedTypes = [], maxSize = 10 * 1024 * 1024) => {
    const errors = [];
    
    if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
      errors.push(`File type ${file.type} is not allowed`);
    }
    
    if (file.size > maxSize) {
      errors.push(`File size exceeds ${maxSize / 1024 / 1024}MB limit`);
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  },

  // Get file preview URL
  getPreviewUrl: (file) => {
    if (file.type.startsWith('image/')) {
      return URL.createObjectURL(file);
    }
    return null;
  },

  // Format file size for display
  formatFileSize: (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  // Get file icon based on type
  getFileIcon: (filename) => {
    const ext = filename?.split('.').pop()?.toLowerCase() || '';
    const iconMap = {
      pdf: '📄',
      doc: '📝',
      docx: '📝',
      xls: '📊',
      xlsx: '📊',
      ppt: '📽️',
      pptx: '📽️',
      txt: '📄',
      jpg: '🖼️',
      jpeg: '🖼️',
      png: '🖼️',
      gif: '🖼️',
      mp4: '🎥',
      avi: '🎥',
      mov: '🎥',
      mp3: '🎵',
      wav: '🎵',
      zip: '🗜️',
      rar: '🗜️',
      '7z': '🗜️',
      default: '📎'
    };
    return iconMap[ext] || iconMap.default;
  },
};

// System Configuration API
export const systemAPI = {
  getConfig: () => api.get('/system/config'),
  updateConfig: (config) => api.put('/system/config', config),
  getVersion: () => api.get('/system/version'),
  getHealth: () => api.get('/system/health'),
  
  // System logs and monitoring
  getLogs: (params = {}) => api.get('/system/logs', { params }),
  getSystemMetrics: () => api.get('/system/metrics'),
  
  // Backup and restore
  createBackup: () => api.post('/system/backup'),
  getBackups: () => api.get('/system/backups'),
  restoreBackup: (backupId) => api.post(`/system/restore/${backupId}`),
  
  // Cache management
  clearCache: (cacheType = 'all') => api.post('/system/cache/clear', { type: cacheType }),
  getCacheStatus: () => api.get('/system/cache/status'),
};

// Notification API
export const notificationAPI = {
  getAll: (params = {}) => api.get('/notifications', { params }),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
  delete: (id) => api.delete(`/notifications/${id}`),
  
  // Push notifications
  subscribe: (subscription) => api.post('/notifications/subscribe', subscription),
  unsubscribe: (subscriptionId) => api.delete(`/notifications/subscribe/${subscriptionId}`),
  
  // Email notifications
  getEmailSettings: () => api.get('/notifications/email/settings'),
  updateEmailSettings: (settings) => api.put('/notifications/email/settings', settings),
  
  // System notifications
  sendBulkNotification: (notificationData) => api.post('/notifications/bulk', notificationData),
};

// Export default API instance
export default api;