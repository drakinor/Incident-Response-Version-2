// Law Firm Compliance Module for Douglas G. Jackson, P.A.
// Provides regulatory and ethical compliance analysis for incident response scenarios

export interface ComplianceRequirement {
  name: string;
  description: string;
  timeframe?: string;
  penalties?: string;
  triggered: boolean;
  details: string[];
}

export interface ComplianceAnalysis {
  title: string;
  requirements: ComplianceRequirement[];
  recommendations: string[];
  ethicalConsiderations: string[];
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
}

/**
 * Analyzes compliance requirements based on incident type and scenario details
 */
export function analyzeLawFirmCompliance(
  incidentType: string,
  scenarioDetails: any,
  choices: any[]
): ComplianceAnalysis {
  
  const requirements: ComplianceRequirement[] = [];
  const recommendations: string[] = [];
  const ethicalConsiderations: string[] = [];
  
  // Always applicable - Attorney Ethical Duties
  requirements.push({
    name: "Florida Rules of Professional Conduct Rule 4-1.6 (Confidentiality)",
    description: "Lawyers must make reasonable efforts to prevent unauthorized disclosure of client information",
    triggered: true,
    details: [
      "Attorney has duty to protect all client confidences and privileged information",
      "Must implement reasonable safeguards for electronic data and communications",
      "Failure to protect client information can result in disciplinary action or malpractice claims"
    ]
  });

  // Data breach scenarios trigger specific requirements
  if (incidentType.includes('breach') || incidentType.includes('ransomware') || incidentType.includes('phishing')) {
    
    // Florida Information Protection Act (FIPA)
    requirements.push({
      name: "Florida Statute 501.171 (Florida Information Protection Act)",
      description: "Notification requirements for personal information breaches",
      timeframe: "30 days after confirmation of breach",
      penalties: "Up to $500,000 for violations",
      triggered: hasPersonalInformationBreach(scenarioDetails),
      details: [
        "Must notify affected individuals without unreasonable delay, no later than 30 days",
        "If 500+ Floridians affected, must notify FL Dept. of Legal Affairs within 30 days",
        "Notice must include breach description, types of information compromised, remedial actions"
      ]
    });

    // Client Notification Obligations
    requirements.push({
      name: "ABA Model Rule 1.4 / Client Communication Duties",
      description: "Duty to notify clients when their confidential information may be compromised",
      timeframe: "Prompt notification required",
      triggered: true,
      details: [
        "ABA Formal Opinion 483 requires notification of current clients about material data breaches",
        "Clients must be kept reasonably informed about matters affecting their representation",
        "Failure to notify can violate ethical duties and lead to malpractice liability"
      ]
    });

    ethicalConsiderations.push(
      "Designate senior partner to oversee incident response to maintain attorney-client privilege",
      "Document all response actions with privilege considerations in mind",
      "Consider engaging outside cybersecurity counsel if investigation requires privilege protection",
      "Ensure response efforts demonstrate reasonable care in protecting client information"
    );
  }

  // HIPAA considerations for health information
  if (hasHealthInformation(scenarioDetails)) {
    requirements.push({
      name: "HIPAA Breach Notification Rule (Business Associate)",
      description: "Notification requirements when handling protected health information (PHI)",
      timeframe: "60 days after breach discovery",
      penalties: "HHS investigations and potential fines",
      triggered: true,
      details: [
        "As business associate, must notify covered entity within 60 days of breach discovery",
        "Covered entity must then notify affected patients within 60 days",
        "Applies to medical records in personal injury or VA disability cases"
      ]
    });
  }

  // Cyber Insurance considerations
  requirements.push({
    name: "Cyber Liability Insurance Notification",
    description: "Many cyber policies require immediate incident notification",
    timeframe: "Immediate or within 24-72 hours",
    triggered: true,
    details: [
      "Review policy terms for specific notification requirements",
      "Early notification preserves coverage and provides access to incident response resources",
      "Insurance carrier may provide legal counsel and forensic support"
    ]
  });

  // Generate recommendations based on choices made
  recommendations.push(
    "Implement formal incident response plan compliant with Florida Bar cybersecurity guidelines",
    "Conduct regular security assessments and penetration testing to meet duty of reasonable care",
    "Maintain cyber liability insurance with appropriate coverage limits for law firm operations",
    "Establish clear procedures for preserving attorney-client privilege during incident investigations"
  );

  // Assess client confidentiality handling
  const hasGoodConfidentialityResponse = choices.some(choice => 
    choice.text.includes('senior partner') || 
    choice.text.includes('managing partner') ||
    choice.text.includes('privilege') ||
    choice.text.includes('client notification')
  );

  if (!hasGoodConfidentialityResponse) {
    ethicalConsiderations.push(
      "Response did not adequately address attorney confidentiality obligations",
      "Failed to involve senior firm leadership in privilege protection decisions"
    );
  }

  // Determine overall risk level
  const riskLevel = determineRiskLevel(requirements, choices);

  return {
    title: "Legal Practice Compliance & Ethics Analysis",
    requirements,
    recommendations,
    ethicalConsiderations,
    riskLevel
  };
}

