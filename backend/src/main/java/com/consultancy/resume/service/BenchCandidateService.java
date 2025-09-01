package com.consultancy.resume.service;

import com.consultancy.resume.dto.BenchCandidateRequest;
import com.consultancy.resume.dto.BenchCandidateResponse;
import com.consultancy.resume.dto.CandidateDocumentResponse;
import com.consultancy.resume.entity.BenchCandidate;
import com.consultancy.resume.entity.CandidateDocument;
import com.consultancy.resume.entity.Employee;
import com.consultancy.resume.entity.User;
import com.consultancy.resume.repository.BenchCandidateRepository;
import com.consultancy.resume.repository.CandidateDocumentRepository;
import com.consultancy.resume.repository.EmployeeRepository;
import com.consultancy.resume.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class BenchCandidateService {

    @Autowired
    private BenchCandidateRepository benchCandidateRepository;

    @Autowired
    private CandidateDocumentRepository candidateDocumentRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FileStorageService fileStorageService;

    // Common date formatters for parsing different date formats
    private static final DateTimeFormatter[] DATE_FORMATTERS = {
        DateTimeFormatter.ISO_LOCAL_DATE,           // yyyy-MM-dd
        DateTimeFormatter.ofPattern("MM/dd/yyyy"),  // MM/dd/yyyy
        DateTimeFormatter.ofPattern("dd/MM/yyyy"),  // dd/MM/yyyy
        DateTimeFormatter.ofPattern("yyyy/MM/dd"),  // yyyy/MM/dd
        DateTimeFormatter.ofPattern("MM-dd-yyyy"),  // MM-dd-yyyy
        DateTimeFormatter.ofPattern("dd-MM-yyyy")   // dd-MM-yyyy
    };

    /**
     * Helper method to parse date with multiple formatters
     */
    private LocalDate parseDate(String dateStr) {
        if (dateStr == null) {
            return null;
        }
        
        String trimmedDate = dateStr.trim();
        if (trimmedDate.isEmpty()) {
            return null;
        }
        
        for (DateTimeFormatter formatter : DATE_FORMATTERS) {
            try {
                return LocalDate.parse(trimmedDate, formatter);
            } catch (DateTimeParseException e) {
                // Try next formatter
                continue;
            }
        }
        
        // If all formatters fail, log the error and return null
        System.err.println("Unable to parse date: " + trimmedDate + ". Expected formats: yyyy-MM-dd, MM/dd/yyyy, dd/MM/yyyy, etc.");
        return null;
    }

    public BenchCandidateResponse createBenchCandidate(BenchCandidateRequest request, MultipartFile[] documents, 
                                                      UserPrincipal currentUser) {
        BenchCandidate candidate = new BenchCandidate();
        
        // Personal Details
        candidate.setFirstName(request.getFirstName());
        candidate.setMiddleName(request.getMiddleName());
        candidate.setLastName(request.getLastName());
        candidate.setFullName(request.getFullName());
        candidate.setPhoneNumber(request.getPhoneNumber());
        candidate.setEmail(request.getEmail());
        candidate.setPassportNumber(request.getPassportNumber());
        candidate.setCountryOfCitizenship(request.getCountryOfCitizenship());
        candidate.setLinkedinUrl(request.getLinkedinUrl());
        
        // Address Information
        candidate.setAddress1(request.getAddress1());
        candidate.setAddress2(request.getAddress2());
        candidate.setCity(request.getCity());
        candidate.setState(request.getState());
        candidate.setCountry(request.getCountry());
        
        // Immigration Details
        candidate.setVisaStatus(request.getVisaStatus());
        candidate.setOtherVisaStatus(request.getOtherVisaStatus());
        
        // Set dates directly if they're already LocalDate, or parse if they're strings
        candidate.setStartDate(request.getStartDate());
        candidate.setEndDate(request.getEndDate());
        
        // Professional Skills
        candidate.setPrimarySkill(request.getPrimarySkill());
        candidate.setOtherPrimarySkill(request.getOtherPrimarySkill());
        candidate.setAdditionalSkills(request.getAdditionalSkills());
        candidate.setExperienceYears(request.getExperienceYears());
        
        // Handle domains - convert List to comma-separated string
        if (request.getDomains() != null && !request.getDomains().isEmpty()) {
            candidate.setDomains(String.join(",", request.getDomains()));
        }
        
        // Additional Information
        candidate.setTargetRate(request.getTargetRate());
        candidate.setNotes(request.getNotes());

        // Set assigned consultant if provided
        if (request.getAssignedConsultantId() != null) {
            Employee consultant = employeeRepository.findById(request.getAssignedConsultantId())
                .orElseThrow(() -> new RuntimeException("Consultant not found"));
            candidate.setAssignedConsultant(consultant);
        }

        // Set the user who created this candidate
        User user = userRepository.findById(currentUser.getId())
            .orElseThrow(() -> new RuntimeException("User not found"));
        candidate.setCreatedBy(user);

        // Save candidate first
        BenchCandidate savedCandidate = benchCandidateRepository.save(candidate);

        // Handle document uploads with their types
        if (documents != null && documents.length > 0 && request.getDocumentTypes() != null) {
            for (int i = 0; i < documents.length && i < request.getDocumentTypes().size(); i++) {
                MultipartFile document = documents[i];
                String documentType = request.getDocumentTypes().get(i);
                
                if (!document.isEmpty() && documentType != null && !documentType.trim().isEmpty()) {
                    try {
                        String filename = fileStorageService.storeFile(document);
                        
                        CandidateDocument candidateDoc = new CandidateDocument(
                            filename,
                            document.getOriginalFilename(),
                            filename,
                            document.getSize(),
                            document.getContentType(),
                            savedCandidate
                        );
                        candidateDoc.setUploadedBy(user);
                        
                        // Set document type from the request
                        try {
                            candidateDoc.setDocumentType(CandidateDocument.DocumentType.valueOf(documentType));
                        } catch (IllegalArgumentException e) {
                            candidateDoc.setDocumentType(CandidateDocument.DocumentType.OTHER);
                        }
                        
                        candidateDocumentRepository.save(candidateDoc);
                        
                        // Set the first resume as the main resume for backward compatibility
                        if (savedCandidate.getResumeFilename() == null && 
                            candidateDoc.getDocumentType() == CandidateDocument.DocumentType.RESUME) {
                            savedCandidate.setResumeFilename(document.getOriginalFilename());
                            savedCandidate.setResumePath(filename);
                            benchCandidateRepository.save(savedCandidate);
                        }
                        
                    } catch (Exception e) {
                        throw new RuntimeException("Failed to upload document: " + document.getOriginalFilename(), e);
                    }
                }
            }
        }

        return new BenchCandidateResponse(savedCandidate);
    }

    public BenchCandidateResponse createBenchCandidate(BenchCandidateRequest request, MultipartFile resume, 
                                                      UserPrincipal currentUser) {
        // Handle single file upload (backward compatibility)
        MultipartFile[] documents = resume != null ? new MultipartFile[]{resume} : new MultipartFile[0];
        return createBenchCandidate(request, documents, currentUser);
    }

    public Page<BenchCandidateResponse> getAllBenchCandidates(Pageable pageable) {
        Page<BenchCandidate> candidates = benchCandidateRepository.findAll(pageable);
        return candidates.map(BenchCandidateResponse::new);
    }

    public BenchCandidateResponse getBenchCandidateById(Long id) {
        BenchCandidate candidate = benchCandidateRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Bench candidate not found with id: " + id));
        return new BenchCandidateResponse(candidate);
    }

    public BenchCandidateResponse updateBenchCandidate(Long id, BenchCandidateRequest request, MultipartFile[] documents) {
        BenchCandidate candidate = benchCandidateRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Bench candidate not found with id: " + id));

        // Update personal details
        candidate.setFirstName(request.getFirstName());
        candidate.setMiddleName(request.getMiddleName());
        candidate.setLastName(request.getLastName());
        candidate.setFullName(request.getFullName());
        candidate.setPhoneNumber(request.getPhoneNumber());
        candidate.setEmail(request.getEmail());
        candidate.setPassportNumber(request.getPassportNumber());
        candidate.setCountryOfCitizenship(request.getCountryOfCitizenship());
        candidate.setLinkedinUrl(request.getLinkedinUrl());
        
        // Update address
        candidate.setAddress1(request.getAddress1());
        candidate.setAddress2(request.getAddress2());
        candidate.setCity(request.getCity());
        candidate.setState(request.getState());
        candidate.setCountry(request.getCountry());
        
        // Update immigration details
        candidate.setVisaStatus(request.getVisaStatus());
        candidate.setOtherVisaStatus(request.getOtherVisaStatus());
        
        // Update dates directly
        candidate.setStartDate(request.getStartDate());
        candidate.setEndDate(request.getEndDate());
        
        // Update skills
        candidate.setPrimarySkill(request.getPrimarySkill());
        candidate.setOtherPrimarySkill(request.getOtherPrimarySkill());
        candidate.setAdditionalSkills(request.getAdditionalSkills());
        candidate.setExperienceYears(request.getExperienceYears());
        
        // Update domains
        if (request.getDomains() != null && !request.getDomains().isEmpty()) {
            candidate.setDomains(String.join(",", request.getDomains()));
        }
        
        // Update additional info
        candidate.setTargetRate(request.getTargetRate());
        candidate.setNotes(request.getNotes());

        // Update assigned consultant
        if (request.getAssignedConsultantId() != null) {
            Employee consultant = employeeRepository.findById(request.getAssignedConsultantId())
                .orElseThrow(() -> new RuntimeException("Consultant not found"));
            candidate.setAssignedConsultant(consultant);
        } else {
            candidate.setAssignedConsultant(null);
        }

        // Handle new document uploads
        if (documents != null && documents.length > 0 && request.getDocumentTypes() != null) {
            User currentUser = candidate.getCreatedBy(); // Use existing user for simplicity
            
            for (int i = 0; i < documents.length && i < request.getDocumentTypes().size(); i++) {
                MultipartFile document = documents[i];
                String documentType = request.getDocumentTypes().get(i);
                
                if (!document.isEmpty() && documentType != null && !documentType.trim().isEmpty()) {
                    try {
                        String filename = fileStorageService.storeFile(document);
                        
                        CandidateDocument candidateDoc = new CandidateDocument(
                            filename,
                            document.getOriginalFilename(),
                            filename,
                            document.getSize(),
                            document.getContentType(),
                            candidate
                        );
                        candidateDoc.setUploadedBy(currentUser);
                        
                        try {
                            candidateDoc.setDocumentType(CandidateDocument.DocumentType.valueOf(documentType));
                        } catch (IllegalArgumentException e) {
                            candidateDoc.setDocumentType(CandidateDocument.DocumentType.OTHER);
                        }
                        
                        candidateDocumentRepository.save(candidateDoc);
                        
                    } catch (Exception e) {
                        throw new RuntimeException("Failed to upload document: " + document.getOriginalFilename(), e);
                    }
                }
            }
        }

        BenchCandidate updatedCandidate = benchCandidateRepository.save(candidate);
        return new BenchCandidateResponse(updatedCandidate);
    }

    public BenchCandidateResponse updateBenchCandidate(Long id, BenchCandidateRequest request, MultipartFile resume) {
        // Handle single file upload (backward compatibility)
        MultipartFile[] documents = resume != null ? new MultipartFile[]{resume} : new MultipartFile[0];
        return updateBenchCandidate(id, request, documents);
    }

    public void deleteBenchCandidate(Long id) {
        BenchCandidate candidate = benchCandidateRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Bench candidate not found with id: " + id));

        // Delete all documents first
        List<CandidateDocument> documents = candidateDocumentRepository.findByBenchCandidateIdOrderByUploadedAtDesc(id);
        for (CandidateDocument doc : documents) {
            fileStorageService.deleteFile(doc.getFilePath());
        }
        candidateDocumentRepository.deleteByBenchCandidateId(id);

        // Delete old resume file if exists (backward compatibility)
        if (candidate.getResumePath() != null) {
            fileStorageService.deleteFile(candidate.getResumePath());
        }

        benchCandidateRepository.delete(candidate);
    }

    public Page<BenchCandidateResponse> searchBenchCandidates(String fullName, BenchCandidate.VisaStatus visaStatus,
                                                             String primarySkill, String state, 
                                                             String assignedConsultantName, Pageable pageable) {
        Page<BenchCandidate> candidates = benchCandidateRepository.searchBenchCandidates(
            fullName, visaStatus, primarySkill, state, assignedConsultantName, pageable);
        return candidates.map(BenchCandidateResponse::new);
    }

    public List<BenchCandidateResponse> getBenchCandidatesByConsultant(Long consultantId) {
        Employee consultant = employeeRepository.findById(consultantId)
            .orElseThrow(() -> new RuntimeException("Consultant not found"));
        
        List<BenchCandidate> candidates = benchCandidateRepository.findByAssignedConsultant(consultant);
        return candidates.stream()
                .map(BenchCandidateResponse::new)
                .collect(Collectors.toList());
    }

    public List<BenchCandidateResponse> getRecentBenchCandidates(Pageable pageable) {
        List<BenchCandidate> candidates = benchCandidateRepository.findRecentBenchCandidates(pageable);
        return candidates.stream()
                .map(BenchCandidateResponse::new)
                .collect(Collectors.toList());
    }

    public byte[] getResumeFile(Long candidateId) {
        BenchCandidate candidate = benchCandidateRepository.findById(candidateId)
            .orElseThrow(() -> new RuntimeException("Bench candidate not found with id: " + candidateId));

        if (candidate.getResumePath() == null) {
            throw new RuntimeException("No resume file found for candidate");
        }

        return fileStorageService.loadFileAsBytes(candidate.getResumePath());
    }

    public Long getTotalBenchCandidatesCount() {
        return benchCandidateRepository.countBy();
    }

    // Document management methods
    public List<CandidateDocumentResponse> getCandidateDocuments(Long candidateId) {
        List<CandidateDocument> documents = candidateDocumentRepository.findByBenchCandidateIdOrderByUploadedAtDesc(candidateId);
        return documents.stream()
                .map(CandidateDocumentResponse::new)
                .collect(Collectors.toList());
    }

    public CandidateDocumentResponse uploadDocument(Long candidateId, MultipartFile file, UserPrincipal currentUser) {
        BenchCandidate candidate = benchCandidateRepository.findById(candidateId)
            .orElseThrow(() -> new RuntimeException("Bench candidate not found with id: " + candidateId));

        User user = userRepository.findById(currentUser.getId())
            .orElseThrow(() -> new RuntimeException("User not found"));

        try {
            String filename = fileStorageService.storeFile(file);
            
            CandidateDocument document = new CandidateDocument(
                filename,
                file.getOriginalFilename(),
                filename,
                file.getSize(),
                file.getContentType(),
                candidate
            );
            document.setUploadedBy(user);
            
            // Auto-determine document type based on filename
            String originalName = file.getOriginalFilename().toLowerCase();
            if (originalName.contains("resume") || originalName.contains("cv")) {
                document.setDocumentType(CandidateDocument.DocumentType.RESUME);
            } else if (originalName.contains("i94") || originalName.contains("i-94")) {
                document.setDocumentType(CandidateDocument.DocumentType.I94);
            } else if (originalName.contains("passport")) {
                document.setDocumentType(CandidateDocument.DocumentType.PASSPORT);
            } else if (originalName.contains("visa")) {
                document.setDocumentType(CandidateDocument.DocumentType.VISA_DOCUMENT);
            } else if (originalName.contains("ead")) {
                document.setDocumentType(CandidateDocument.DocumentType.EAD);
            } else if (originalName.contains("ssn")) {
                document.setDocumentType(CandidateDocument.DocumentType.SSN);
            } else if (originalName.contains("diploma") || originalName.contains("degree")) {
                document.setDocumentType(CandidateDocument.DocumentType.DIPLOMA);
            } else if (originalName.contains("transcript")) {
                document.setDocumentType(CandidateDocument.DocumentType.TRANSCRIPT);
            } else {
                document.setDocumentType(CandidateDocument.DocumentType.OTHER);
            }
            
            CandidateDocument savedDocument = candidateDocumentRepository.save(document);
            return new CandidateDocumentResponse(savedDocument);
            
        } catch (Exception e) {
            throw new RuntimeException("Failed to upload document: " + file.getOriginalFilename(), e);
        }
    }

    public byte[] downloadDocument(Long candidateId, Long documentId) {
        CandidateDocument document = candidateDocumentRepository.findByIdAndBenchCandidateId(documentId, candidateId)
            .orElseThrow(() -> new RuntimeException("Document not found"));

        return fileStorageService.loadFileAsBytes(document.getFilePath());
    }

    public void deleteDocument(Long candidateId, Long documentId) {
        CandidateDocument document = candidateDocumentRepository.findByIdAndBenchCandidateId(documentId, candidateId)
            .orElseThrow(() -> new RuntimeException("Document not found"));

        // Delete physical file
        fileStorageService.deleteFile(document.getFilePath());
        
        // Delete database record
        candidateDocumentRepository.delete(document);
    }

    public CandidateDocumentResponse getDocumentById(Long candidateId, Long documentId) {
        CandidateDocument document = candidateDocumentRepository.findByIdAndBenchCandidateId(documentId, candidateId)
            .orElseThrow(() -> new RuntimeException("Document not found"));
        
        return new CandidateDocumentResponse(document);
    }
}