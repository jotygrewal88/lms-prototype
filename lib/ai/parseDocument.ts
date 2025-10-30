/**
 * Epic 1G.2: Mock Document Parser
 * 
 * Simulates extracting structured content from uploaded documents (PDF, DOCX, TXT).
 * In a production environment, this would use actual PDF/DOCX parsing libraries.
 */

export interface ParsedDocument {
  summary: string;
  detectedSections: string[];
  filename: string;
}

/**
 * Mock document parser - simulates extracting structured content from files
 */
export async function parseDocument(file: File): Promise<ParsedDocument> {
  const filename = file.name;
  
  // Simulate processing delay (realistic for PDF/DOCX parsing)
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Mock extracted sections based on common safety document structure
  const mockSections = [
    "Purpose and Scope",
    "Responsibilities",
    "Procedures and Safe Work Practices",
    "Hazards and Controls",
    "Review and Continuous Improvement"
  ];
  
  // Generate mock extracted content that appears document-derived
  const mockContent = `
Document: ${filename}

PURPOSE AND SCOPE
This document outlines safety procedures and requirements for workplace operations.
All personnel must follow these guidelines to maintain a safe working environment.
The scope includes all work activities, equipment operation, and site-specific procedures.

RESPONSIBILITIES
Management: Ensure compliance, provide resources, conduct regular reviews
Supervisors: Monitor adherence, provide training, investigate incidents
Workers: Follow procedures, report hazards, participate in safety initiatives
Safety Personnel: Conduct audits, provide guidance, maintain documentation

PROCEDURES AND SAFE WORK PRACTICES
1. Conduct pre-task hazard assessment before beginning work
2. Use appropriate personal protective equipment for all tasks
3. Follow established standard operating procedures and work instructions
4. Maintain equipment in safe working condition through regular inspections
5. Report unsafe conditions immediately to supervision
6. Participate in toolbox talks and safety meetings
7. Stop work if conditions become unsafe

HAZARDS AND CONTROLS
Physical hazards: Implement engineering controls, use PPE, establish safe zones
Environmental hazards: Monitor conditions, adjust work as needed, provide barriers
Chemical hazards: Follow SDS requirements, use proper ventilation, wear appropriate PPE
Human factors: Provide training, ensure competency, manage fatigue and workload
Biological hazards: Follow hygiene protocols, use protective equipment

REVIEW AND CONTINUOUS IMPROVEMENT
Regular safety audits and inspections
Incident investigation and corrective actions
Worker feedback and suggestions
Management of change procedures
Continuous training and competency verification
Performance metrics and trend analysis
  `.trim();
  
  return {
    summary: mockContent,
    detectedSections: mockSections,
    filename
  };
}

/**
 * Validates if the uploaded file is an accepted type
 */
export function validateFileType(file: File): boolean {
  const validTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
    'text/plain'
  ];
  const validExtensions = ['.pdf', '.docx', '.doc', '.txt'];
  
  return validTypes.includes(file.type) || 
         validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
}

/**
 * Validates if the file size is within acceptable limits
 */
export function validateFileSize(file: File, maxSizeMB: number = 5): boolean {
  const maxBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxBytes;
}

/**
 * Formats file size in human-readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

/**
 * Gets a user-friendly file type label
 */
export function getFileTypeLabel(file: File): string {
  const ext = file.name.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'pdf':
      return 'PDF Document';
    case 'docx':
    case 'doc':
      return 'Word Document';
    case 'txt':
      return 'Text File';
    default:
      return 'Unknown';
  }
}

