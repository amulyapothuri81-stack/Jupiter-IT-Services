package com.consultancy.resume.repository;

import com.consultancy.resume.entity.CandidateDocument;
import com.consultancy.resume.entity.BenchCandidate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface CandidateDocumentRepository extends JpaRepository<CandidateDocument, Long> {
    
    // Find documents by bench candidate
    List<CandidateDocument> findByBenchCandidateIdOrderByUploadedAtDesc(Long benchCandidateId);
    
    // Find document by candidate and document id
    Optional<CandidateDocument> findByIdAndBenchCandidateId(Long documentId, Long benchCandidateId);
    
    // Find documents by document type
    List<CandidateDocument> findByBenchCandidateIdAndDocumentType(Long benchCandidateId, CandidateDocument.DocumentType documentType);
    
    // Count documents for a candidate
    Long countByBenchCandidateId(Long benchCandidateId);
    
    // Find documents by filename
    List<CandidateDocument> findByBenchCandidateIdAndOriginalFilenameContainingIgnoreCase(Long benchCandidateId, String filename);
    
    // Custom query to get total file size for a candidate
    @Query("SELECT COALESCE(SUM(cd.fileSize), 0) FROM CandidateDocument cd WHERE cd.benchCandidate.id = :candidateId")
    Long getTotalFileSizeByBenchCandidateId(@Param("candidateId") Long candidateId);
    
    // Delete documents by candidate
    void deleteByBenchCandidateId(Long benchCandidateId);
    
    // Check if document exists
    boolean existsByIdAndBenchCandidateId(Long documentId, Long benchCandidateId);
    
    // Find documents uploaded after a certain date
    List<CandidateDocument> findByBenchCandidateIdAndUploadedAtAfter(Long benchCandidateId, LocalDateTime date);
    
    // Find documents by content type
    List<CandidateDocument> findByBenchCandidateIdAndContentTypeContaining(Long benchCandidateId, String contentType);
    
    // Find all documents of a specific type across all candidates
    List<CandidateDocument> findByDocumentType(CandidateDocument.DocumentType documentType);
    
    // Find documents larger than specified size
    @Query("SELECT cd FROM CandidateDocument cd WHERE cd.benchCandidate.id = :candidateId AND cd.fileSize > :minSize")
    List<CandidateDocument> findLargeDocuments(@Param("candidateId") Long candidateId, @Param("minSize") Long minSize);
    
    // Find most recent document of each type for a candidate
    @Query("SELECT cd FROM CandidateDocument cd WHERE cd.benchCandidate.id = :candidateId " +
           "AND cd.uploadedAt = (SELECT MAX(cd2.uploadedAt) FROM CandidateDocument cd2 " +
           "WHERE cd2.benchCandidate.id = :candidateId AND cd2.documentType = cd.documentType)")
    List<CandidateDocument> findMostRecentDocumentsByType(@Param("candidateId") Long candidateId);
    
    // Find documents that need verification
    List<CandidateDocument> findByBenchCandidateIdAndIsVerified(Long benchCandidateId, Boolean isVerified);
    
    // Count documents by type for a candidate
    @Query("SELECT COUNT(cd) FROM CandidateDocument cd WHERE cd.benchCandidate.id = :candidateId AND cd.documentType = :documentType")
    Long countByBenchCandidateIdAndDocumentType(@Param("candidateId") Long candidateId, @Param("documentType") CandidateDocument.DocumentType documentType);
    
    // Find candidates with missing important documents
    @Query("SELECT DISTINCT bc FROM BenchCandidate bc WHERE bc.id NOT IN " +
           "(SELECT cd.benchCandidate.id FROM CandidateDocument cd WHERE cd.documentType = :documentType)")
    List<BenchCandidate> findCandidatesWithoutDocumentType(@Param("documentType") CandidateDocument.DocumentType documentType);
    
    // Get document statistics
    @Query("SELECT cd.documentType, COUNT(cd) FROM CandidateDocument cd WHERE cd.benchCandidate.id = :candidateId GROUP BY cd.documentType")
    List<Object[]> getDocumentStatsByCandidate(@Param("candidateId") Long candidateId);
    
    // Find duplicate documents (same filename and size)
    @Query("SELECT cd FROM CandidateDocument cd WHERE cd.benchCandidate.id = :candidateId " +
           "AND EXISTS (SELECT cd2 FROM CandidateDocument cd2 WHERE cd2.benchCandidate.id = :candidateId " +
           "AND cd2.id != cd.id AND cd2.originalFilename = cd.originalFilename AND cd2.fileSize = cd.fileSize)")
    List<CandidateDocument> findDuplicateDocuments(@Param("candidateId") Long candidateId);
    
    // Find orphaned documents (documents without valid file path)
    @Query("SELECT cd FROM CandidateDocument cd WHERE cd.filePath IS NULL OR cd.filePath = ''")
    List<CandidateDocument> findOrphanedDocuments();
}