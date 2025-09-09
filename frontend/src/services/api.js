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

// Enhanced Bench Candidates API with FIXED document management
export const benchCandidatesAPI = {
  getAll: (params = {}) => api.get('/bench-candidates', { params }),
  getById: (id) => api.get(`/bench-candidates/${id}`),
  
  // FIXED: Create with proper FormData handling for multiple files
  create: (formData) => {
    return api.post('/bench-candidates', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 300000, // 5 minutes for large file uploads
    });
  },
  
  // FIXED: Update with proper FormData handling
  update: (id, formData) => {
    return api.put(`/bench-candidates/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 300000, // 5 minutes for large file uploads
    });
  },
  
  delete: (id) => api.delete(`/bench-candidates/${id}`),
  search: (params) => api.get('/bench-candidates/search', { params }),
  
  // FIXED: Enhanced Document Management APIs with proper error handling
  getDocuments: (candidateId) => {
    return api.get(`/bench-candidates/${candidateId}/documents`)
      .catch(error => {
        console.error('Error fetching documents:', error);
        return { data: [] }; // Return empty array on error
      });
  },
  
  // FIXED: Single document upload with enhanced error handling
  uploadDocument: (candidateId, file, documentType = 'OTHER') => {
    const formData = new FormData();
    formData.append('file', file);
    
    // Add document type parameter
    const params = new URLSearchParams();
    params.append('documentType', documentType);
    
    return api.post(`/bench-candidates/${candidateId}/documents?${params.toString()}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 300000, // 5 minutes timeout
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        console.log(`Upload Progress: ${percentCompleted}%`);
      },
    });
  },
  
  // FIXED: Multiple documents upload with proper types handling
  uploadMultipleDocuments: (candidateId, files) => {
    const formData = new FormData();
    
    // Append all files
    Array.from(files).forEach((file, index) => {
      formData.append('files', file);
    });
    
    return api.post(`/bench-candidates/${candidateId}/documents/multiple`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 600000, // 10 minutes for multiple files
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        console.log(`Multiple Upload Progress: ${percentCompleted}%`);
      },
    });
  },

  // FIXED: Enhanced document download with proper blob handling
  downloadDocument: (candidateId, documentId) => {
    return api.get(`/bench-candidates/${candidateId}/documents/${documentId}`, {
      responseType: 'blob',
      timeout: 120000, // 2 minutes timeout for downloads
      headers: {
        'Accept': 'application/octet-stream',
      },
    }).catch(error => {
      console.error('Download failed:', error);
      throw new Error('Failed to download document. Please try again.');
    });
  },

  // FIXED: Document preview with enhanced file type support
  previewDocument: (candidateId, documentId) => {
    return api.get(`/bench-candidates/${candidateId}/documents/${documentId}`, {
      responseType: 'blob',
      timeout: 120000,
      headers: {
        'Accept': 'application/pdf,image/*,text/*',
      },
    }).catch(error => {
      console.error('Preview failed:', error);
      throw new Error('Failed to preview document. Please try downloading instead.');
    });
  },

  // FIXED: Delete document with proper error handling
  deleteDocument: (candidateId, documentId) => {
    return api.delete(`/bench-candidates/${candidateId}/documents/${documentId}`)
      .catch(error => {
        console.error('Delete failed:', error);
        throw new Error('Failed to delete document. Please try again.');
      });
  },

  // FIXED: Get document info with fallback
  getDocumentInfo: (candidateId, documentId) => {
    return api.get(`/bench-candidates/${candidateId}/documents/${documentId}/info`)
      .catch(error => {
        console.error('Failed to get document info:', error);
        return { data: null };
      });
  },

  // FIXED: Legacy resume download with enhanced error handling
  downloadResume: (id) => {
    return api.get(`/bench-candidates/${id}/resume`, {
      responseType: 'blob',
      timeout: 120000,
      headers: {
        'Accept': 'application/octet-stream',
      },
    }).catch(error => {
      console.error('Resume download failed:', error);
      throw new Error('Failed to download resume. Please check if resume exists.');
    });
  },

  // ENHANCED: Bulk operations with better error handling
  bulkDelete: (candidateIds) => {
    return api.delete('/bench-candidates/bulk', {
      data: { ids: candidateIds },
      timeout: 60000,
    }).catch(error => {
      console.error('Bulk delete failed:', error);
      throw new Error('Failed to delete candidates. Please try again.');
    });
  },

  // ENHANCED: Advanced search with timeout
  advancedSearch: (searchCriteria) => {
    return api.post('/bench-candidates/advanced-search', searchCriteria, {
      timeout: 30000,
    });
  },

  // ENHANCED: Export functionality
  exportCandidates: (candidateIds, format = 'xlsx') => {
    return api.post('/bench-candidates/export', 
      { candidateIds, format },
      {
        responseType: 'blob',
        timeout: 180000, // 3 minutes for exports
      }
    );
  },

  // ENHANCED: Get statistics
  getStatistics: () => {
    return api.get('/bench-candidates/statistics');
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
  
  // Enhanced statistics
  getStatistics: () => {
    return api.get('/working-candidates/statistics');
  },
};