function hasPersonalInformationBreach(scenarioDetails: any): boolean {
  // Check if scenario involves personal information that would trigger FIPA
  const description = scenarioDetails?.description?.toLowerCase() || '';
  const context = scenarioDetails?.context?.toLowerCase() || '';
  
  return description.includes('client data') ||
         description.includes('personal information') ||
         description.includes('ssn') ||
         description.includes('financial') ||
         context.includes('breach') ||
         context.includes('exfiltration');
}

function hasHealthInformation(scenarioDetails: any): boolean {
  // Check if scenario involves health information that would trigger HIPAA
  const description = scenarioDetails?.description?.toLowerCase() || '';
  const context = scenarioDetails?.context?.toLowerCase() || '';
  
  return description.includes('medical') ||
         description.includes('health') ||
         description.includes('hipaa') ||
         description.includes('phi') ||
         context.includes('injury') ||
         context.includes('disability');
}

function determineRiskLevel(requirements: ComplianceRequirement[], choices: any[]): 'Low' | 'Medium' | 'High' | 'Critical' {
  const triggeredRequirements = requirements.filter(r => r.triggered);
  const hasGoodChoices = choices.some(choice => choice.quality === 'good');
  const hasBadChoices = choices.some(choice => choice.quality === 'bad');

  if (triggeredRequirements.length >= 3 && hasBadChoices) {
    return 'Critical';
  } else if (triggeredRequirements.length >= 2 && !hasGoodChoices) {
    return 'High';
  } else if (triggeredRequirements.length >= 2 || hasBadChoices) {
    return 'Medium';
  } else {
    return 'Low';
  }
}

/**
 * Gets law firm-specific role assignments
 */
export function getLawFirmRoles(): Array<{title: string; priority: number; description: string}> {
  return [
    { title: 'Managing Partner', priority: 1, description: 'Overall incident coordination, firm leadership, and strategic decisions' },
    { title: 'Senior Partner', priority: 2, description: 'Client relations, risk assessment, and regulatory compliance oversight' },
    { title: 'Office Administrator', priority: 3, description: 'Operational coordination, vendor management, and staff communications' },
    { title: 'IT Coordinator', priority: 4, description: 'Technical assessment, system isolation, and forensic evidence preservation' },
    { title: 'Trust Account Administrator', priority: 5, description: 'Financial security, trust account protection, and audit compliance' },
    { title: 'Senior Associate', priority: 6, description: 'Case impact assessment and client communication support' },
    { title: 'Office Manager', priority: 7, description: 'Staff coordination, document security, and operational continuity' }
  ];
}

/**
 * Provides law firm-specific context for incident scenarios
 */
export function getLawFirmContext(incidentType: string): string {
  const contexts: Record<string, string> = {
    'ransomware': 'Client contract files, case documents, and trust account records encrypted. Firm operations severely impacted during critical filing periods.',
    'phishing': 'Targeted attack on firm personnel with sophisticated emails appearing to be from courts, opposing counsel, or clients.',
    'data breach': 'Unauthorized access to client files containing confidential legal documents, personal information, and privileged communications.',
    'insider': 'Current or former employee misusing access to client information, potentially violating confidentiality agreements and ethical rules.',
    'ddos': 'Law firm website and client portal overwhelmed during crucial court filing deadlines, impacting service delivery.',
    'bec': 'Email account compromise targeting client payments, trust account transfers, or settlement fund diversions.',
    'malware': 'Malicious software detected on systems handling sensitive client data, with potential for credential theft and data exfiltration.'
  };

  return contexts[incidentType] || 'Cybersecurity incident affecting law firm operations and client confidentiality.';
}