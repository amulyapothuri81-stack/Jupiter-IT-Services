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
              fontWeight: '500'
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
              fontWeight: '500'
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
          background: '#EFF6FF', 
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
                  <option value="OPT">OPT</option>
                  <option value="GC">Green Card</option>
                  <option value="CITIZEN">US Citizen</option>
                  <option value="F1">F1</option>
                  <option value="L1">L1</option>
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

      {/* Table Style Candidates Display */}
      <div style={{ 
        background: 'white', 
        borderRadius: '12px', 
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden'
      }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center' }}>
            Loading bench candidates...
          </div>
        ) : candidates.length > 0 ? (
          <div style={{ padding: '0' }}>
            {/* Table Header */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '60px minmax(150px, 1fr) 100px 110px minmax(120px, 1fr) 80px minmax(250px, 2fr)',
              background: '#F9FAFB',
              padding: '1rem',
              fontWeight: '600',
              fontSize: '0.875rem',
              color: '#374151',
              borderBottom: '1px solid #E5E7EB',
              position: 'sticky',
              top: 0,
              zIndex: 10,
              gap: '0.5rem'
            }}>
              <div style={{ textAlign: 'center' }}>#</div>
              <div>Name</div>
              <div>Experience</div>
              <div>Visa Status</div>
              <div>Primary Skill</div>
              <div>State</div>
              <div>Email</div>
            </div>

            {/* Table Rows */}
            {candidates.map((candidate, index) => (
              <div 
                key={candidate.id}
                onClick={() => handleCandidateSelect(candidate)}
                style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '60px minmax(150px, 1fr) 100px 110px minmax(120px, 1fr) 80px minmax(250px, 2fr)',
                  padding: '1rem',
                  fontSize: '0.875rem',
                  borderBottom: '1px solid #F3F4F6',
                  cursor: 'pointer',
                  backgroundColor: selectedCandidate?.id === candidate.id ? '#EFF6FF' : 'white',
                  transition: 'all 0.2s ease',
                  minHeight: '60px',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
                onMouseEnter={(e) => {
                  if (selectedCandidate?.id !== candidate.id) {
                    e.currentTarget.style.backgroundColor = '#F9FAFB';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedCandidate?.id !== candidate.id) {
                    e.currentTarget.style.backgroundColor = 'white';
                  }
                }}
              >
                <div style={{ 
                  fontWeight: '600', 
                  color: selectedCandidate?.id === candidate.id ? '#1E40AF' : '#6B7280',
                  textAlign: 'center'
                }}>
                  {pagination.page * pagination.size + index + 1}
                </div>
                <div style={{ 
                  fontWeight: selectedCandidate?.id === candidate.id ? '600' : '500',
                  color: selectedCandidate?.id === candidate.id ? '#1E40AF' : '#1F2937',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {candidate.fullName}
                </div>
                <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {candidate.experienceYears} years
                </div>
                <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {candidate.visaStatus}
                </div>
                <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {candidate.primarySkill}
                </div>
                <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {candidate.state}
                </div>
                <div style={{ 
                  wordBreak: 'break-all',
                  whiteSpace: 'normal',
                  lineHeight: '1.4',
                  fontSize: '0.8rem',
                  paddingTop: '0.5rem',
                  paddingBottom: '0.5rem'
                }}>
                  {candidate.email || 'N/A'}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#6B7280' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👥</div>
            <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>No bench candidates found</p>
            <Link 
              to="/bench-candidates/new" 
              style={{ 
                color: '#3B82F6', 
                textDecoration: 'none',
                fontWeight: '500'
              }}
            >
              Add your first bench candidate
            </Link>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div style={{ 
            padding: '1rem 2rem', 
            borderTop: '1px solid #E5E7EB',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ color: '#6B7280', fontSize: '0.875rem' }}>
              Showing {pagination.page * pagination.size + 1} to {Math.min((pagination.page + 1) * pagination.size, pagination.totalElements)} of {pagination.totalElements} results
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => fetchCandidates(pagination.page - 1)}
                disabled={pagination.page === 0}
                className="btn-secondary"
                style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
              >
                Previous
              </button>
              <button
                onClick={() => fetchCandidates(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages - 1}
                className="btn-secondary"
                style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BenchCandidateList;