// Enhanced Candidate Activities API
export const candidateActivitiesAPI = {
  getByCandidateId: (candidateId) => {
    return api.get(`/candidate-activities/candidate/${candidateId}`)
      .catch(error => {
        console.error('Failed to fetch activities:', error);
        return { data: [] };
      });
  },
  
  create: (data) => {
    return api.post('/candidate-activities', data)
      .catch(error => {
        console.error('Failed to create activity:', error);
        throw new Error('Failed to save activity. Please try again.');
      });
  },
  
  update: (id, data) => api.put(`/candidate-activities/${id}`, data),
  delete: (id) => api.delete(`/candidate-activities/${id}`),
  
  // Enhanced: Get activity summary
  getSummary: (candidateId) => {
    return api.get(`/candidate-activities/candidate/${candidateId}/summary`);
  },
  
  // Enhanced: Export activities
  exportActivities: (candidateId, format = 'xlsx') => {
    return api.get(`/candidate-activities/candidate/${candidateId}/export`, {
      params: { format },
      responseType: 'blob',
    });
  },
};

// Original Candidates API (for legacy support)
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
};

// Enhanced Analytics API
export const analyticsAPI = {
  getOverview: () => api.get('/dashboard/stats'),
  getConsultantPerformance: () => {
    return api.get('/dashboard/consultant-performance')
      .catch(() => ({ data: {} })); // Return empty object on error
  },
  getVendorAnalytics: () => {
    return api.get('/dashboard/vendor-analytics')
      .catch(() => ({ data: {} })); // Return empty object on error
  },
  getSubmissionTrends: (days = 30) => {
    return api.get(`/dashboard/submission-trends`, { params: { days } });
  },
  getSkillDemand: () => {
    return api.get('/dashboard/skill-demand');
  },
};

