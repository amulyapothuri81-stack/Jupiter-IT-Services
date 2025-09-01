package com.consultancy.resume.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Max;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "bench_candidates")
public class BenchCandidate {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Personal Details
    @NotBlank
    @Column(name = "first_name")
    private String firstName;

    @Column(name = "middle_name")
    private String middleName;

    @NotBlank
    @Column(name = "last_name")
    private String lastName;

    @NotBlank
    @Column(name = "full_name")
    private String fullName;

    @NotBlank
    @Column(name = "phone_number")
    private String phoneNumber;

    @NotBlank
    @Column(name = "email")
    private String email;

    @Column(name = "passport_number")
    private String passportNumber;

    @Column(name = "country_of_citizenship")
    private String countryOfCitizenship;

    @Column(name = "linkedin_url")
    private String linkedinUrl;

    // Address Information
    @Column(name = "address1")
    private String address1;

    @Column(name = "address2")
    private String address2;

    @NotBlank
    private String city;

    @NotBlank
    private String state;

    @Column(name = "country")
    private String country;

    // Immigration Details
    @Enumerated(EnumType.STRING)
    @Column(name = "visa_status")
    private VisaStatus visaStatus;

    @Column(name = "other_visa_status")
    private String otherVisaStatus;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    // Professional Skills
    @NotBlank
    @Column(name = "primary_skill")
    private String primarySkill;

    @Column(name = "other_primary_skill")
    private String otherPrimarySkill;

    @Column(name = "additional_skills", length = 1000)
    private String additionalSkills;

    @NotNull
    @Min(0)
    @Max(50)
    @Column(name = "experience_years")
    private Integer experienceYears;

    @Column(name = "domains", length = 500)
    private String domains; // Stored as comma-separated values

    // Additional Information
    @Column(name = "target_rate")
    private BigDecimal targetRate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_consultant_id")
    private Employee assignedConsultant;

    @Column(length = 1000)
    private String notes;

    // Legacy fields for backward compatibility
    @Column(name = "resume_filename")
    private String resumeFilename;

    @Column(name = "resume_path")
    private String resumePath;

    // Document relationships
    @OneToMany(mappedBy = "benchCandidate", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<CandidateDocument> documents = new ArrayList<>();

    // Audit fields
    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;

    public enum VisaStatus {
        H1B("H1B"), 
        H4EAD("H4EAD"), 
        L1("L1"), 
        L2EAD("L2EAD"), 
        OPT("OPT"), 
        STEM_OPT("STEM OPT"), 
        CPT("CPT"), 
        F1("F1"), 
        GC("Green Card"), 
        CITIZEN("US Citizen"), 
        OTHER("Other");

        private final String displayName;
        VisaStatus(String displayName) { 
            this.displayName = displayName; 
        }
        public String getDisplayName() { 
            return displayName; 
        }
    }

    // Constructors
    public BenchCandidate() {}

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

    public VisaStatus getVisaStatus() { return visaStatus; }
    public void setVisaStatus(VisaStatus visaStatus) { this.visaStatus = visaStatus; }

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

    public BigDecimal getTargetRate() { return targetRate; }
    public void setTargetRate(BigDecimal targetRate) { this.targetRate = targetRate; }

    public Employee getAssignedConsultant() { return assignedConsultant; }
    public void setAssignedConsultant(Employee assignedConsultant) { this.assignedConsultant = assignedConsultant; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public String getResumeFilename() { return resumeFilename; }
    public void setResumeFilename(String resumeFilename) { this.resumeFilename = resumeFilename; }

    public String getResumePath() { return resumePath; }
    public void setResumePath(String resumePath) { this.resumePath = resumePath; }

    public List<CandidateDocument> getDocuments() { return documents; }
    public void setDocuments(List<CandidateDocument> documents) { this.documents = documents; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public User getCreatedBy() { return createdBy; }
    public void setCreatedBy(User createdBy) { this.createdBy = createdBy; }

    // Helper methods
    public String getLocation() { 
        return city + ", " + state; 
    }

    public String getFullAddress() {
        StringBuilder addr = new StringBuilder();
        if (address1 != null && !address1.trim().isEmpty()) {
            addr.append(address1);
        }
        if (address2 != null && !address2.trim().isEmpty()) {
            if (addr.length() > 0) addr.append(", ");
            addr.append(address2);
        }
        if (city != null && !city.trim().isEmpty()) {
            if (addr.length() > 0) addr.append(", ");
            addr.append(city);
        }
        if (state != null && !state.trim().isEmpty()) {
            if (addr.length() > 0) addr.append(", ");
            addr.append(state);
        }
        if (country != null && !country.trim().isEmpty()) {
            if (addr.length() > 0) addr.append(", ");
            addr.append(country);
        }
        return addr.toString();
    }

    public String getAssignedConsultantName() {
        return assignedConsultant != null ? assignedConsultant.getFullName() : null;
    }

    public List<String> getDomainList() {
        if (domains == null || domains.trim().isEmpty()) {
            return new ArrayList<>();
        }
        return List.of(domains.split(","));
    }

    public void addDocument(CandidateDocument document) {
        documents.add(document);
        document.setBenchCandidate(this);
    }

    public void removeDocument(CandidateDocument document) {
        documents.remove(document);
        document.setBenchCandidate(null);
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    @PrePersist
    public void prePersist() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
        if (this.updatedAt == null) {
            this.updatedAt = LocalDateTime.now();
        }
        // Auto-generate full name if not provided
        if (this.fullName == null || this.fullName.trim().isEmpty()) {
            this.fullName = generateFullName();
        }
    }

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
}