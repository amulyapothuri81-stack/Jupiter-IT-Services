package com.consultancy.resume.controller;

import com.consultancy.resume.dto.BenchCandidateRequest;
import com.consultancy.resume.dto.BenchCandidateResponse;
import com.consultancy.resume.dto.CandidateDocumentResponse;
import com.consultancy.resume.entity.BenchCandidate;
import com.consultancy.resume.service.BenchCandidateService;
import com.consultancy.resume.service.UserPrincipal;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Arrays;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/bench-candidates")
public class BenchCandidateController {

    @Autowired
    private BenchCandidateService benchCandidateService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<BenchCandidateResponse> createBenchCandidate(
            @Valid @ModelAttribute BenchCandidateRequest request,
            @RequestParam(value = "documents", required = false) MultipartFile[] documents,
            @RequestParam(value = "documentTypes", required = false) String[] documentTypes,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        
        // Set document types in the request if provided
        if (documentTypes != null && documentTypes.length > 0) {
            request.setDocumentTypes(Arrays.asList(documentTypes));
        }
        
        BenchCandidateResponse candidate = benchCandidateService.createBenchCandidate(request, documents, currentUser);
        return ResponseEntity.ok(candidate);
    }

    @GetMapping
    public ResponseEntity<Page<BenchCandidateResponse>> getAllBenchCandidates(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        
        Sort sort = sortDir.equalsIgnoreCase("desc") ? 
            Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<BenchCandidateResponse> candidates = benchCandidateService.getAllBenchCandidates(pageable);
        
        return ResponseEntity.ok(candidates);
    }

    @GetMapping("/{id}")
    public ResponseEntity<BenchCandidateResponse> getBenchCandidateById(@PathVariable Long id) {
        BenchCandidateResponse candidate = benchCandidateService.getBenchCandidateById(id);
        return ResponseEntity.ok(candidate);
    }

