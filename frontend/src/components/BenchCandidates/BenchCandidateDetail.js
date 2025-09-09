import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { benchCandidatesAPI, candidateActivitiesAPI } from '../../services/api';
import toast from 'react-hot-toast';

const BenchCandidateDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [candidate, setCandidate] = useState(null);
  const [activities, setActivities] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showActivityForm, setShowActivityForm] = useState(false);
  const [activeTab, setActiveTab] = useState('documents');
  const [documentPreview, setDocumentPreview] = useState(null);
  const [uploadingDocuments, setUploadingDocuments] = useState(false);
  
  const [activityForm, setActivityForm] = useState({
    activityType: 'APPLIED',
    clientName: '',
    contactPerson: '',
    contactPhone: '',
    contactEmail: '',
    submittedRate: '',
    notes: '',
    activityDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchCandidateDetails();
    fetchActivities();
    fetchDocuments();
  }, [id]);

  const fetchCandidateDetails = async () => {
    try {
      const response = await benchCandidatesAPI.getById(id);
      setCandidate(response.data);
    } catch (error) {
      toast.error('Failed to load candidate details');
      navigate('/bench-candidates');
    } finally {
      setLoading(false);
    }
  };

  const fetchActivities = async () => {
    try {
      const response = await candidateActivitiesAPI.getByCandidateId(id);
      setActivities(response.data);
    } catch (error) {
      console.error('Failed to load activities:', error);
    }
  };

  const fetchDocuments = async () => {
    try {
      const response = await benchCandidatesAPI.getDocuments(id);
      setDocuments(response.data || []);
    } catch (error) {
      console.error('Failed to load documents:', error);
    }
  };

  const handleActivityFormChange = (e) => {
    setActivityForm({
      ...activityForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleAddActivity = async (e) => {
    e.preventDefault();
    try {
      await candidateActivitiesAPI.create({
        ...activityForm,
        candidateId: id
      });
      toast.success('Activity added successfully!');
      setShowActivityForm(false);
      setActivityForm({
        activityType: 'APPLIED',
        clientName: '',
        contactPerson: '',
        contactPhone: '',
        contactEmail: '',
        submittedRate: '',
        notes: '',
        activityDate: new Date().toISOString().split('T')[0]
      });
      fetchActivities();
    } catch (error) {
      toast.error('Failed to add activity');
    }
  };

  const handleDocumentUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploadingDocuments(true);
    try {
      for (const file of files) {
        await benchCandidatesAPI.uploadDocument(id, file);
      }
      toast.success(`${files.length} document(s) uploaded successfully!`);
      fetchDocuments();
      e.target.value = ''; // Reset file input
    } catch (error) {
      toast.error('Failed to upload documents');
    } finally {
      setUploadingDocuments(false);
    }
  };

  const handleDownloadDocument = async (documentId, filename) => {
    try {
      const response = await benchCandidatesAPI.downloadDocument(id, documentId);
      
      // Create blob from response data
      const blob = new Blob([response.data], { 
        type: response.headers['content-type'] || 'application/octet-stream' 
      });
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('Document downloaded successfully!');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download document');
    }
  };

  const handlePreviewDocument = async (documentId, filename) => {
    try {
      const response = await benchCandidatesAPI.downloadDocument(id, documentId);
      const blob = new Blob([response.data], { 
        type: response.headers['content-type'] || 'application/octet-stream' 
      });
      const url = window.URL.createObjectURL(blob);
      
      setDocumentPreview({
        url,
        filename,
        type: filename.split('.').pop().toLowerCase(),
        contentType: response.headers['content-type']
      });
    } catch (error) {
      console.error('Preview error:', error);
      toast.error('Failed to preview document');
    }
  };

  const handleDeleteDocument = async (documentId) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      try {
        await benchCandidatesAPI.deleteDocument(id, documentId);
        toast.success('Document deleted successfully!');
        fetchDocuments();
      } catch (error) {
        toast.error('Failed to delete document');
      }
    }
  };

  // Enhanced LinkedIn URL handler
  const handleLinkedInClick = (linkedinUrl) => {
    if (!linkedinUrl) {
      toast.error('No LinkedIn URL available');
      return;
    }

    // Clean and format the URL
    let formattedUrl = linkedinUrl.trim();
    
    // Add https:// if no protocol is present
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      // Check if it starts with www. or linkedin.com
      if (formattedUrl.startsWith('www.') || formattedUrl.startsWith('linkedin.com')) {
        formattedUrl = 'https://' + formattedUrl;
      } else if (formattedUrl.startsWith('in/')) {
        // Handle cases like "in/username"
        formattedUrl = 'https://www.linkedin.com/' + formattedUrl;
      } else {
        // Assume it's a partial LinkedIn URL
        formattedUrl = 'https://www.linkedin.com/in/' + formattedUrl;
      }
    }

    // Open in new tab/window
    try {
      window.open(formattedUrl, '_blank', 'noopener,noreferrer');
      toast.success('Opening LinkedIn profile in new tab');
    } catch (error) {
      toast.error('Failed to open LinkedIn profile');
      console.error('LinkedIn URL error:', error);
    }
  };

  const getActivityTypeColor = (type) => {
    const colors = {
      'APPLIED': '#3B82F6',
      'SUBMITTED': '#10B981',
      'INTERVIEW_SCHEDULED': '#F59E0B',
      'INTERVIEW_COMPLETED': '#8B5CF6',
      'FEEDBACK_RECEIVED': '#6B7280',
      'REJECTED': '#EF4444',
      'ON_HOLD': '#F97316'
    };
    return colors[type] || '#6B7280';
  };

  const getActivityTypeDisplay = (type) => {
    const displays = {
      'APPLIED': 'Applied',
      'SUBMITTED': 'Submitted',
      'INTERVIEW_SCHEDULED': 'Interview Scheduled',
      'INTERVIEW_COMPLETED': 'Interview Completed',
      'FEEDBACK_RECEIVED': 'Feedback Received',
      'REJECTED': 'Rejected',
      'ON_HOLD': 'On Hold'
    };
    return displays[type] || type;
  };

  const getFileIcon = (filename) => {
    const ext = filename?.split('.').pop()?.toLowerCase() || '';
    switch (ext) {
      case 'pdf': return '📄';
      case 'doc':
      case 'docx': return '📝';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif': return '🖼️';
      case 'xls':
      case 'xlsx': return '📊';
      case 'ppt':
      case 'pptx': return '📽️';
      case 'txt': return '📄';
      default: return '📎';
    }
  };

  const getDocumentTypeColor = (type) => {
    const colors = {
      'I94': '#3B82F6',
      'PASSPORT': '#10B981',
      'RESUME': '#F59E0B',
      'VISA_DOCUMENT': '#8B5CF6',
      'EAD': '#EF4444',
      'SSN': '#06B6D4',
      'DIPLOMA': '#84CC16',
      'TRANSCRIPT': '#F97316',
      'OTHER': '#6B7280'
    };
    return colors[type] || '#6B7280';
  };

  const getDocumentTypeDisplayName = (type) => {
    const displayNames = {
      'I94': 'I-94 Document',
      'PASSPORT': 'Passport',
      'RESUME': 'Resume',
      'VISA_DOCUMENT': 'Visa Document',
      'EAD': 'EAD Card',
      'SSN': 'SSN Card',
      'DIPLOMA': 'Diploma',
      'TRANSCRIPT': 'Transcript',
      'OTHER': 'Other'
    };
    return displayNames[type] || type;
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <div className="loading-spinner"></div>
        <div style={{ marginLeft: '1rem' }}>Loading candidate details...</div>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <h2>Candidate not found</h2>
        <Link to="/bench-candidates" className="btn-primary">Back to Bench Profiles</Link>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1F2937', marginBottom: '0.5rem' }}>
            {candidate.firstName} {candidate.middleName} {candidate.lastName}
          </h1>
          <p style={{ color: '#6B7280' }}>
            Bench Profile Details & Management
          </p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link to={`/bench-candidates/edit/${id}`} className="btn-secondary">
            ✏️ Edit Profile
          </Link>
          <Link to="/bench-candidates" className="btn-secondary">
            ← Back to List
          </Link>
        </div>
      </div>

      {/* Enhanced Candidate Details Card */}
      <div style={{ 
        background: 'white', 
        borderRadius: '12px', 
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        padding: '2rem',
        marginBottom: '2rem'
      }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1.5rem' }}>
          👤 Profile Information
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          <div><strong>Full Name:</strong> {candidate.firstName} {candidate.middleName} {candidate.lastName}</div>
          <div><strong>Phone Number:</strong> {candidate.phoneNumber}</div>
          <div><strong>Email:</strong> {candidate.email}</div>
          <div><strong>Passport Number:</strong> {candidate.passportNumber || 'N/A'}</div>
          <div><strong>Citizenship:</strong> {candidate.countryOfCitizenship || 'N/A'}</div>
          <div><strong>Visa Status:</strong> {candidate.visaStatus}</div>
        </div>

        {/* Address Section */}
        {(candidate.address1 || candidate.city || candidate.state) && (
          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>
              🏠 Address Information
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '0.75rem' }}>
              {candidate.address1 && <div><strong>Address:</strong> {candidate.address1}</div>}
              {candidate.address2 && <div><strong>Address 2:</strong> {candidate.address2}</div>}
              {candidate.city && <div><strong>City:</strong> {candidate.city}</div>}
              {candidate.state && <div><strong>State:</strong> {candidate.state}</div>}
              {candidate.country && <div><strong>Country:</strong> {candidate.country}</div>}
            </div>
          </div>
        )}

        {/* Immigration Details Section */}
        {(candidate.startDate || candidate.endDate) && (
          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>
              🛂 Immigration Details
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
              <div><strong>Visa Status:</strong> {candidate.visaStatus}</div>
              {candidate.startDate && <div><strong>Start Date:</strong> {new Date(candidate.startDate).toLocaleDateString()}</div>}
              {candidate.endDate && <div><strong>End Date:</strong> {new Date(candidate.endDate).toLocaleDateString()}</div>}
            </div>
          </div>
        )}

        {/* Professional Skills Section */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>
            💼 Professional Skills
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '0.75rem' }}>
            <div><strong>Primary Skill:</strong> {candidate.primarySkill}</div>
            <div><strong>Experience:</strong> {candidate.experienceYears} years</div>
            {candidate.additionalSkills && <div><strong>Additional Skills:</strong> {candidate.additionalSkills}</div>}
            {candidate.domains && candidate.domains.length > 0 && (
              <div style={{ gridColumn: '1 / -1' }}>
                <strong>Domain Experience:</strong>
                <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {candidate.domains.split(',').map((domain, index) => (
                    <span 
                      key={index}
                      style={{
                        backgroundColor: '#F3F4F6',
                        color: '#374151',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '9999px',
                        fontSize: '0.875rem',
                        fontWeight: '500'
                      }}
                    >
                      {domain.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {candidate.targetRate && <div><strong>Target Rate:</strong> ${candidate.targetRate}/hr</div>}
          </div>
        </div>

        {/* LinkedIn Section - Enhanced */}
        {candidate.linkedinUrl && (
          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>
              🔗 Professional Links
            </h4>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <button
                onClick={() => handleLinkedInClick(candidate.linkedinUrl)}
                style={{
                  background: '#0A66C2',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-1px)';
                  e.target.style.boxShadow = '0 4px 12px rgba(10, 102, 194, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                🔗 View LinkedIn Profile
              </button>
              <span style={{ fontSize: '0.875rem', color: '#6B7280' }}>
                {candidate.linkedinUrl}
              </span>
            </div>
          </div>
        )}

        {/* Assigned Consultant */}
        {candidate.assignedConsultantName && (
          <div style={{ marginBottom: '1rem' }}>
            <strong>Assigned Consultant:</strong> {candidate.assignedConsultantName}
          </div>
        )}

        {/* Notes */}
        {candidate.notes && (
          <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#F3F4F6', borderRadius: '8px' }}>
            <strong>Notes:</strong> {candidate.notes}
          </div>
        )}
      </div>

      {/* Tab Navigation */}
      <div style={{ 
        background: 'white', 
        borderRadius: '12px', 
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden'
      }}>
        <div style={{ 
          display: 'flex',
          borderBottom: '2px solid #E5E7EB'
        }}>
          <button
            onClick={() => setActiveTab('documents')}
            style={{
              padding: '1rem 2rem',
              background: activeTab === 'documents' ? '#3B82F6' : 'transparent',
              color: activeTab === 'documents' ? 'white' : '#6B7280',
              border: 'none',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            📄 Documents ({documents.length})
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            style={{
              padding: '1rem 2rem',
              background: activeTab === 'activity' ? '#3B82F6' : 'transparent',
              color: activeTab === 'activity' ? 'white' : '#6B7280',
              border: 'none',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            📊 Daily Activity ({activities.length})
          </button>
          <button
            onClick={() => setActiveTab('progress')}
            style={{
              padding: '1rem 2rem',
              background: activeTab === 'progress' ? '#3B82F6' : 'transparent',
              color: activeTab === 'progress' ? 'white' : '#6B7280',
              border: 'none',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            📈 Progress
          </button>
        </div>

        {/* Tab Content */}
        <div style={{ padding: '2rem' }}>
          {/* Enhanced Documents Tab */}
          {activeTab === 'documents' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '600' }}>
                  Document Library
                </h3>
                <div>
                  <input
                    type="file"
                    id="uploadDocs"
                    multiple
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.xls,.xlsx,.ppt,.pptx,.txt"
                    onChange={handleDocumentUpload}
                    style={{ display: 'none' }}
                    disabled={uploadingDocuments}
                  />
                  <label
                    htmlFor="uploadDocs"
                    className="btn-primary"
                    style={{ 
                      cursor: uploadingDocuments ? 'not-allowed' : 'pointer', 
                      display: 'inline-block',
                      opacity: uploadingDocuments ? 0.6 : 1
                    }}
                  >
                    {uploadingDocuments ? '⏳ Uploading...' : '📎 Upload Documents'}
                  </label>
                </div>
              </div>

              {documents.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1rem' }}>
                  {documents.map((doc) => (
                    <div 
                      key={doc.id}
                      style={{ 
                        border: '1px solid #E5E7EB',
                        borderRadius: '8px',
                        padding: '1.5rem',
                        backgroundColor: '#FAFAFA',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#F3F4F6'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = '#FAFAFA'}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                        <span style={{ fontSize: '2rem', marginRight: '0.75rem' }}>
                          {getFileIcon(doc.originalFilename)}
                        </span>
                        <div style={{ flex: 1 }}>
                          <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.25rem' }}>
                            {getDocumentTypeDisplayName(doc.documentType)}
                          </h4>
                          <p style={{ fontSize: '0.75rem', color: '#6B7280', marginBottom: '0.25rem' }}>
                            {doc.originalFilename}
                          </p>
                          <p style={{ fontSize: '0.75rem', color: '#6B7280' }}>
                            {doc.formattedFileSize} • Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}
                          </p>
                          {doc.documentType && doc.documentType !== 'OTHER' && (
                            <span style={{
                              fontSize: '0.75rem',
                              backgroundColor: `${getDocumentTypeColor(doc.documentType)}20`,
                              color: getDocumentTypeColor(doc.documentType),
                              padding: '0.125rem 0.5rem',
                              borderRadius: '9999px',
                              marginTop: '0.25rem',
                              display: 'inline-block',
                              fontWeight: '600'
                            }}>
                              {doc.documentType.replace('_', ' ')}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <button
                          onClick={() => handlePreviewDocument(doc.id, doc.originalFilename)}
                          style={{
                            background: '#3B82F6',
                            color: 'white',
                            border: 'none',
                            padding: '0.5rem 1rem',
                            borderRadius: '6px',
                            fontSize: '0.875rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem'
                          }}
                        >
                          👁️ Preview
                        </button>
                        <button
                          onClick={() => handleDownloadDocument(doc.id, doc.originalFilename)}
                          style={{
                            background: '#10B981',
                            color: 'white',
                            border: 'none',
                            padding: '0.5rem 1rem',
                            borderRadius: '6px',
                            fontSize: '0.875rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem'
                          }}
                        >
                          ⬇️ Download
                        </button>
                        <button
                          onClick={() => handleDeleteDocument(doc.id)}
                          style={{
                            background: '#EF4444',
                            color: 'white',
                            border: 'none',
                            padding: '0.5rem 1rem',
                            borderRadius: '6px',
                            fontSize: '0.875rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem'
                          }}
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#6B7280' }}>
                  <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📄</div>
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No documents uploaded yet</h3>
                  <p style={{ fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                    Upload I-94, passport, resume, visa documents, and other important files
                  </p>
                  <label
                    htmlFor="uploadDocs"
                    className="btn-primary"
                    style={{ cursor: 'pointer', display: 'inline-block' }}
                  >
                    📎 Upload First Document
                  </label>
                </div>
              )}
            </div>
          )}

          {/* Daily Activity Tab */}
          {activeTab === 'activity' && (
            <div>
              <div style={{ 
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.5rem'
              }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '600' }}>
                  📊 Daily Activities & Progress
                </h3>
                <button 
                  onClick={() => setShowActivityForm(!showActivityForm)}
                  className="btn-primary"
                >
                  {showActivityForm ? 'Cancel' : '+ Add Today\'s Activity'}
                </button>
              </div>

              {/* Activity Form */}
              {showActivityForm && (
                <div style={{ padding: '2rem', borderBottom: '1px solid #E5E7EB', backgroundColor: '#F9FAFB', borderRadius: '8px', marginBottom: '2rem' }}>
                  <h4 style={{ marginBottom: '1rem', fontSize: '1.125rem', fontWeight: '600' }}>
                    Record Today's Activity for {candidate.firstName} {candidate.lastName}
                  </h4>
                  <form onSubmit={handleAddActivity}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                      <div className="form-group">
                        <label className="form-label">Activity Type *</label>
                        <select
                          name="activityType"
                          className="form-input"
                          value={activityForm.activityType}
                          onChange={handleActivityFormChange}
                          required
                        >
                          <option value="APPLIED">Applied to Job</option>
                          <option value="SUBMITTED">Submitted to Client</option>
                          <option value="INTERVIEW_SCHEDULED">Interview Scheduled</option>
                          <option value="INTERVIEW_COMPLETED">Interview Completed</option>
                          <option value="FEEDBACK_RECEIVED">Feedback Received</option>
                          <option value="REJECTED">Rejected</option>
                          <option value="ON_HOLD">On Hold</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label className="form-label">Client/Company Name *</label>
                        <input
                          type="text"
                          name="clientName"
                          className="form-input"
                          value={activityForm.clientName}
                          onChange={handleActivityFormChange}
                          required
                          placeholder="e.g. Google, Microsoft, Amazon"
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Point of Contact</label>
                        <input
                          type="text"
                          name="contactPerson"
                          className="form-input"
                          value={activityForm.contactPerson}
                          onChange={handleActivityFormChange}
                          placeholder="Contact person name"
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Contact Phone</label>
                        <input
                          type="tel"
                          name="contactPhone"
                          className="form-input"
                          value={activityForm.contactPhone}
                          onChange={handleActivityFormChange}
                          placeholder="(555) 123-4567"
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Contact Email</label>
                        <input
                          type="email"
                          name="contactEmail"
                          className="form-input"
                          value={activityForm.contactEmail}
                          onChange={handleActivityFormChange}
                          placeholder="contact@company.com"
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Submitted Rate ($/hr)</label>
                        <input
                          type="number"
                          name="submittedRate"
                          className="form-input"
                          value={activityForm.submittedRate}
                          onChange={handleActivityFormChange}
                          min="0"
                          step="0.01"
                          placeholder="e.g. 85"
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Activity Date *</label>
                        <input
                          type="date"
                          name="activityDate"
                          className="form-input"
                          value={activityForm.activityDate}
                          onChange={handleActivityFormChange}
                          required
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Notes</label>
                      <textarea
                        name="notes"
                        className="form-input"
                        value={activityForm.notes}
                        onChange={handleActivityFormChange}
                        rows="3"
                        placeholder="Additional notes about this activity..."
                      />
                    </div>

                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <button type="submit" className="btn-primary">
                        Add Activity
                      </button>
                      <button 
                        type="button" 
                        onClick={() => setShowActivityForm(false)}
                        className="btn-secondary"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Activities List */}
              {activities.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {activities.map((activity) => (
                    <div 
                      key={activity.id}
                      style={{ 
                        border: '1px solid #E5E7EB',
                        borderRadius: '8px',
                        padding: '1.5rem',
                        backgroundColor: '#FAFAFA'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <span 
                            style={{
                              background: getActivityTypeColor(activity.activityType),
                              color: 'white',
                              padding: '0.5rem 1rem',
                              borderRadius: '9999px',
                              fontSize: '0.875rem',
                              fontWeight: '600'
                            }}
                          >
                            {getActivityTypeDisplay(activity.activityType)}
                          </span>
                          <strong style={{ fontSize: '1.1rem' }}>{activity.clientName}</strong>
                        </div>
                        <span style={{ color: '#6B7280', fontSize: '0.875rem', fontWeight: '500' }}>
                          {new Date(activity.activityDate).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', fontSize: '0.875rem', marginBottom: '1rem' }}>
                        {activity.contactPerson && <div><strong>Contact:</strong> {activity.contactPerson}</div>}
                        {activity.contactPhone && <div><strong>Phone:</strong> {activity.contactPhone}</div>}
                        {activity.contactEmail && <div><strong>Email:</strong> {activity.contactEmail}</div>}
                        {activity.submittedRate && <div><strong>Rate:</strong> <span style={{ color: '#10B981', fontWeight: '600' }}>${activity.submittedRate}/hr</span></div>}
                      </div>
                      
                      {activity.notes && (
                        <div style={{ marginTop: '0.75rem', fontSize: '0.875rem', color: '#6B7280', fontStyle: 'italic', padding: '0.5rem', backgroundColor: '#F3F4F6', borderRadius: '4px' }}>
                          <strong>Notes:</strong> {activity.notes}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', color: '#6B7280', padding: '3rem' }}>
                  <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📊</div>
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No activities recorded yet</h3>
                  <p style={{ fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                    Start tracking daily progress by clicking "Add Today's Activity" above
                  </p>
                  <button 
                    onClick={() => setShowActivityForm(true)}
                    className="btn-primary"
                  >
                    Add First Activity
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Progress Tab */}
          {activeTab === 'progress' && (
            <div>
              <div style={{ 
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.5rem'
              }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '600' }}>
                  📈 Candidate Progress
                </h3>
              </div>
              
              <div>
                {activities.length > 0 ? (
                  <>
                    <div style={{ marginBottom: '2rem' }}>
                      <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem' }}>Activity Summary</h4>
                      <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                        gap: '1rem' 
                      }}>
                        <div style={{ 
                          backgroundColor: '#F0F9FF', 
                          padding: '1.5rem', 
                          borderRadius: '8px',
                          border: '1px solid #DBEAFE'
                        }}>
                          <div style={{ fontSize: '2rem', fontWeight: '700', color: '#3B82F6' }}>{activities.length}</div>
                          <div>Total Activities</div>
                        </div>
                        <div style={{ 
                          backgroundColor: '#F0FDF4', 
                          padding: '1.5rem', 
                          borderRadius: '8px',
                          border: '1px solid #DCFCE7'
                        }}>
                          <div style={{ fontSize: '2rem', fontWeight: '700', color: '#10B981' }}>
                            {activities.filter(a => a.activityType === 'SUBMITTED').length}
                          </div>
                          <div>Submissions</div>
                        </div>
                        <div style={{ 
                          backgroundColor: '#FFFBEB', 
                          padding: '1.5rem', 
                          borderRadius: '8px',
                          border: '1px solid #FEF3C7'
                        }}>
                          <div style={{ fontSize: '2rem', fontWeight: '700', color: '#F59E0B' }}>
                            {activities.filter(a => 
                              a.activityType === 'INTERVIEW_SCHEDULED' || 
                              a.activityType === 'INTERVIEW_COMPLETED'
                            ).length}
                          </div>
                          <div>Interviews</div>
                        </div>
                        <div style={{ 
                          backgroundColor: '#FEF2F2', 
                          padding: '1.5rem', 
                          borderRadius: '8px',
                          border: '1px solid #FECACA'
                        }}>
                          <div style={{ fontSize: '2rem', fontWeight: '700', color: '#EF4444' }}>
                            {activities.filter(a => a.activityType === 'REJECTED').length}
                          </div>
                          <div>Rejections</div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem' }}>Recent Activity Timeline</h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {activities.slice(0, 5).map((activity, index) => (
                          <div 
                            key={activity.id} 
                            style={{ 
                              display: 'flex', 
                              padding: '0.75rem',
                              borderLeft: `3px solid ${getActivityTypeColor(activity.activityType)}`,
                              backgroundColor: index % 2 === 0 ? '#F9FAFB' : 'white'
                            }}
                          >
                            <div style={{ width: '120px', fontSize: '0.875rem', color: '#6B7280' }}>
                              {new Date(activity.activityDate).toLocaleDateString()}
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: '600' }}>
                                {getActivityTypeDisplay(activity.activityType)} - {activity.clientName}
                              </div>
                              {activity.submittedRate && (
                                <div style={{ fontSize: '0.875rem' }}>
                                  Rate: <span style={{ color: '#10B981', fontWeight: '600' }}>${activity.submittedRate}/hr</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <div style={{ textAlign: 'center', color: '#6B7280', padding: '3rem' }}>
                    <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📈</div>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No progress data available</h3>
                    <p style={{ fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                      Add daily activities to start tracking this candidate's progress
                    </p>
                    <button 
                      onClick={() => {
                        setActiveTab('activity');
                        setShowActivityForm(true);
                      }}
                      className="btn-primary"
                    >
                      Add Activity Data
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Document Preview Modal */}
      {documentPreview && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            maxWidth: '90vw',
            maxHeight: '90vh',
            overflow: 'auto',
            position: 'relative'
          }}>
            <div style={{
              padding: '1rem 2rem',
              borderBottom: '1px solid #E5E7EB',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h3>{documentPreview.filename}</h3>
              <button
                onClick={() => {
                  if (documentPreview.url) {
                    URL.revokeObjectURL(documentPreview.url);
                  }
                  setDocumentPreview(null);
                }}
                style={{
                  background: '#EF4444',
                  color: 'white',
                  border: 'none',
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                ✕ Close
              </button>
            </div>
            <div style={{ padding: '2rem', textAlign: 'center' }}>
              {documentPreview.type === 'pdf' ? (
                <iframe
                  src={documentPreview.url}
                  style={{ width: '70vw', height: '70vh', border: 'none' }}
                  title="Document Preview"
                />
              ) : ['jpg', 'jpeg', 'png', 'gif'].includes(documentPreview.type) ? (
                <img
                  src={documentPreview.url}
                  alt="Document Preview"
                  style={{ maxWidth: '100%', maxHeight: '70vh' }}
                />
              ) : (
                <div>
                  <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📄</div>
                  <p>Preview not available for this file type.</p>
                  <button
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = documentPreview.url;
                      link.download = documentPreview.filename;
                      link.click();
                    }}
                    className="btn-primary"
                    style={{ marginTop: '1rem' }}
                  >
                    Download File
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BenchCandidateDetail;