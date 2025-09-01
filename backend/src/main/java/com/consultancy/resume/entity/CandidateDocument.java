package com.consultancy.resume.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;

@Entity
@Table(name = "candidate_documents")
public class CandidateDocument {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(name = "filename")
    private String filename;

    @NotBlank
    @Column(name = "original_filename")
    private String originalFilename;

    @NotBlank
    @Column(name = "file_path")
    private String filePath;

    @Column(name = "file_size")
    private Long fileSize;

    @Column(name = "content_type")
    private String contentType;

    @Enumerated(EnumType.STRING)
    @Column(name = "document_type")
    private DocumentType documentType = DocumentType.OTHER;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bench_candidate_id")
    private BenchCandidate benchCandidate;

    @Column(name = "uploaded_at")
    private LocalDateTime uploadedAt = LocalDateTime.now();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "uploaded_by")
    private User uploadedBy;

    @Column(name = "description")
    private String description;

    @Column(name = "is_verified")
    private Boolean isVerified = false;

    public enum DocumentType {
        I94("I-94 Document"),
        PASSPORT("Passport"),
        RESUME("Resume/CV"),
        VISA_DOCUMENT("Visa Document"),
        EAD("EAD Card"),
        SSN("SSN Card"),
        DIPLOMA("Diploma/Degree"),
        TRANSCRIPT("Transcript"),
        OTHER("Other");

        private final String displayName;
        DocumentType(String displayName) { 
            this.displayName = displayName; 
        }
        public String getDisplayName() { 
            return displayName; 
        }
    }

    // Constructors
    public CandidateDocument() {}

    public CandidateDocument(String filename, String originalFilename, String filePath, 
                           Long fileSize, String contentType, BenchCandidate benchCandidate) {
        this.filename = filename;
        this.originalFilename = originalFilename;
        this.filePath = filePath;
        this.fileSize = fileSize;
        this.contentType = contentType;
        this.benchCandidate = benchCandidate;
        this.uploadedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getFilename() { return filename; }
    public void setFilename(String filename) { this.filename = filename; }

    public String getOriginalFilename() { return originalFilename; }
    public void setOriginalFilename(String originalFilename) { this.originalFilename = originalFilename; }

    public String getFilePath() { return filePath; }
    public void setFilePath(String filePath) { this.filePath = filePath; }

    public Long getFileSize() { return fileSize; }
    public void setFileSize(Long fileSize) { this.fileSize = fileSize; }

    public String getContentType() { return contentType; }
    public void setContentType(String contentType) { this.contentType = contentType; }

    public DocumentType getDocumentType() { return documentType; }
    public void setDocumentType(DocumentType documentType) { this.documentType = documentType; }

    public BenchCandidate getBenchCandidate() { return benchCandidate; }
    public void setBenchCandidate(BenchCandidate benchCandidate) { this.benchCandidate = benchCandidate; }

    public LocalDateTime getUploadedAt() { return uploadedAt; }
    public void setUploadedAt(LocalDateTime uploadedAt) { this.uploadedAt = uploadedAt; }

    public User getUploadedBy() { return uploadedBy; }
    public void setUploadedBy(User uploadedBy) { this.uploadedBy = uploadedBy; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Boolean getIsVerified() { return isVerified; }
    public void setIsVerified(Boolean isVerified) { this.isVerified = isVerified; }

    // Helper methods
    public String getFormattedFileSize() {
        if (fileSize == null) return "Unknown";
        
        double size = fileSize.doubleValue();
        String[] units = {"B", "KB", "MB", "GB"};
        int unitIndex = 0;
        
        while (size >= 1024 && unitIndex < units.length - 1) {
            size /= 1024;
            unitIndex++;
        }
        
        return String.format("%.1f %s", size, units[unitIndex]);
    }

    public String getFileExtension() {
        if (originalFilename == null) return "";
        int lastDot = originalFilename.lastIndexOf('.');
        return lastDot > 0 ? originalFilename.substring(lastDot + 1).toLowerCase() : "";
    }

    public boolean isPdf() {
        return "pdf".equalsIgnoreCase(getFileExtension());
    }

    public boolean isImage() {
        String ext = getFileExtension();
        return "jpg".equalsIgnoreCase(ext) || "jpeg".equalsIgnoreCase(ext) || 
               "png".equalsIgnoreCase(ext) || "gif".equalsIgnoreCase(ext);
    }

    public boolean isWord() {
        String ext = getFileExtension();
        return "doc".equalsIgnoreCase(ext) || "docx".equalsIgnoreCase(ext);
    }

    public String getDocumentIcon() {
        if (isPdf()) return "📄";
        if (isWord()) return "📝";
        if (isImage()) return "🖼️";
        return "📎";
    }

    public boolean isImportantDocument() {
        return documentType == DocumentType.I94 || 
               documentType == DocumentType.PASSPORT || 
               documentType == DocumentType.VISA_DOCUMENT ||
               documentType == DocumentType.EAD;
    }
}