// ENHANCED: File Upload Utilities with comprehensive support
export const fileUploadAPI = {
  // ENHANCED: Validate file with comprehensive type checking
  validateFile: (file, allowedTypes = [], maxSize = 50 * 1024 * 1024) => { // Increased to 50MB
    const errors = [];
    
    // Enhanced file type validation
    const commonDocumentTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
      'text/plain',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/zip',
      'application/x-zip-compressed'
    ];
    
    const defaultAllowedTypes = allowedTypes.length > 0 ? allowedTypes : commonDocumentTypes;
    
    if (!defaultAllowedTypes.includes(file.type)) {
      errors.push(`File type "${file.type}" is not supported. Please upload PDF, Word, Excel, or Image files.`);
    }
    
    if (file.size > maxSize) {
      errors.push(`File size exceeds ${Math.round(maxSize / 1024 / 1024)}MB limit. Current size: ${this.formatFileSize(file.size)}`);
    }
    
    if (file.size === 0) {
      errors.push('File appears to be empty. Please select a valid file.');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      fileInfo: {
        name: file.name,
        size: this.formatFileSize(file.size),
        type: file.type,
        lastModified: new Date(file.lastModified).toLocaleDateString()
      }
    };
  },

  // ENHANCED: Get file preview URL with better error handling
  getPreviewUrl: (file) => {
    try {
      if (file.type.startsWith('image/') || file.type === 'application/pdf') {
        return URL.createObjectURL(file);
      }
      return null;
    } catch (error) {
      console.error('Failed to create preview URL:', error);
      return null;
    }
  },

  // ENHANCED: Format file size with better precision
  formatFileSize: (bytes) => {
    if (bytes === 0) return '0 Bytes';
    if (bytes < 0) return 'Invalid size';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const size = (bytes / Math.pow(k, i)).toFixed(i === 0 ? 0 : 1);
    
    return `${size} ${sizes[i]}`;
  },

  // ENHANCED: Get file icon with comprehensive type mapping
  getFileIcon: (filename) => {
    if (!filename) return '📎';
    
    const ext = filename.split('.').pop()?.toLowerCase() || '';
    const iconMap = {
      // Documents
      pdf: '📄',
      doc: '📝',
      docx: '📝',
      txt: '📄',
      rtf: '📄',
      
      // Spreadsheets
      xls: '📊',
      xlsx: '📊',
      csv: '📊',
      
      // Presentations
      ppt: '📽️',
      pptx: '📽️',
      
      // Images
      jpg: '🖼️',
      jpeg: '🖼️',
      png: '🖼️',
      gif: '🖼️',
      bmp: '🖼️',
      webp: '🖼️',
      svg: '🖼️',
      
      // Videos
      mp4: '🎥',
      avi: '🎥',
      mov: '🎥',
      wmv: '🎥',
      flv: '🎥',
      webm: '🎥',
      
      // Audio
      mp3: '🎵',
      wav: '🎵',
      flac: '🎵',
      aac: '🎵',
      
      // Archives
      zip: '🗜️',
      rar: '🗜️',
      '7z': '🗜️',
      tar: '🗜️',
      gz: '🗜️',
      
      // Code files
      js: '💻',
      html: '💻',
      css: '💻',
      java: '💻',
      py: '💻',
      cpp: '💻',
      c: '💻',
      
      // Default
      default: '📎'
    };
    
    return iconMap[ext] || iconMap.default;
  },

  // ENHANCED: Get file category for better organization
  getFileCategory: (filename) => {
    if (!filename) return 'other';
    
    const ext = filename.split('.').pop()?.toLowerCase() || '';
    
    if (['pdf', 'doc', 'docx', 'txt', 'rtf'].includes(ext)) return 'document';
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'].includes(ext)) return 'image';
    if (['xls', 'xlsx', 'csv'].includes(ext)) return 'spreadsheet';
    if (['ppt', 'pptx'].includes(ext)) return 'presentation';
    if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'].includes(ext)) return 'video';
    if (['mp3', 'wav', 'flac', 'aac'].includes(ext)) return 'audio';
    if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) return 'archive';
    
    return 'other';
  },

  // ENHANCED: Check if file can be previewed
  canPreview: (filename) => {
    if (!filename) return false;
    
    const ext = filename.split('.').pop()?.toLowerCase() || '';
    const previewableTypes = ['pdf', 'jpg', 'jpeg', 'png', 'gif', 'webp', 'txt'];
    
    return previewableTypes.includes(ext);
  },

  // ENHANCED: Generate thumbnail for supported files
  generateThumbnail: async (file, maxSize = 200) => {
    return new Promise((resolve, reject) => {
      if (!file.type.startsWith('image/')) {
        reject(new Error('Thumbnails only supported for images'));
        return;
      }

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate thumbnail dimensions
        const { width, height } = img;
        const aspectRatio = width / height;
        
        let thumbnailWidth, thumbnailHeight;
        if (width > height) {
          thumbnailWidth = Math.min(maxSize, width);
          thumbnailHeight = thumbnailWidth / aspectRatio;
        } else {
          thumbnailHeight = Math.min(maxSize, height);
          thumbnailWidth = thumbnailHeight * aspectRatio;
        }

        canvas.width = thumbnailWidth;
        canvas.height = thumbnailHeight;

        // Draw thumbnail
        ctx.drawImage(img, 0, 0, thumbnailWidth, thumbnailHeight);
        
        // Convert to blob
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(URL.createObjectURL(blob));
          } else {
            reject(new Error('Failed to generate thumbnail'));
          }
        }, 'image/jpeg', 0.8);
      };

      img.onerror = () => {
        reject(new Error('Failed to load image for thumbnail'));
      };

      img.src = URL.createObjectURL(file);
    });
  }
};

// ENHANCED: System utilities
export const systemAPI = {
  getHealth: () => api.get('/system/health'),
  getVersion: () => api.get('/system/version'),
  
  // Enhanced error reporting
  reportError: (errorData) => {
    return api.post('/system/error-report', {
      ...errorData,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    });
  },
  
  // Enhanced logging
  logActivity: (activity) => {
    return api.post('/system/activity-log', {
      ...activity,
      timestamp: new Date().toISOString()
    });
  }
};

// Export default API instance
export default api;