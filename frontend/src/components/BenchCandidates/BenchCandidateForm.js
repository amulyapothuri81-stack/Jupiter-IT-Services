import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { benchCandidatesAPI, employeesAPI } from '../../services/api';
import toast from 'react-hot-toast';
import './BenchCandidateForm.css';

const BenchCandidateForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    // Personal Details
    firstName: '',
    middleName: '',
    lastName: '',
    phoneNumber: '',
    email: '',
    passportNumber: '',
    countryOfCitizenship: '',
    linkedinUrl: '',
    
    // Address
    address1: '',
    address2: '',
    city: '',
    state: '',
    country: '',
    
    // Immigration Details
    visaStatus: 'H1B',
    otherVisaStatus: '',
    startDate: '',
    endDate: '',
    visaNotes: '', // New field for immigration notes
    
    // Professional Skills
    primarySkill: '',
    otherPrimarySkill: '',
    additionalSkills: '',
    yearsOfExperience: '',
    domains: [],
    
    // Additional
    targetRate: '',
    assignedConsultantId: '',
    notes: ''
  });

  const [employees, setEmployees] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingCandidate, setLoadingCandidate] = useState(isEdit);
  const [primarySkillSearch, setPrimarySkillSearch] = useState('');
  const [showPrimarySkillDropdown, setShowPrimarySkillDropdown] = useState(false);

  // Predefined options
  const visaStatusOptions = [
    'H1B', 'H4EAD', 'L1', 'L2EAD', 'OPT', 'STEM OPT', 'CPT', 'F1', 'GC', 'CITIZEN', 'OTHER'
  ];

  const primarySkillOptions = [
    'Full Stack Developer', 'Java Developer', 'React Developer', 'Angular Developer', 
    'Node.js Developer', 'Python Developer', '.NET Developer', 'C# Developer',
    'DevOps Engineer', 'Data Engineer', 'Data Scientist', 'Machine Learning Engineer', 
    'Cloud Architect', 'AWS Developer', 'Azure Developer', 'UI/UX Designer', 
    'Frontend Developer', 'Backend Developer', 'Mobile App Developer', 'iOS Developer',
    'Android Developer', 'QA Engineer', 'Test Automation Engineer', 'Scrum Master',
    'Product Manager', 'Business Analyst', 'Salesforce Developer', 'SAP Consultant',
    'Database Administrator', 'Network Engineer', 'Security Engineer', 'Blockchain Developer'
  ];

  const domainOptions = [
    'Banking & Financial Services', 'Healthcare', 'Telecommunications', 'E-commerce',
    'Insurance', 'Manufacturing', 'Retail', 'Education', 'Government', 'Media & Entertainment',
    'Real Estate', 'Transportation & Logistics', 'Energy & Utilities', 'Travel & Hospitality',
    'Automotive', 'Pharmaceuticals', 'Technology', 'Consulting', 'Non-profit', 'Other'
  ];

  const documentTypeOptions = [
    { value: 'RESUME', label: 'Resume/CV' },
    { value: 'I94', label: 'I-94 Document' },
    { value: 'PASSPORT', label: 'Passport' },
    { value: 'VISA_DOCUMENT', label: 'Visa Document' },
    { value: 'EAD', label: 'EAD Card' },
    { value: 'SSN', label: 'SSN Card' },
    { value: 'DIPLOMA', label: 'Diploma/Degree' },
    { value: 'TRANSCRIPT', label: 'Transcript' },
    { value: 'OTHER', label: 'Other' }
  ];

  const countries = [
    'United States', 'India', 'Canada', 'United Kingdom', 'Australia', 'Germany',
    'France', 'China', 'Japan', 'South Korea', 'Brazil', 'Mexico', 'Argentina',
    'Philippines', 'Pakistan', 'Bangladesh', 'Nepal', 'Sri Lanka', 'Other'
  ];

  useEffect(() => {
    fetchEmployees();
    if (isEdit) {
      fetchCandidate();
    }
  }, [id, isEdit]);

  const fetchEmployees = async () => {
    try {
      const response = await employeesAPI.getAll();
      setEmployees(response.data);
    } catch (error) {
      toast.error('Failed to load employees');
    }
  };

  const fetchCandidate = async () => {
    try {
      const response = await benchCandidatesAPI.getById(id);
      const candidate = response.data;
      
      // Map existing fullName to firstName and lastName if needed
      const nameParts = candidate.fullName ? candidate.fullName.split(' ') : [];
      const firstName = nameParts[0] || '';
      const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';
      const middleName = nameParts.length > 2 ? nameParts.slice(1, -1).join(' ') : '';

      setFormData({
        firstName,
        middleName,
        lastName,
        phoneNumber: candidate.phoneNumber || '',
        email: candidate.email || '',
        passportNumber: candidate.passportNumber || '',
        countryOfCitizenship: candidate.countryOfCitizenship || '',
        linkedinUrl: candidate.linkedinUrl || '',
        address1: candidate.address1 || '',
        address2: candidate.address2 || '',
        city: candidate.city || '',
        state: candidate.state || '',
        country: candidate.country || '',
        visaStatus: candidate.visaStatus || 'H1B',
        otherVisaStatus: candidate.otherVisaStatus || '',
        startDate: candidate.startDate || '',
        endDate: candidate.endDate || '',
        visaNotes: candidate.visaNotes || '',
        primarySkill: candidate.primarySkill || '',
        otherPrimarySkill: candidate.otherPrimarySkill || '',
        additionalSkills: candidate.additionalSkills || '',
        yearsOfExperience: candidate.experienceYears || '',
        domains: candidate.domains || [],
        targetRate: candidate.targetRate || '',
        assignedConsultantId: candidate.assignedConsultantId || '',
        notes: candidate.notes || ''
      });
    } catch (error) {
      toast.error('Failed to load candidate details');
      navigate('/bench-candidates');
    } finally {
      setLoadingCandidate(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'domains') {
      const currentDomains = [...formData.domains];
      if (checked) {
        currentDomains.push(value);
      } else {
        const index = currentDomains.indexOf(value);
        if (index > -1) {
          currentDomains.splice(index, 1);
        }
      }
      setFormData({ ...formData, domains: currentDomains });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handlePrimarySkillSearch = (e) => {
    const value = e.target.value;
    setPrimarySkillSearch(value);
    setFormData({ ...formData, primarySkill: value });
    setShowPrimarySkillDropdown(true);
  };

  const selectPrimarySkill = (skill) => {
    setFormData({ ...formData, primarySkill: skill });
    setPrimarySkillSearch(skill);
    setShowPrimarySkillDropdown(false);
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const newDocuments = [...documents];
    
    files.forEach(file => {
      // Validate file types - support more types
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'image/bmp',
        'image/webp',
        'text/plain'
      ];
      
      if (!allowedTypes.includes(file.type)) {
        toast.error(`File type ${file.type} is not supported. Please upload PDF, Word documents, or images.`);
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`File ${file.name} is too large. Maximum size is 10MB.`);
        return;
      }

      newDocuments.push({
        file,
        type: 'RESUME', // Default type
        id: Date.now() + Math.random()
      });
    });
    
    setDocuments(newDocuments);
    // Reset file input
    e.target.value = '';
  };

  const handleDocumentTypeChange = (docId, type) => {
    const updatedDocuments = documents.map(doc => 
      doc.id === docId ? { ...doc, type } : doc
    );
    setDocuments(updatedDocuments);
  };

  const removeDocument = (docId) => {
    setDocuments(documents.filter(doc => doc.id !== docId));
  };

  const validateForm = () => {
    const errors = [];
    
    if (!formData.firstName.trim()) errors.push('First Name is required');
    if (!formData.lastName.trim()) errors.push('Last Name is required');
    if (!formData.phoneNumber.trim()) errors.push('Phone Number is required');
    if (!formData.email.trim()) errors.push('Email is required');
    if (!formData.city.trim()) errors.push('City is required');
    if (!formData.state.trim()) errors.push('State is required');
    if (!formData.primarySkill.trim()) errors.push('Primary Skill is required');
    if (!formData.yearsOfExperience) errors.push('Years of Experience is required');
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      errors.push('Please enter a valid email address');
    }
    
    if (formData.visaStatus === 'OTHER' && !formData.otherVisaStatus.trim()) {
      errors.push('Please specify the visa status');
    }
    
    if (formData.primarySkill === 'OTHER' && !formData.otherPrimarySkill.trim()) {
      errors.push('Please specify the primary skill');
    }
    
    if (errors.length > 0) {
      errors.forEach(error => toast.error(error));
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);

    try {
      const submitData = new FormData();
      
      // Combine names
      const fullName = `${formData.firstName} ${formData.middleName} ${formData.lastName}`.trim();
      
      // Prepare data for submission
      const candidateData = {
        fullName,
        phoneNumber: formData.phoneNumber,
        email: formData.email,
        city: formData.city,
        state: formData.state,
        primarySkill: formData.primarySkill === 'OTHER' ? formData.otherPrimarySkill : formData.primarySkill,
        experienceYears: parseInt(formData.yearsOfExperience),
        visaStatus: formData.visaStatus === 'OTHER' ? formData.otherVisaStatus : formData.visaStatus,
        targetRate: formData.targetRate ? parseFloat(formData.targetRate) : null,
        assignedConsultantId: formData.assignedConsultantId || null,
        notes: formData.notes,
        // Additional fields
        firstName: formData.firstName,
        middleName: formData.middleName,
        lastName: formData.lastName,
        passportNumber: formData.passportNumber,
        countryOfCitizenship: formData.countryOfCitizenship,
        linkedinUrl: formData.linkedinUrl, // Keep as text field
        address1: formData.address1,
        address2: formData.address2,
        country: formData.country,
        startDate: formData.startDate,
        endDate: formData.endDate,
        visaNotes: formData.visaNotes, // Add visa notes
        additionalSkills: formData.additionalSkills,
        domains: formData.domains.join(',')
      };

      // Append form fields
      Object.keys(candidateData).forEach(key => {
        if (candidateData[key] !== null && candidateData[key] !== '') {
          submitData.append(key, candidateData[key]);
        }
      });

      // Append document files with their types - Fixed multiple file upload
      documents.forEach((doc) => {
        if (doc.file && doc.type) {
          submitData.append('documents', doc.file);
          submitData.append('documentTypes', doc.type);
        }
      });

      if (isEdit) {
        await benchCandidatesAPI.update(id, submitData);
        toast.success('Bench candidate updated successfully!');
      } else {
        await benchCandidatesAPI.create(submitData);
        toast.success('Bench candidate created successfully!');
      }

      navigate('/bench-candidates');
    } catch (error) {
      console.error('Submission error:', error);
      const message = error.response?.data?.message || 
        `Failed to ${isEdit ? 'update' : 'create'} bench candidate`;
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/bench-candidates');
  };

  const getFileIcon = (filename) => {
    const ext = filename.split('.').pop().toLowerCase();
    switch (ext) {
      case 'pdf': return '📄';
      case 'doc':
      case 'docx': return '📝';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'bmp':
      case 'webp': return '🖼️';
      case 'txt': return '📄';
      default: return '📎';
    }
  };

  const filteredPrimarySkills = primarySkillOptions.filter(skill =>
    skill.toLowerCase().includes(primarySkillSearch.toLowerCase())
  );

  if (loadingCandidate) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <div>Loading candidate details...</div>
      </div>
    );
  }

  return (
    <div className="bench-form-container">
      {/* Compact Header */}
      <div className="form-header-compact">
        <div>
          <h1>{isEdit ? 'Edit Bench Candidate' : 'Add New Bench Candidate'}</h1>
          <p>Complete candidate profile information</p>
        </div>
        <button onClick={handleCancel} className="btn-close">✕</button>
      </div>

      <form onSubmit={handleSubmit} className="enhanced-form-compact">
        {/* Personal Details Section - Compact */}
        <div className="form-section-compact">
          <div className="section-header-compact">
            <h3>Personal Information</h3>
          </div>
          <div className="form-grid-compact">
            <div className="form-group">
              <label className="form-label required">First Name</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="form-input"
                required
                placeholder="Enter first name"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Middle Name</label>
              <input
                type="text"
                name="middleName"
                value={formData.middleName}
                onChange={handleChange}
                className="form-input"
                placeholder="Enter middle name"
              />
            </div>

            <div className="form-group">
              <label className="form-label required">Last Name</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="form-input"
                required
                placeholder="Enter last name"
              />
            </div>

            <div className="form-group">
              <label className="form-label required">Phone Number</label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                className="form-input"
                required
                placeholder="(555) 123-4567"
              />
            </div>

            <div className="form-group">
              <label className="form-label required">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="form-input"
                required
                placeholder="candidate@email.com"
              />
            </div>

            <div className="form-group">
              <label className="form-label">LinkedIn URL</label>
              <input
                type="text"
                name="linkedinUrl"
                value={formData.linkedinUrl}
                onChange={handleChange}
                className="form-input"
                placeholder="www.linkedin.com/in/username"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Passport Number</label>
              <input
                type="text"
                name="passportNumber"
                value={formData.passportNumber}
                onChange={handleChange}
                className="form-input"
                placeholder="Enter passport number"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Country of Citizenship</label>
              <select
                name="countryOfCitizenship"
                value={formData.countryOfCitizenship}
                onChange={handleChange}
                className="form-input"
              >
                <option value="">Select Country</option>
                {countries.map(country => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Address Section - Compact */}
        <div className="form-section-compact">
          <div className="section-header-compact">
            <h3>Address Information</h3>
          </div>
          <div className="form-grid-compact">
            <div className="form-group">
              <label className="form-label">Address Line 1</label>
              <input
                type="text"
                name="address1"
                value={formData.address1}
                onChange={handleChange}
                className="form-input"
                placeholder="Street address"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Address Line 2</label>
              <input
                type="text"
                name="address2"
                value={formData.address2}
                onChange={handleChange}
                className="form-input"
                placeholder="Apartment, suite, etc."
              />
            </div>

            <div className="form-group">
              <label className="form-label required">City</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="form-input"
                required
                placeholder="Enter city"
              />
            </div>

            <div className="form-group">
              <label className="form-label required">State</label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                className="form-input"
                required
                placeholder="Enter state"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Country</label>
              <select
                name="country"
                value={formData.country}
                onChange={handleChange}
                className="form-input"
              >
                <option value="">Select Country</option>
                {countries.map(country => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Immigration Details Section - Compact with Notes */}
        <div className="form-section-compact">
          <div className="section-header-compact">
            <h3>Immigration Details</h3>
          </div>
          <div className="form-grid-compact">
            <div className="form-group">
              <label className="form-label required">Visa Status</label>
              <select
                name="visaStatus"
                value={formData.visaStatus}
                onChange={handleChange}
                className="form-input"
                required
              >
                {visaStatusOptions.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>

            {formData.visaStatus === 'OTHER' && (
              <div className="form-group">
                <label className="form-label required">Specify Visa Status</label>
                <input
                  type="text"
                  name="otherVisaStatus"
                  value={formData.otherVisaStatus}
                  onChange={handleChange}
                  className="form-input"
                  required
                  placeholder="Enter visa status"
                />
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Start Date</label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">End Date</label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                className="form-input"
              />
            </div>

            <div className="form-group full-width">
              <label className="form-label">Immigration Notes</label>
              <textarea
                name="visaNotes"
                value={formData.visaNotes}
                onChange={handleChange}
                className="form-input"
                rows="2"
                placeholder="Any additional visa or immigration related information..."
              />
            </div>
          </div>
        </div>

        {/* Professional Skills Section - Compact */}
        <div className="form-section-compact">
          <div className="section-header-compact">
            <h3>Professional Skills</h3>
          </div>
          <div className="form-grid-compact">
            <div className="form-group">
              <label className="form-label required">Primary Skill</label>
              <div className="skill-search-container">
                <input
                  type="text"
                  value={primarySkillSearch || formData.primarySkill}
                  onChange={handlePrimarySkillSearch}
                  onFocus={() => setShowPrimarySkillDropdown(true)}
                  className="form-input"
                  placeholder="Search and select primary skill"
                  required
                />
                {showPrimarySkillDropdown && (
                  <div className="skill-dropdown">
                    {filteredPrimarySkills.map(skill => (
                      <div
                        key={skill}
                        className="skill-option"
                        onClick={() => selectPrimarySkill(skill)}
                      >
                        {skill}
                      </div>
                    ))}
                    <div
                      className="skill-option other-option"
                      onClick={() => {
                        selectPrimarySkill('OTHER');
                        setShowPrimarySkillDropdown(false);
                      }}
                    >
                      ➕ Other (specify below)
                    </div>
                  </div>
                )}
              </div>
            </div>

            {formData.primarySkill === 'OTHER' && (
              <div className="form-group">
                <label className="form-label required">Specify Primary Skill</label>
                <input
                  type="text"
                  name="otherPrimarySkill"
                  value={formData.otherPrimarySkill}
                  onChange={handleChange}
                  className="form-input"
                  required
                  placeholder="Enter primary skill"
                />
              </div>
            )}

            <div className="form-group">
              <label className="form-label required">Years of Experience</label>
              <input
                type="number"
                name="yearsOfExperience"
                value={formData.yearsOfExperience}
                onChange={handleChange}
                className="form-input"
                required
                min="0"
                max="50"
                placeholder="Enter years"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Target Rate ($/hr)</label>
              <input
                type="number"
                name="targetRate"
                value={formData.targetRate}
                onChange={handleChange}
                className="form-input"
                min="0"
                step="0.01"
                placeholder="e.g. 85"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Assigned Consultant</label>
              <select
                name="assignedConsultantId"
                value={formData.assignedConsultantId}
                onChange={handleChange}
                className="form-input"
              >
                <option value="">Select Consultant</option>
                {employees.map(employee => (
                  <option key={employee.id} value={employee.id}>
                    {employee.fullName}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group full-width">
              <label className="form-label">Additional Skills</label>
              <textarea
                name="additionalSkills"
                value={formData.additionalSkills}
                onChange={handleChange}
                className="form-input"
                rows="2"
                placeholder="List additional skills, separated by commas"
              />
            </div>

            <div className="form-group full-width">
              <label className="form-label">Domain Experience</label>
              <div className="checkbox-grid-compact">
                {domainOptions.map(domain => (
                  <label key={domain} className="checkbox-label">
                    <input
                      type="checkbox"
                      name="domains"
                      value={domain}
                      checked={formData.domains.includes(domain)}
                      onChange={handleChange}
                    />
                    <span>{domain}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Documents Upload Section - Fixed */}
        <div className="form-section-compact">
          <div className="section-header-compact">
            <h3>Document Upload</h3>
          </div>
          
          <div className="form-group">
            <label className="form-label">Upload Documents</label>
            <input
              type="file"
              onChange={handleFileChange}
              className="form-input"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.bmp,.webp,.txt"
              multiple
            />
            <div className="file-info">
              Supported: PDF, Word, Images, Text files (Max: 10MB each)
            </div>
          </div>

          {documents.length > 0 && (
            <div className="documents-preview-compact">
              <h4>Documents to Upload ({documents.length})</h4>
              {documents.map((doc) => (
                <div key={doc.id} className="document-item-compact">
                  <div className="document-info">
                    <span className="file-icon">{getFileIcon(doc.file.name)}</span>
                    <span className="file-name">{doc.file.name}</span>
                    <span className="file-size">
                      ({(doc.file.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  </div>
                  
                  <select
                    value={doc.type}
                    onChange={(e) => handleDocumentTypeChange(doc.id, e.target.value)}
                    className="form-input document-type-select"
                    required
                  >
                    {documentTypeOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  
                  <button
                    type="button"
                    onClick={() => removeDocument(doc.id)}
                    className="btn-remove"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Notes Section */}
        <div className="form-section-compact">
          <div className="section-header-compact">
            <h3>Additional Notes</h3>
          </div>
          <div className="form-group">
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              className="form-input"
              rows="3"
              placeholder="Additional notes about the candidate..."
            />
          </div>
        </div>

        {/* Form Actions */}
        <div className="form-actions-compact">
          <button
            type="button"
            onClick={handleCancel}
            className="btn-cancel"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-submit"
            disabled={loading}
          >
            {loading 
              ? (isEdit ? 'Updating...' : 'Creating...') 
              : (isEdit ? 'Update Candidate' : 'Create Candidate')
            }
          </button>
        </div>
      </form>
    </div>
  );
};

export default BenchCandidateForm;