    @PutMapping("/{id}")
    public ResponseEntity<BenchCandidateResponse> updateBenchCandidate(
            @PathVariable Long id,
            @Valid @ModelAttribute BenchCandidateRequest request,
            @RequestParam(value = "documents", required = false) MultipartFile[] documents,
            @RequestParam(value = "documentTypes", required = false) String[] documentTypes) {
        
        // Set document types in the request if provided
        if (documentTypes != null && documentTypes.length > 0) {
            request.setDocumentTypes(Arrays.asList(documentTypes));
        }
        
        BenchCandidateResponse candidate = benchCandidateService.updateBenchCandidate(id, request, documents);
        return ResponseEntity.ok(candidate);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteBenchCandidate(@PathVariable Long id) {
        benchCandidateService.deleteBenchCandidate(id);
        return ResponseEntity.ok().body("{\"message\": \"Bench candidate deleted successfully!\"}");
    }

    @GetMapping("/search")
    public ResponseEntity<Page<BenchCandidateResponse>> searchBenchCandidates(
            @RequestParam(required = false) String fullName,
            @RequestParam(required = false) BenchCandidate.VisaStatus visaStatus,
            @RequestParam(required = false) String primarySkill,
            @RequestParam(required = false) String state,
            @RequestParam(required = false) String assignedConsultantName,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<BenchCandidateResponse> candidates = benchCandidateService.searchBenchCandidates(
            fullName, visaStatus, primarySkill, state, assignedConsultantName, pageable);
        
        return ResponseEntity.ok(candidates);
    }

    @GetMapping("/consultant/{consultantId}")
    public ResponseEntity<List<BenchCandidateResponse>> getBenchCandidatesByConsultant(
            @PathVariable Long consultantId) {
        List<BenchCandidateResponse> candidates = benchCandidateService.getBenchCandidatesByConsultant(consultantId);
        return ResponseEntity.ok(candidates);
    }

    // Legacy resume download endpoint (backward compatibility)
    @GetMapping("/{id}/resume")
    public ResponseEntity<byte[]> downloadResume(@PathVariable Long id) {
        try {
            byte[] resumeData = benchCandidateService.getResumeFile(id);
            BenchCandidateResponse candidate = benchCandidateService.getBenchCandidateById(id);
            
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, 
                           "attachment; filename=\"" + (candidate.getResumeFilename() != null ? 
                               candidate.getResumeFilename() : "resume.pdf") + "\"")
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .body(resumeData);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Document management endpoints
    @GetMapping("/{id}/documents")
    public ResponseEntity<List<CandidateDocumentResponse>> getCandidateDocuments(@PathVariable Long id) {
        List<CandidateDocumentResponse> documents = benchCandidateService.getCandidateDocuments(id);
        return ResponseEntity.ok(documents);
    }

    @PostMapping("/{id}/documents")
    public ResponseEntity<CandidateDocumentResponse> uploadDocument(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        
        CandidateDocumentResponse document = benchCandidateService.uploadDocument(id, file, currentUser);
        return ResponseEntity.ok(document);
    }

    @PostMapping("/{id}/documents/multiple")
    public ResponseEntity<List<CandidateDocumentResponse>> uploadMultipleDocuments(
            @PathVariable Long id,
            @RequestParam("files") MultipartFile[] files,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        
        List<CandidateDocumentResponse> documents = new java.util.ArrayList<>();
        for (MultipartFile file : files) {
            if (!file.isEmpty()) {
                CandidateDocumentResponse document = benchCandidateService.uploadDocument(id, file, currentUser);
                documents.add(document);
            }
        }
        return ResponseEntity.ok(documents);
    }

    @GetMapping("/{candidateId}/documents/{documentId}")
    public ResponseEntity<byte[]> downloadDocument(
            @PathVariable Long candidateId,
            @PathVariable Long documentId) {
        
        try {
            byte[] documentData = benchCandidateService.downloadDocument(candidateId, documentId);
            CandidateDocumentResponse document = benchCandidateService.getDocumentById(candidateId, documentId);
            
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, 
                           "attachment; filename=\"" + document.getOriginalFilename() + "\"")
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .body(documentData);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{candidateId}/documents/{documentId}")
    public ResponseEntity<?> deleteDocument(
            @PathVariable Long candidateId,
            @PathVariable Long documentId) {
        
        benchCandidateService.deleteDocument(candidateId, documentId);
        return ResponseEntity.ok().body("{\"message\": \"Document deleted successfully!\"}");
    }

    @GetMapping("/{candidateId}/documents/{documentId}/info")
    public ResponseEntity<CandidateDocumentResponse> getDocumentInfo(
            @PathVariable Long candidateId,
            @PathVariable Long documentId) {
        
        CandidateDocumentResponse document = benchCandidateService.getDocumentById(candidateId, documentId);
        return ResponseEntity.ok(document);
    }

    // Additional endpoints for enhanced functionality
    @GetMapping("/count")
    public ResponseEntity<Long> getTotalCount() {
        Long count = benchCandidateService.getTotalBenchCandidatesCount();
        return ResponseEntity.ok(count);
    }

    @GetMapping("/recent")
    public ResponseEntity<List<BenchCandidateResponse>> getRecentCandidates(
            @RequestParam(defaultValue = "5") int limit) {
        Pageable pageable = PageRequest.of(0, limit);
        List<BenchCandidateResponse> candidates = benchCandidateService.getRecentBenchCandidates(pageable);
        return ResponseEntity.ok(candidates);
    }

    // Bulk operations
    @DeleteMapping("/bulk")
    public ResponseEntity<?> deleteBulkCandidates(@RequestParam("ids") List<Long> ids) {
        try {
            for (Long id : ids) {
                benchCandidateService.deleteBenchCandidate(id);
            }
            return ResponseEntity.ok().body("{\"message\": \"" + ids.size() + " candidates deleted successfully!\"}");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("{\"message\": \"Failed to delete candidates: " + e.getMessage() + "\"}");
        }
    }

    // Advanced search with multiple filters
    @PostMapping("/advanced-search")
    public ResponseEntity<Page<BenchCandidateResponse>> advancedSearch(
            @RequestBody BenchCandidateSearchRequest searchRequest,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        
        // Convert search request to individual parameters
        Page<BenchCandidateResponse> candidates = benchCandidateService.searchBenchCandidates(
            searchRequest.getFullName(),
            searchRequest.getVisaStatus(),
            searchRequest.getPrimarySkill(),
            searchRequest.getState(),
            searchRequest.getAssignedConsultantName(),
            pageable
        );
        
        return ResponseEntity.ok(candidates);
    }

    // Helper class for advanced search
    public static class BenchCandidateSearchRequest {
        private String fullName;
        private BenchCandidate.VisaStatus visaStatus;
        private String primarySkill;
        private String state;
        private String assignedConsultantName;
        private Integer minExperience;
        private Integer maxExperience;
        private String email;
        private List<String> domains;

        // Getters and setters
        public String getFullName() { return fullName; }
        public void setFullName(String fullName) { this.fullName = fullName; }

        public BenchCandidate.VisaStatus getVisaStatus() { return visaStatus; }
        public void setVisaStatus(BenchCandidate.VisaStatus visaStatus) { this.visaStatus = visaStatus; }

        public String getPrimarySkill() { return primarySkill; }
        public void setPrimarySkill(String primarySkill) { this.primarySkill = primarySkill; }

        public String getState() { return state; }
        public void setState(String state) { this.state = state; }

        public String getAssignedConsultantName() { return assignedConsultantName; }
        public void setAssignedConsultantName(String assignedConsultantName) { this.assignedConsultantName = assignedConsultantName; }

        public Integer getMinExperience() { return minExperience; }
        public void setMinExperience(Integer minExperience) { this.minExperience = minExperience; }

        public Integer getMaxExperience() { return maxExperience; }
        public void setMaxExperience(Integer maxExperience) { this.maxExperience = maxExperience; }

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public List<String> getDomains() { return domains; }
        public void setDomains(List<String> domains) { this.domains = domains; }
    }
}