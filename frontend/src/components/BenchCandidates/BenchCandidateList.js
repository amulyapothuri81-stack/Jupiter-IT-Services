import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { benchCandidatesAPI } from '../../services/api';
import toast from 'react-hot-toast';
import './Modal.css';

const BenchCandidateList = () => {
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [filters, setFilters] = useState({
    fullName: '',
    visaStatus: '',
    primarySkill: '',
    state: '',
    experienceYears: '',
    email: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState({
    page: 0,
    size: 10,
    totalElements: 0,
    totalPages: 0,
  });

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async (page = 0) => {
    try {
      setLoading(true);
      const params = {
        page,
        size: pagination.size,
        ...filters,
      };

      // Remove empty filters
      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === null) {
          delete params[key];
        }
      });

      const response = await benchCandidatesAPI.search(params);
      setCandidates(response.data.content || response.data);
      if (response.data.content) {
        setPagination({
          page: response.data.number,
          size: response.data.size,
          totalElements: response.data.totalElements,
          totalPages: response.data.totalPages,
        });
      }
    } catch (error) {
      toast.error('Failed to load bench candidates');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  const handleSearch = () => {
    fetchCandidates(0);
  };

  const handleClearFilters = () => {
    setFilters({
      fullName: '',
      visaStatus: '',
      primarySkill: '',
      state: '',
      experienceYears: '',
      email: ''
    });
    setTimeout(() => fetchCandidates(0), 100);
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  const handleCandidateSelect = (candidate) => {
    setSelectedCandidate(candidate);
  };

  const handleMoreDetails = () => {
    if (!selectedCandidate) {
      toast.error('Please select a candidate first');
      return;
    }
    navigate(`/bench-candidates/detail/${selectedCandidate.id}`);
  };

  const getVisaStatusBadge = (visaStatus) => {
    const colorMap = {
      'H1B': '#3B82F6',
      'H4EAD': '#8B5CF6',
      'L1': '#10B981',
      'L2EAD': '#F59E0B',
      'OPT': '#EF4444',
      'STEM_OPT': '#EC4899',
      'CPT': '#6366F1',
      'F1': '#84CC16',
      'GC': '#059669',
      'CITIZEN': '#DC2626',
      'OTHER': '#6B7280'
    };

    const color = colorMap[visaStatus] || '#6B7280';
    return (
      <span style={{
        backgroundColor: `${color}20`,
        color: color,
        padding: '0.25rem 0.5rem',
        borderRadius: '9999px',
        fontSize: '0.75rem',
        fontWeight: '600',
        border: `1px solid ${color}40`
      }}>
        {visaStatus}
      </span>
    );
  };

  const getExperienceColor = (years) => {
    if (years < 2) return '#EF4444'; // Red for junior
    if (years < 5) return '#F59E0B'; // Orange for mid-level
    if (years < 8) return '#10B981'; // Green for senior
    return '#8B5CF6'; // Purple for expert
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1F2937', marginBottom: '0.5rem' }}>
            Bench Profiles
          </h1>
          <p style={{ color: '#6B7280', marginBottom: '0.25rem' }}>
            Candidates available for placement opportunities
          </p>
          <p style={{ color: '#6B7280', fontSize: '0.875rem' }}>
            {Array.isArray(candidates) ? candidates.length : pagination.totalElements} candidates found
          </p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            onClick={handleMoreDetails}
            disabled={!selectedCandidate}
            style={{
              background: selectedCandidate ? '#10B981' : '#9CA3AF',
              color: 'white',
              border: 'none',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              fontSize: '0.875rem',
              cursor: selectedCandidate ? 'pointer' : 'not-allowed',
              fontWeight: '500',
              transition: 'all 0.15s ease'
            }}
          >
            📋 More Details
          </button>
          <button
            onClick={toggleFilters}
            style={{
              background: '#4F46E5',
              color: 'white',
              border: 'none',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              fontSize: '0.875rem',
              cursor: 'pointer',
              fontWeight: '500',
              transition: 'all 0.15s ease'
            }}
          >
            🔍 Filter
          </button>
          <Link to="/bench-candidates/new" className="btn-primary" style={{ textDecoration: 'none' }}>
            ➕ Add Candidate
          </Link>
        </div>
      </div>

      {/* Selected Candidate Info */}
      {selectedCandidate && (
        <div style={{ 
          background: 'linear-gradient(135deg, #EFF6FF 0%, #F0F9FF 100%)', 
          border: '1px solid #DBEAFE',
          borderRadius: '8px', 
          padding: '1rem',
          marginBottom: '1rem',
          fontSize: '0.875rem'
        }}>
          <span style={{ fontWeight: '600', color: '#1E40AF' }}>
            Selected: {selectedCandidate.fullName} - {selectedCandidate.primarySkill} ({selectedCandidate.experienceYears} years)
          </span>
          <button 
            onClick={() => setSelectedCandidate(null)}
            style={{ 
              background: 'transparent',
              border: 'none',
              color: '#1E40AF',
              marginLeft: '1rem',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            ✕ Clear Selection
          </button>
        </div>
      )}

      {/* Filter Modal */}
      {showFilters && (
        <div className="modal-backdrop" onClick={toggleFilters}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '700px', maxHeight: '80vh' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', margin: 0 }}>
                Filter Candidates
              </h3>
              <button 
                onClick={toggleFilters}
                style={{ background: 'transparent', border: 'none', fontSize: '1.25rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ marginBottom: '0.5rem', display: 'block', fontWeight: '500' }}>Name</label>
                <input
                  type="text"
                  name="fullName"
                  className="form-input"
                  value={filters.fullName}
                  onChange={handleFilterChange}
                  placeholder="Search by name..."
                  style={{ padding: '0.5rem' }}
                />
              </div>
              
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ marginBottom: '0.5rem', display: 'block', fontWeight: '500' }}>Visa Status</label>
                <select
                  name="visaStatus"
                  className="form-input"
                  value={filters.visaStatus}
                  onChange={handleFilterChange}
                  style={{ padding: '0.5rem' }}
                >
                  <option value="">All Visa Status</option>
                  <option value="H1B">H1B</option>
                  <option value="H4EAD">H4EAD</option>
                  <option value="L1">L1</option>
                  <option value="L2EAD">L2EAD</option>
                  <option value="OPT">OPT</option>
                  <option value="STEM_OPT">STEM OPT</option>
                  <option value="CPT">CPT</option>
                  <option value="F1">F1</option>
                  <option value="GC">Green Card</option>
                  <option value="CITIZEN">US Citizen</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ marginBottom: '0.5rem', display: 'block', fontWeight: '500' }}>Primary Skill</label>
                <input
                  type="text"
                  name="primarySkill"
                  className="form-input"
                  value={filters.primarySkill}
                  onChange={handleFilterChange}
                  placeholder="e.g. Java, React..."
                  style={{ padding: '0.5rem' }}
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ marginBottom: '0.5rem', display: 'block', fontWeight: '500' }}>Experience Years</label>
                <input
                  type="number"
                  name="experienceYears"
                  className="form-input"
                  value={filters.experienceYears}
                  onChange={handleFilterChange}
                  placeholder="e.g. 5"
                  style={{ padding: '0.5rem' }}
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ marginBottom: '0.5rem', display: 'block', fontWeight: '500' }}>State</label>
                <input
                  type="text"
                  name="state"
                  className="form-input"
                  value={filters.state}
                  onChange={handleFilterChange}
                  placeholder="e.g. TX"
                  style={{ padding: '0.5rem' }}
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ marginBottom: '0.5rem', display: 'block', fontWeight: '500' }}>Email</label>
                <input
                  type="text"
                  name="email"
                  className="form-input"
                  value={filters.email}
                  onChange={handleFilterChange}
                  placeholder="Email address..."
                  style={{ padding: '0.5rem' }}
                />
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button onClick={handleClearFilters} className="btn-secondary" style={{ padding: '0.75rem 1.5rem' }}>
                Clear All
              </button>
              <button 
                onClick={() => {
                  handleSearch();
                  toggleFilters();
                }} 
                className="btn-primary"
                style={{ padding: '0.75rem 1.5rem' }}
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Table Style Candidates Display */}
      <div style={{ 
        background: 'white', 
        borderRadius: '12px', 
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden'
      }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center' }}>
            <div style={{ 
              width: '40px', 
              height: '40px', 
              border: '4px solid #f3f4f6', 
              borderTop: '4px solid #3b82f6', 
              borderRadius: '50%', 
              animation: 'spin 1s linear infinite',
              margin: '0 auto 1rem auto'
            }} />
            Loading bench candidates...
          </div>
        ) : candidates.length > 0 ? (
          <div style={{ padding: '0' }}>
            {/* Enhanced Table Header */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '60px minmax(180px, 1fr) 120px 120px minmax(150px, 1fr) 90px minmax(200px, 2fr)',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              padding: '1rem',
              fontWeight: '600',
              fontSize: '0.875rem',
              position: 'sticky',
              top: 0,
              zIndex: 10,
              gap: '0.5rem'
            }}>
              <div style={{ textAlign: 'center' }}>#</div>
              <div>👤 Full Name</div>
              <div>⏱️ Experience</div>
              <div>🛂 Visa Status</div>
              <div>💼 Primary Skill</div>
              <div>📍 State</div>
              <div>📧 Email</div>
            </div>

            {/* Enhanced Table Rows */}
            {candidates.map((candidate, index) => (
              <div 
                key={candidate.id}
                onClick={() => handleCandidateSelect(candidate)}
                style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '60px minmax(180px, 1fr) 120px 120px minmax(150px, 1fr) 90px minmax(200px, 2fr)',
                  padding: '1rem',
                  fontSize: '0.875rem',
                  borderBottom: '1px solid #F3F4F6',
                  cursor: 'pointer',
                  backgroundColor: selectedCandidate?.id === candidate.id ? 
                    'linear-gradient(135deg, #EFF6FF 0%, #F0F9FF 100%)' : 'white',
                  transition: 'all 0.2s ease',
                  minHeight: '70px',
                  alignItems: 'center',
                  gap: '0.5rem',
                  borderLeft: selectedCandidate?.id === candidate.id ? '4px solid #3B82F6' : '4px solid transparent'
                }}
                onMouseEnter={(e) => {
                  if (selectedCandidate?.id !== candidate.id) {
                    e.currentTarget.style.backgroundColor = '#F9FAFB';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedCandidate?.id !== candidate.id) {
                    e.currentTarget.style.backgroundColor = 'white';
                  } else {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #EFF6FF 0%, #F0F9FF 100%)';
                  }
                }}
              >
                <div style={{ 
                  fontWeight: '700', 
                  color: selectedCandidate?.id === candidate.id ? '#1E40AF' : '#6B7280',
                  textAlign: 'center',
                  fontSize: '1rem'
                }}>
                  {pagination.page * pagination.size + index + 1}
                </div>
                
                <div style={{ 
                  fontWeight: selectedCandidate?.id === candidate.id ? '700' : '600',
                  color: selectedCandidate?.id === candidate.id ? '#1E40AF' : '#1F2937',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <span style={{ fontSize: '1.2rem' }}>👤</span>
                  {candidate.fullName}
                </div>
                
                <div style={{ 
                  overflow: 'hidden', 
                  textOverflow: 'ellipsis', 
                  whiteSpace: 'nowrap',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}>
                  <span 
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: getExperienceColor(candidate.experienceYears),
                      display: 'inline-block'
                    }}
                  />
                  <span style={{ fontWeight: '600' }}>{candidate.experienceYears}</span> years
                </div>
                
                <div style={{ 
                  overflow: 'hidden', 
                  textOverflow: 'ellipsis', 
                  whiteSpace: 'nowrap',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  {getVisaStatusBadge(candidate.visaStatus)}
                </div>
                
                <div style={{ 
                  overflow: 'hidden', 
                  textOverflow: 'ellipsis', 
                  whiteSpace: 'nowrap',
                  fontWeight: '500'
                }}>
                  {candidate.primarySkill}
                </div>
                
                <div style={{ 
                  overflow: 'hidden', 
                  textOverflow: 'ellipsis', 
                  whiteSpace: 'nowrap',
                  fontWeight: '500'
                }}>
                  {candidate.state}
                </div>
                
                <div style={{ 
                  wordBreak: 'break-all',
                  whiteSpace: 'normal',
                  lineHeight: '1.4',
                  fontSize: '0.8rem',
                  paddingTop: '0.5rem',
                  paddingBottom: '0.5rem',
                  color: '#4B5563'
                }}>
                  {candidate.email || 'N/A'}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#6B7280' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>👥</div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No bench candidates found</h3>
            <p style={{ fontSize: '0.875rem', marginBottom: '1.5rem' }}>
              Start building your candidate database by adding bench profiles
            </p>
            <Link 
              to="/bench-candidates/new" 
              style={{ 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                textDecoration: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                fontWeight: '600',
                display: 'inline-block',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-1px)';
                e.target.style.boxShadow = '0 10px 25px -5px rgba(102, 126, 234, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}
            >
              ➕ Add Your First Candidate
            </Link>
          </div>
        )}

        {/* Enhanced Pagination */}
        {pagination.totalPages > 1 && (
          <div style={{ 
            padding: '1rem 2rem', 
            borderTop: '2px solid #E5E7EB',
            background: 'linear-gradient(135deg, #F9FAFB 0%, #F3F4F6 100%)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ color: '#6B7280', fontSize: '0.875rem', fontWeight: '500' }}>
              Showing <strong>{pagination.page * pagination.size + 1}</strong> to{' '}
              <strong>{Math.min((pagination.page + 1) * pagination.size, pagination.totalElements)}</strong> of{' '}
              <strong>{pagination.totalElements}</strong> candidates
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => fetchCandidates(pagination.page - 1)}
                disabled={pagination.page === 0}
                style={{
                  background: pagination.page === 0 ? '#E5E7EB' : '#3B82F6',
                  color: pagination.page === 0 ? '#9CA3AF' : 'white',
                  border: 'none',
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: pagination.page === 0 ? 'not-allowed' : 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                ← Previous
              </button>
              <span style={{ 
                display: 'flex', 
                alignItems: 'center', 
                padding: '0 1rem', 
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#4B5563'
              }}>
                {pagination.page + 1} of {pagination.totalPages}
              </span>
              <button
                onClick={() => fetchCandidates(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages - 1}
                style={{
                  background: pagination.page >= pagination.totalPages - 1 ? '#E5E7EB' : '#3B82F6',
                  color: pagination.page >= pagination.totalPages - 1 ? '#9CA3AF' : 'white',
                  border: 'none',
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: pagination.page >= pagination.totalPages - 1 ? 'not-allowed' : 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Add CSS for spin animation */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default BenchCandidateList;