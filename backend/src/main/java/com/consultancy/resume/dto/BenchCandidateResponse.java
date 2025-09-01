package com.consultancy.resume.dto;

import com.consultancy.resume.entity.BenchCandidate;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public class BenchCandidateResponse {
    private Long id;
    
    // Personal Details
    private String firstName;
    private String middleName;
    private String lastName;
    private String fullName;
    private String phoneNumber;
    private String email;
    private String passportNumber;
    private String countryOfCitizenship;
    private String linkedinUrl;
    
    // Address Information
    private String address1;
    private String address2;
    private String city;
    private String state;
    private String country;
    
    // Immigration Details
    private BenchCandidate.VisaStatus visaStatus;
    private String otherVisaStatus;
    private LocalDate startDate;
    private LocalDate endDate;
    
    // Professional Skills
    private String primarySkill;
    private String otherPrimarySkill;
    private String additionalSkills;
    private Integer experienceYears;
    private String domains;
    private List<String> domainList;
    
    // Additional Information
    private BigDecimal targetRate;
    private Long assignedConsultantId;
    private String assignedConsultantName;
    private String notes;
    
    // Legacy fields for backward compatibility
    private String resumeFilename;
    
    // Audit Information
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String createdByName;
    
    // Additional computed fields
    private String location;
    private String fullAddress;
    private int documentCount;
    private boolean hasLinkedinProfile;

    public BenchCandidateResponse(BenchCandidate candidate) {
        this.id = candidate.getId();
        
        // Personal Details
        this.firstName = candidate.getFirstName();
        this.middleName = candidate.getMiddleName();
        this.lastName = candidate.getLastName();
        this.fullName = candidate.getFullName();
        this.phoneNumber = candidate.getPhoneNumber();
        this.email = candidate.getEmail();
        this.passportNumber = candidate.getPassportNumber();
        this.countryOfCitizenship = candidate.getCountryOfCitizenship();
        this.linkedinUrl = candidate.getLinkedinUrl();
        
        // Address Information
        this.address1 = candidate.getAddress1();
        this.address2 = candidate.getAddress2();
        this.city = candidate.getCity();
        this.state = candidate.getState();
        this.country = candidate.getCountry();
        
        // Immigration Details
        this.visaStatus = candidate.getVisaStatus();
        this.otherVisaStatus = candidate.getOtherVisaStatus();
        this.startDate = candidate.getStartDate();
        this.endDate = candidate.getEndDate();
        
        // Professional Skills
        this.primarySkill = candidate.getPrimarySkill();
        this.otherPrimarySkill = candidate.getOtherPrimarySkill();
        this.additionalSkills = candidate.getAdditionalSkills();
        this.experienceYears = candidate.getExperienceYears();
        this.domains = candidate.getDomains();
        this.domainList = candidate.getDomainList();
        
        // Additional Information
        this.targetRate = candidate.getTargetRate();
        this.assignedConsultantId = candidate.getAssignedConsultant() != null ? 
            candidate.getAssignedConsultant().getId() : null;
        this.assignedConsultantName = candidate.getAssignedConsultantName();
        this.notes = candidate.getNotes();
        
        // Legacy fields
        this.resumeFilename = candidate.getResumeFilename();
        
        // Audit Information
        this.createdAt = candidate.getCreatedAt();
        this.updatedAt = candidate.getUpdatedAt();
        this.createdByName = candidate.getCreatedBy() != null ? 
            candidate.getCreatedBy().getFullName() : null;
        
        // Computed fields
        this.location = candidate.getLocation();
        this.fullAddress = candidate.getFullAddress();
        this.documentCount = candidate.getDocuments() != null ? candidate.getDocuments().size() : 0;
        this.hasLinkedinProfile = candidate.getLinkedinUrl() != null && !candidate.getLinkedinUrl().trim().isEmpty();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getMiddleName() { return middleName; }
    public void setMiddleName(String middleName) { this.middleName = middleName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassportNumber() { return passportNumber; }
    public void setPassportNumber(String passportNumber) { this.passportNumber = passportNumber; }

    public String getCountryOfCitizenship() { return countryOfCitizenship; }
    public void setCountryOfCitizenship(String countryOfCitizenship) { this.countryOfCitizenship = countryOfCitizenship; }

    public String getLinkedinUrl() { return linkedinUrl; }
    public void setLinkedinUrl(String linkedinUrl) { this.linkedinUrl = linkedinUrl; }

    public String getAddress1() { return address1; }
    public void setAddress1(String address1) { this.address1 = address1; }

    public String getAddress2() { return address2; }
    public void setAddress2(String address2) { this.address2 = address2; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getState() { return state; }
    public void setState(String state) { this.state = state; }

    public String getCountry() { return country; }
    public void setCountry(String country) { this.country = country; }

    public BenchCandidate.VisaStatus getVisaStatus() { return visaStatus; }
    public void setVisaStatus(BenchCandidate.VisaStatus visaStatus) { this.visaStatus = visaStatus; }

    public String getOtherVisaStatus() { return otherVisaStatus; }
    public void setOtherVisaStatus(String otherVisaStatus) { this.otherVisaStatus = otherVisaStatus; }

    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }

    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }

    public String getPrimarySkill() { return primarySkill; }
    public void setPrimarySkill(String primarySkill) { this.primarySkill = primarySkill; }

    public String getOtherPrimarySkill() { return otherPrimarySkill; }
    public void setOtherPrimarySkill(String otherPrimarySkill) { this.otherPrimarySkill = otherPrimarySkill; }

    public String getAdditionalSkills() { return additionalSkills; }
    public void setAdditionalSkills(String additionalSkills) { this.additionalSkills = additionalSkills; }

    public Integer getExperienceYears() { return experienceYears; }
    public void setExperienceYears(Integer experienceYears) { this.experienceYears = experienceYears; }

    public String getDomains() { return domains; }
    public void setDomains(String domains) { this.domains = domains; }

    public List<String> getDomainList() { return domainList; }
    public void setDomainList(List<String> domainList) { this.domainList = domainList; }

    public BigDecimal getTargetRate() { return targetRate; }
    public void setTargetRate(BigDecimal targetRate) { this.targetRate = targetRate; }

    public Long getAssignedConsultantId() { return assignedConsultantId; }
    public void setAssignedConsultantId(Long assignedConsultantId) { this.assignedConsultantId = assignedConsultantId; }

    public String getAssignedConsultantName() { return assignedConsultantName; }
    public void setAssignedConsultantName(String assignedConsultantName) { this.assignedConsultantName = assignedConsultantName; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public String getResumeFilename() { return resumeFilename; }
    public void setResumeFilename(String resumeFilename) { this.resumeFilename = resumeFilename; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public String getCreatedByName() { return createdByName; }
    public void setCreatedByName(String createdByName) { this.createdByName = createdByName; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getFullAddress() { return fullAddress; }
    public void setFullAddress(String fullAddress) { this.fullAddress = fullAddress; }

    public int getDocumentCount() { return documentCount; }
    public void setDocumentCount(int documentCount) { this.documentCount = documentCount; }

    public boolean isHasLinkedinProfile() { return hasLinkedinProfile; }
    public void setHasLinkedinProfile(boolean hasLinkedinProfile) { this.hasLinkedinProfile = hasLinkedinProfile; }

    // Helper methods
    public String getDisplayVisaStatus() {
        if (visaStatus == BenchCandidate.VisaStatus.OTHER && otherVisaStatus != null) {
            return otherVisaStatus;
        }
        return visaStatus != null ? visaStatus.getDisplayName() : null;
    }

    public String getDisplayPrimarySkill() {
        if ("OTHER".equals(primarySkill) && otherPrimarySkill != null) {
            return otherPrimarySkill;
        }
        return primarySkill;
    }

    public boolean isVisaExpiringSoon() {
        if (endDate == null) return false;
        LocalDate now = LocalDate.now();
        LocalDate threeMonthsFromNow = now.plusMonths(3);
        return endDate.isBefore(threeMonthsFromNow) && endDate.isAfter(now);
    }

    public String getExperienceLevel() {
        if (experienceYears == null) return "Unknown";
        if (experienceYears < 1) return "Entry Level";
        if (experienceYears < 3) return "Junior";
        if (experienceYears < 6) return "Mid Level";
        if (experienceYears < 10) return "Senior";
        return "Expert";
    }
}