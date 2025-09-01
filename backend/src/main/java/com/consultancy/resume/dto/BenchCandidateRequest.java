package com.consultancy.resume.dto;

import com.consultancy.resume.entity.BenchCandidate;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Email;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public class BenchCandidateRequest {
    
    // Personal Details
    @NotBlank(message = "First name is required")
    private String firstName;
    
    private String middleName;
    
    @NotBlank(message = "Last name is required")
    private String lastName;
    
    private String fullName; // Auto-generated from first, middle, last names
    
    @NotBlank(message = "Phone number is required")
    private String phoneNumber;
    
    @NotBlank(message = "Email is required")
    @Email(message = "Please provide a valid email address")
    private String email;
    
    private String passportNumber;
    private String countryOfCitizenship;
    private String linkedinUrl;
    
    // Address Information
    private String address1;
    private String address2;
    
    @NotBlank(message = "City is required")
    private String city;
    
    @NotBlank(message = "State is required")
    private String state;
    
    private String country;
    
    // Immigration Details
    @NotNull(message = "Visa status is required")
    private BenchCandidate.VisaStatus visaStatus;
    
    private String otherVisaStatus; // Required if visaStatus is OTHER
    private LocalDate startDate;
    private LocalDate endDate;
    
    // Professional Skills
    @NotBlank(message = "Primary skill is required")
    private String primarySkill;
    
    private String otherPrimarySkill; // Required if primarySkill is "OTHER"
    private String additionalSkills;
    
    @NotNull(message = "Years of experience is required")
    @Min(value = 0, message = "Experience years cannot be negative")
    @Max(value = 50, message = "Experience years cannot exceed 50")
    private Integer experienceYears;
    
    private List<String> domains; // Multiple selection
    
    // Additional Information
    private BigDecimal targetRate;
    private Long assignedConsultantId;
    private String notes;
    
    // Document Types for uploaded files
    private List<String> documentTypes;

    // Constructors
    public BenchCandidateRequest() {}

    // Getters and Setters
    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getMiddleName() { return middleName; }
    public void setMiddleName(String middleName) { this.middleName = middleName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public String getFullName() { 
        if (fullName != null && !fullName.trim().isEmpty()) {
            return fullName;
        }
        // Auto-generate if not provided
        return generateFullName();
    }
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

    public List<String> getDomains() { return domains; }
    public void setDomains(List<String> domains) { this.domains = domains; }

    public BigDecimal getTargetRate() { return targetRate; }
    public void setTargetRate(BigDecimal targetRate) { this.targetRate = targetRate; }

    public Long getAssignedConsultantId() { return assignedConsultantId; }
    public void setAssignedConsultantId(Long assignedConsultantId) { this.assignedConsultantId = assignedConsultantId; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public List<String> getDocumentTypes() { return documentTypes; }
    public void setDocumentTypes(List<String> documentTypes) { this.documentTypes = documentTypes; }

    // Helper methods
    private String generateFullName() {
        StringBuilder name = new StringBuilder();
        if (firstName != null && !firstName.trim().isEmpty()) {
            name.append(firstName.trim());
        }
        if (middleName != null && !middleName.trim().isEmpty()) {
            if (name.length() > 0) name.append(" ");
            name.append(middleName.trim());
        }
        if (lastName != null && !lastName.trim().isEmpty()) {
            if (name.length() > 0) name.append(" ");
            name.append(lastName.trim());
        }
        return name.toString();
    }

    public String getDomainsAsString() {
        if (domains == null || domains.isEmpty()) {
            return "";
        }
        return String.join(",", domains);
    }

    // Validation method
    public boolean isValid() {
        if (visaStatus == BenchCandidate.VisaStatus.OTHER && 
            (otherVisaStatus == null || otherVisaStatus.trim().isEmpty())) {
            return false;
        }
        
        if ("OTHER".equals(primarySkill) && 
            (otherPrimarySkill == null || otherPrimarySkill.trim().isEmpty())) {
            return false;
        }
        
        return true;
    }
}