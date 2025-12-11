// Procedural scenario generator - no LLM needed!
import { analyzeLawFirmCompliance, ComplianceAnalysis } from './law-firm-compliance';

export interface Choice {
  text: string;
  quality: 'good' | 'neutral' | 'bad';
}

export interface Stage {
  stageNumber: number;
  title: string;
  narrative: string;
  choices: Choice[];
  decisionMaker?: string; // Role with final authority for this stage
}

export interface TeamRole {
  title: string;
  priority: number;
  description: string;
}

export interface Scenario {
  title: string;
  description: string;
  context: string;
  stages: Stage[];
  teamRoles?: TeamRole[]; // Assigned roles based on team size
}

export interface Evaluation {
  scoreChange: number;
  feedback: string;
  consequence: string;
}

export interface Debrief {
  finalScore: number;
  maxScore: number;
  percentage: number;
  grade: string;
  gradeColor: string;
  summary: string;
  actionsSummary: string[];
  timeline: Array<{
    stageNumber: number;
    stageTitle: string;
    choiceText: string;
    quality: 'good' | 'neutral' | 'bad';
    feedback: string;
    consequence: string;
    scoreChange: number;
  }>;
  keyLessons: string[];
  recommendations: string[];
  complianceAnalysis?: ComplianceAnalysis;
}

// Scenario templates
const INCIDENT_TYPES = {
  ransomware: {
    title: 'Law Firm Ransomware Attack',
    description: 'Advanced persistent threat group has deployed ransomware targeting client files and case management systems.',
    context: 'Firm-wide security incident affecting all client case files and trust account access. Critical court filing deadlines at risk.',
    initialIndicators: [
      'Client case management server encrypted - all files inaccessible',
      'Ransom demand: $750,000 Bitcoin within 48 hours',
      'Trust accounting system offline - no financial access',
      'Email infrastructure compromised - client communications blocked'
    ]
  },
  phishing: {
    title: 'Legal Practice Credential Harvesting',
    description: 'Sophisticated phishing operation targeting attorney credentials and client confidential access.',
    context: 'Security monitoring detected coordinated phishing targeting law firm personnel with courthouse-themed emails.',
    initialIndicators: [
      'Office manager reports: 8+ attorneys received fake court notices',
      'Credential harvesting confirmed - 3 successful attorney account compromises',
      'Anomalous authentication attempts from foreign IP addresses',
      'Active client portal access attempts using stolen credentials'
    ]
  },
  dataBreach: {
    title: 'Client Information Data Breach',
    description: 'Unauthorized access to confidential client files containing privileged communications and personal data.',
    context: 'Document management system containing attorney-client privileged files and personal injury case records compromised.',
    initialIndicators: [
      'Document server audit logs: unauthorized bulk file access detected',
      'Mass download executed at 02:30 hours - 75GB of client files transferred',
      'Access origin: suspicious international IP with no business relationship',
      'Confidential client database including SSNs and medical records accessed'
    ]
  },
  insider: {
    title: 'Attorney Insider Threat',
    description: 'Former associate attorney attempting unauthorized access to current client files and confidential case materials.',
    context: 'Recently departed associate who joined competing firm exhibiting suspicious activity patterns suggesting unauthorized data access.',
    initialIndicators: [
      'Former associate credentials still active - HR deprovisioning oversight',
      'Weekend case file access from competitor law firm IP address',
      'Client contact database downloaded prior to departure',
      'Confidential merger documents copied to personal cloud storage'
    ]
  },
  ddos: {
    title: 'Law Firm DDoS Attack',
    description: 'Large-scale DDoS attack targeting firm website during critical court filing deadline.',
    context: 'Mission-critical filing deadline approaching. Client portal and e-filing services experiencing complete degradation.',
    initialIndicators: [
      'Firm website and client portal completely inaccessible',
      'Traffic analysis: 15Gbps+ volumetric attack from distributed botnet',
      'Electronic court filing system access blocked for all attorneys',
      'Critical motion filing deadline: T-minus 4 hours'
    ]
  },
  bec: {
    title: 'Legal Practice Email Compromise',
    description: 'Sophisticated email fraud targeting client payment instructions and trust account transfers.',
    context: 'Trust account administrator flagged suspicious transfer requests. Attackers impersonating senior partners.',
    initialIndicators: [
      'Managing partner email compromised - fraudulent client payment instructions sent',
      'Email header analysis reveals external origin with partner display name spoofing',
      'Two trust account wire transfer requests totaling $325,000 pending',
      'Similar phishing attempts targeting paralegals and accounting staff detected'
    ]
  },
  malware: {
    title: 'Law Firm Malware Infection',
    description: 'Advanced malware deployment targeting client data with credential harvesting and system compromise.',
    context: 'Endpoint detection flagged suspicious activity on attorney workstations. Unknown binary executing across case management systems.',
    initialIndicators: [
      'EDR alerts: unknown malware detected on 15 attorney workstations',
      'Network traffic analysis shows data exfiltration to command-and-control servers',
      'Keylogger functionality detected - client portal credentials compromised',
      'Lateral movement indicators - malware spreading via shared case files'
    ]
  }
};

// Incident Response roles by priority for Law Firm
const IR_ROLES: TeamRole[] = [
  { title: 'Managing Partner', priority: 1, description: 'Overall incident coordination, firm leadership, and strategic decisions' },
  { title: 'Senior Partner', priority: 2, description: 'Client relations, risk assessment, and regulatory compliance oversight' },
  { title: 'Office Administrator', priority: 3, description: 'Operational coordination, vendor management, and staff communications' },
  { title: 'IT Coordinator', priority: 4, description: 'Technical assessment, system isolation, and forensic evidence preservation' },
  { title: 'Trust Account Administrator', priority: 5, description: 'Financial security, trust account protection, and audit compliance' },
  { title: 'Senior Associate', priority: 6, description: 'Case impact assessment and client communication support' },
  { title: 'Office Manager', priority: 7, description: 'Staff coordination, document security, and operational continuity' },
  { title: 'Paralegal Supervisor', priority: 8, description: 'Case file integrity, document preservation, and support staff coordination' }
];

// Map stage types to appropriate decision-making roles for Law Firm
const STAGE_DECISION_MAKERS = {
  detection: 'IT Coordinator',
  containment: 'Managing Partner',
  eradication: 'Senior Partner',
  recovery: 'Office Administrator',
  postIncident: 'Managing Partner'
};

// Stage templates for different phases of IR
const STAGE_TEMPLATES = {
  detection: {
    title: 'Detection & Initial Assessment',
    goodActions: [
      'Immediately convene senior partners and authorize engagement of cybersecurity incident response firm',
      'Direct IT coordinator to preserve all evidence while coordinating with external forensics experts',
      'Authorize emergency budget allocation for incident response and engage cyber insurance carrier'
    ],
    neutralActions: [
      'Request detailed IT assessment report before escalating to senior partners',
      'Contact regular IT support vendor for initial evaluation and guidance',
      'Schedule emergency partner meeting within 24 hours to discuss response strategy'
    ],
    badActions: [
      'Instruct IT to handle internally without partner notification or external expertise',
      'Delay response until normal business hours to avoid weekend overtime costs',
      'Direct staff to continue working normally until incident scope is fully understood'
    ]
  },
  containment: {
    title: 'Containment & Threat Isolation',
    goodActions: [
      'Authorize immediate isolation of affected systems while directing IT to maintain critical court filing access',
      'Direct firm administrator to coordinate password resets with external IT security firm',
      'Convene senior partners to develop client notification strategy and assess ethical obligations'
    ],
    neutralActions: [
      'Request IT to shut down all systems as precautionary measure until Monday morning',
      'Authorize password resets only for accounts showing suspicious activity',
      'Prepare generic client communication about temporary technical difficulties'
    ],
    badActions: [
      'Direct staff to continue normal operations to avoid disrupting client deadlines',
      'Approve ransom payment authorization to restore case files immediately',
      'Instruct staff not to discuss incident details with anyone including other partners'
    ]
  },
  eradication: {
    title: 'Investigation & Root Cause Analysis',
    goodActions: [
      'Engage cybersecurity forensics firm under attorney-client privilege with senior partner oversight',
      'Direct external experts to eliminate threats while ensuring privileged communications remain protected',
      'Authorize comprehensive security assessment with managing partner approval and client impact review'
    ],
    neutralActions: [
      'Request IT vendor to restore from backups without detailed forensic investigation',
      'Authorize basic security updates while limiting investigation scope to control costs',
      'Focus on rapid case file restoration over comprehensive threat elimination'
    ],
    badActions: [
      'Direct immediate system restoration without removing attacker access or investigating scope',
      'Decline forensic investigation to minimize legal exposure and costs',
      'Blame IT vendor for incident without addressing firm security policies or training'
    ]
  },
  recovery: {
    title: 'Recovery & Service Restoration',
    goodActions: [
      'Authorize phased restoration plan with external security firm validation at each stage',
      'Direct enhanced security implementation with ongoing monitoring and staff training program',
      'Approve comprehensive insurance claim documentation and regulatory compliance reporting'
    ],
    neutralActions: [
      'Request immediate full restoration to resume normal client service operations',
      'Approve basic security improvements recommended by IT vendor',
      'Authorize standard client notifications without detailed incident explanation'
    ],
    badActions: [
      'Direct immediate return to normal operations without security improvements',
      'Refuse additional security investments to minimize incident costs',
      'Prohibit any incident disclosure to protect firm reputation'
    ]
  },
  postIncident: {
    title: 'Post-Incident Review & Lessons Learned',
    goodActions: [
      'Commission comprehensive security assessment and staff training program with ongoing monitoring',
      'Establish formal incident response policy with clear partner roles and external vendor relationships',
      'Authorize investment in enhanced cybersecurity measures and regular compliance auditing'
    ],
    neutralActions: [
      'Request basic security policy updates and annual staff training implementation',
      'Consider cyber security insurance policy review and vendor relationship evaluation',
      'Schedule quarterly partner meetings to review security posture and incident preparedness'
    ],
    badActions: [
      'Resume normal operations without policy changes or additional security investments',
      'Attribute incident to unforeseeable circumstances requiring no preventive measures',
      'Focus on individual accountability rather than systematic firm security improvement'
    ]
  }
};

// Consequence templates based on choice quality
const CONSEQUENCES = {
  good: [
    'Swift action has effectively limited incident scope. Senior partners demonstrate strong crisis leadership.',
    'Managing partner acknowledges transparent client communication. Client confidence maintained.',
    'Evidence preservation protocols properly executed. Attorney-client privilege protected during investigation.',
    'Systematic approach yielding comprehensive visibility into incident scope and client data exposure.',
    'Proactive measures successfully prevented further client file compromise. Incident contained within firm boundaries.'
  ],
  neutral: [
    'Situation partially stabilized. Several critical client notification gaps require immediate senior partner attention.',
    'Response demonstrates reasonable judgment but overlooks key ethical and regulatory considerations.',
    'Team managing incident within acceptable parameters. Enhanced senior partner coordination recommended.',
    'Progress documented. Alternative approaches may have better protected client confidentiality.',
    'Senior partners and key clients requesting clarification on response strategy and firm security posture.'
  ],
  bad: [
    'Incident scope expanding. Additional client files now compromised. Threat actor demonstrating persistence.',
    'Critical forensic evidence destroyed or contaminated. Privilege protection and investigation significantly impaired.',
    'Senior partner and client confusion escalating. Communication breakdown threatening firm reputation.',
    'Threat actor exploiting response delays to access additional confidential case files.',
    'Potential ethical violations and regulatory non-compliance exposure requiring immediate bar notification review.',
    'Case file recovery timeline extended 48-72 hours. Critical court filing deadlines now at risk.'
  ]
};

// Feedback templates
const FEEDBACK = {
  good: [
    'Exemplary decision-making. Aligns with law firm incident response best practices and ethical obligations.',
    'Strategic choice demonstrating mature law firm security mindset. Client confidentiality preserved.',
    'Professional response. This approach reflects sophisticated legal practice security thinking.',
    'Sound tactical decision considering both immediate client protection and long-term firm reputation.',
    'Excellent judgment. Optimal balance between crisis urgency and careful attorney ethical compliance.'
  ],
  neutral: [
    'Acceptable response within operational constraints. More optimal alternatives exist.',
    'Decision addresses immediate concerns but may introduce downstream complications.',
    'Reasonable judgment under pressure. Not optimal from strategic perspective.',
    'Tactical objective met. Strategic implications require additional consideration.',
    'Fair assessment. This approach may create operational challenges in subsequent phases.'
  ],
  bad: [
    'This decision significantly compromises incident response effectiveness.',
    'Problematic choice. Fundamental deviation from incident response principles.',
    'This approach will likely escalate incident severity and organizational impact.',
    'Concerning decision with potential legal, compliance, and reputational ramifications.',
    'Critical judgment error. This provides adversary with tactical advantage.',
    'Severe mistake. This decision will require significant remediation and damage control.'
  ]
};

/**
 * Assign team roles based on team size
 */
function assignTeamRoles(teamSize: number): TeamRole[] {
  if (teamSize === 1) {
    return [{ title: 'Solo Practitioner', priority: 1, description: 'All roles and responsibilities' }];
  }
  return IR_ROLES.slice(0, teamSize);
}

/**
 * Generate a procedural scenario
 */
export async function generateScenario(userPrompt?: string, teamSize: number = 4): Promise<Scenario> {
  // Select incident type (random or based on prompt)
  const incidentTypes = Object.keys(INCIDENT_TYPES);
  let selectedType = incidentTypes[Math.floor(Math.random() * incidentTypes.length)];
  
  // If user provided a prompt, try to match it
  if (userPrompt) {
    const lowerPrompt = userPrompt.toLowerCase();
    if (lowerPrompt.includes('ransomware') || lowerPrompt.includes('ransom')) selectedType = 'ransomware';
    else if (lowerPrompt.includes('phish')) selectedType = 'phishing';
    else if (lowerPrompt.includes('breach') || lowerPrompt.includes('data')) selectedType = 'dataBreach';
    else if (lowerPrompt.includes('insider')) selectedType = 'insider';
    else if (lowerPrompt.includes('ddos') || lowerPrompt.includes('dos') || lowerPrompt.includes('denial')) selectedType = 'ddos';
    else if (lowerPrompt.includes('bec') || lowerPrompt.includes('business email') || lowerPrompt.includes('wire transfer')) selectedType = 'bec';
    else if (lowerPrompt.includes('malware') || lowerPrompt.includes('spyware') || lowerPrompt.includes('virus')) selectedType = 'malware';
  }
  
  const incident = INCIDENT_TYPES[selectedType as keyof typeof INCIDENT_TYPES];
  
  // Assign team roles
  const teamRoles = assignTeamRoles(teamSize);
  
  // Generate 5-8 stages with rich narratives
  const stageTypes = ['detection', 'containment', 'eradication', 'recovery', 'postIncident'];
  const numStages = 5 + Math.floor(Math.random() * 4); // 5-8 stages
  
  const stages: Stage[] = [];
  
  // Narrative templates for each stage and incident type combination
  const narrativeTemplates: Record<string, Record<string, string[]>> = {
    ransomware: {
      detection: [
        `At 06:30 hours, your Security Operations Center receives urgent escalations from multiple departments. Workstations are displaying encryption warnings and file servers report widespread data inaccessibility. Initial triage reveals ransom notes demanding $500,000 in Bitcoin with a 72-hour deadline. The Student Information System containing records for 15,000 students is completely offline. Email infrastructure has been compromised. Network monitoring shows suspicious lateral movement over the previous 48 hours, suggesting extended threat actor presence. The Superintendent's office is requesting immediate briefing on situation and operational impact.`,
        `Your morning begins with cascading alerts from automated monitoring systems. The backup administrator reports multiple critical backup jobs failed overnight with unusual errors. Investigation reveals production file servers encrypting files at an alarming rate. The ransom demand identifies the threat actor as a known ransomware-as-a-service operation. SQL Server instances remain operational but report connectivity issues to compromised application servers. Parent portal and enrollment systems are unreachable. The Board has scheduled an emergency meeting in 4 hours. Your team must rapidly assess scope, establish command structure, and begin containment while preserving forensic evidence.`
      ],
      containment: [
        `With initial assessment complete, your team faces critical containment decisions. Network segmentation is partial, with several VLANs exposed. The threat actor has domain administrator credentials and deployed persistence mechanisms across the environment. Analysts identified 47 compromised endpoints and 12 servers with active encryption. Cyber insurance dispatched forensics consultants arriving in 6 hours. Administrative staff cannot access payroll systems with month-end processing due in 72 hours. Communications requires guidance on stakeholder notifications - parents, staff, and state officials. Legal counsel advises careful consideration of FERPA and state breach notification requirements.`,
        `The situation stabilized slightly, but significant threats remain active. Your IR team isolated critical systems, creating operational challenges district-wide. Teachers cannot access lesson plans or gradebooks. Finance cannot process vendor payments. Monitoring reveals attackers maintain access through undiscovered vectors. Password resets began but scope is overwhelming - 2,000+ accounts need remediation. Ransom deadline reduced to 48 hours with threats to publish stolen data. External counsel recommends against payment, but operational pressure mounts. The Superintendent requests detailed briefing on containment strategy, recovery timeline, and payment consideration.`
      ],
      eradication: [
        `Forensic analysis reveals full compromise scope. Threat actor gained initial access via phishing three weeks ago, then conducted reconnaissance before deploying ransomware. Persistence mechanisms discovered in scheduled tasks, WMI subscriptions, and compromised service accounts. Team identified 14 malware variants including keyloggers, credential stealers, and remote access trojans. Forensics provided IOCs and remediation procedures. Complete eradication requires rebuilding dozens of servers and reimaging hundreds of endpoints - estimated 7-10 days. Backup validation shows some encrypted files, though offline backups from two weeks ago remain viable. State education office offers assistance and inquires about district-wide infrastructure concerns.`,
        `Your eradication strategy must address immediate threats and long-term security posture. Threat actor TTPs indicate sophisticated operation with probable nation-state backing or advanced criminal capabilities. Analysis shows approximately 45GB data exfiltration over two weeks, including student records, employee information, and financial documents. Legal confirms this triggers mandatory breach notification affecting 18,000 individuals. Technical remediation requires extensive patching, security updates, and architectural changes to prevent reinfection. Implementing changes while maintaining operations presents significant challenges. The IR team must balance thorough remediation against operational requirements and limited IT resources.`
      ],
      recovery: [
        `Recovery operations begin with careful system validation. Your team established phased restoration prioritizing critical student services, then administrative functions, then supplementary systems. Decision made to restore from clean backups rather than decrypt attacker-encrypted systems, ensuring higher assurance but requiring manual reconstruction of recent data from the past two weeks. Database integrity checks show positive initial results. However, recovery reveals additional architectural weaknesses requiring resolution before production return. Enhanced monitoring deployed including EDR tools and improved network segmentation. Communications drafted notifications for affected families and employees pending legal review. Insurance assessors estimate impact between $2-4 million including recovery, forensics, legal fees, and notifications.`,
        `Phased restoration proceeds with ongoing operational challenges. First priority systems - student information and email - restored and undergoing validation. Security monitoring significantly enhanced with new tools and processes. Financial systems restoration reveals data integrity issues requiring resolution before resuming normal operations. The incident created work backlog requiring weeks to resolve. Parent and employee notifications being mailed with call center established for inquiries. Media coverage increasing with local news requesting cybersecurity interviews. State legislature considering new educational institution cybersecurity requirements. Your team must complete recovery while planning long-term security enhancements and demonstrating due diligence to stakeholders, insurers, and regulators.`
      ],
      postIncident: [
        `With systems restored, focus shifts to organizational learning. The IR team conducts comprehensive after-action review examining all response phases. Key findings: detection delayed due to insufficient monitoring; containment complicated by flat network architecture; eradication required unavailable external expertise; recovery timelines exceeded expectations due to backup shortcomings. Financial impact exceeded $3.2 million direct costs, with indirect costs (productivity, reputation, enrollment) still being assessed. The exercise demonstrated both IR plan value and critical gaps requiring resolution. The Board requests comprehensive security improvement plan with budget recommendations. Insurance requires specific security implementations for policy renewal. Staff morale affected with IT team experiencing burnout from extended response operations.`,
        `Post-incident review reveals systemic issues requiring executive attention. While immediate crisis passed, the organization faces decisions about security investments, risk tolerance, and resilience. The IR team compiled detailed recommendations addressing controls, processes, training, and governance requiring estimated $800,000 first-year costs plus ongoing expenses. The alternative is accepting elevated recurrence risk. Regulatory examinations beginning with state auditors reviewing data protection compliance. Preliminary findings suggest potential violations risking fines or corrective orders. Civil litigation concerns with families consulting attorneys about information exposure. Leadership must decide whether to position events as resolved incident or transformation catalyst. Lessons learned will shape organizational resilience for years to come.`
      ]
    },
    phishing: {
      detection: [
        `Your morning security briefing takes an urgent turn when the Help Desk escalates unusual activity. Over the past 2 hours, 12 staff members have reported suspicious emails appearing to come from the Superintendent, requesting verification of payroll direct deposit information. Several employees have already clicked the embedded links and entered their credentials on convincing fake login pages. Your email security gateway has retroactively flagged these messages, but they initially bypassed filters due to sophisticated spoofing techniques. Meanwhile, your authentication logs show anomalous login attempts from IP addresses in Eastern Europe and Southeast Asia. Four user accounts are showing signs of compromise, with password spray attacks targeting additional accounts. The scope is expanding rapidly. Human Resources is concerned about potential W-2 tax document theft. The finance director reports that someone attempted to initiate a wire transfer for $185,000 using compromised credentials - fortunately blocked by dual approval controls. You need to act decisively before this evolves into a major data breach or financial fraud incident.`,
        `The Security Operations Center escalates a critical alert: automated monitoring has detected credential harvesting activity affecting multiple user accounts. Investigation reveals a sophisticated phishing campaign specifically targeting your organization. The attack emails are highly personalized, referencing recent district events and using compromised colleague email accounts to enhance credibility. Analysis shows the initial phishing emails originated from a compromised parent account three days ago, suggesting the attackers had already gained some access to your environment. Security logs indicate that 8 accounts are confirmed compromised, with credential use from suspicious geographic locations. The attackers have been actively accessing email accounts, potentially exfiltrating sensitive communications and identifying high-value targets for business email compromise attacks. Your legal team needs immediate notification due to the potential exposure of protected student information and confidential employee communications. The Communications Director has already received inquiries from staff asking if the "password reset" emails are legitimate, indicating the campaign is widespread.`
      ],
      containment: [
        `With phishing attack scope identified, you face time-sensitive containment decisions. The eight confirmed compromised accounts must be secured immediately, but forced password resets will alert the attackers and may cause them to accelerate malicious activities. Your security team has documented the attackers accessing SharePoint sites containing student records, employee personnel files, and financial data. The decision to perform enterprise-wide password reset would affect 2,000+ users and cause significant operational disruption, but targeted resets might miss compromised accounts not yet identified. Multi-factor authentication is not currently deployed organization-wide, though it exists for privileged accounts. Email forwarding rules have been discovered on three compromised accounts, automatically forwarding sensitive messages to external addresses. The attackers have sent additional phishing emails from compromised internal accounts, potentially expanding the compromise. Legal counsel is assessing breach notification requirements - the phishing attack may constitute a reportable incident depending on what data was accessed. Meanwhile, your communications team needs guidance on messaging to employees about the incident without causing panic or alerting attackers to your response activities.`,
        `Containment operations are underway but revealing additional complexity. Password resets have been initiated for confirmed compromised accounts, but this has triggered unexpected consequences. Several critical service accounts were using affected credentials, causing temporary outages to student information systems and lunch payment processing. The attackers responded to your containment actions by accelerating their activities - within 30 minutes of the first password reset, they attempted to extract large volumes of data from multiple compromised accounts. Your data loss prevention system flagged and blocked some exfiltration attempts, but an unknown quantity of data was successfully stolen before blocks took effect. Forensic analysis shows the attackers created several backdoor accounts for persistence, using naming conventions that blend with legitimate accounts. Your Active Directory environment contains 15 recently created accounts that cannot be immediately verified as legitimate or malicious. The cyber insurance carrier requires detailed documentation of the incident timeline and response actions. State education authorities have been notified per regulatory requirements and are requesting regular updates on the incident status and affected student data.`
      ],
      eradication: [
        `Forensic investigation has mapped the complete attack chain. The initial phishing email exploited a zero-day vulnerability in a third-party portal used for parent communications. This gave attackers foothold access, which they leveraged to harvest credentials and move laterally through your environment. Evidence shows the attackers spent 72 hours conducting reconnaissance, identifying high-value targets and mapping your security controls before launching the broader phishing campaign. They created 23 unauthorized accounts, installed web shells on two servers, and established persistence through scheduled tasks and registry modifications. The sophisticated nature of the attack suggests an advanced persistent threat (APT) actor, possibly engaged in educational sector espionage or credential harvesting for future attacks. Complete eradication requires removing all attacker-controlled accounts, eliminating persistence mechanisms, and patching the exploited vulnerabilities. Your security team has compiled a remediation workbook with 147 specific action items. However, implementing these changes while maintaining operational continuity requires careful planning and coordination across multiple technical teams. The third-party vendor has released a security patch for the exploited portal, but deploying it requires a maintenance window that will affect parent communications systems.`,
        `Eradication efforts are revealing the extent of the compromise. The threat actors accessed email accounts for the Superintendent, three principals, the HR Director, and the CFO - potentially exposing highly sensitive communications including personnel matters, student disciplinary records, and confidential business negotiations. Legal counsel confirms this creates significant liability exposure and definitely triggers state breach notification laws affecting approximately 12,000 individuals whose information was accessed. The attackers also accessed financial systems, though they were prevented from executing fraudulent transactions by existing controls. However, they obtained detailed information about vendor relationships and payment processes that could be used in future business email compromise schemes. Your security team is implementing comprehensive remediation: forced password resets enterprise-wide with mandatory multi-factor authentication enrollment; deployment of enhanced email security controls; security awareness training for all employees; and architectural changes to better segment and monitor network traffic. These changes are necessary but disruptive, requiring significant user support and change management. The Board of Education is requesting a detailed security briefing, with particular focus on how this incident occurred and what measures will prevent recurrence.`
      ],
      recovery: [
        `Recovery from the phishing incident requires addressing both technical and human factors. The technical remediation is substantially complete - compromised accounts secured, persistence mechanisms removed, enhanced security controls deployed. However, the organizational impact continues. Mandatory security awareness training is being rolled out to all 2,000+ employees, requiring significant time commitment that affects normal operations. Multi-factor authentication deployment is meeting resistance from some staff who view it as inconvenient, requiring change management support from leadership. The breach notification process has generated considerable anxiety among affected families and employees, with the Help Desk handling hundreds of inquiries. Several families have expressed intent to disenroll students due to concerns about data security. Local media coverage has been critical, questioning the district's cybersecurity preparedness and leadership's judgment. Your insurance carrier has approved coverage for credit monitoring services for affected individuals, but the administrative burden of managing this program falls to your already-stretched IT and HR teams. The incident has also created tension between the IT department and other stakeholders who feel security controls are too restrictive and impede their work. Executive leadership must navigate these competing pressures while demonstrating commitment to security improvement.`,
        `As operational normalcy returns, the focus shifts to rebuilding trust and demonstrating security maturity. The communications team has developed a comprehensive stakeholder engagement plan, including town hall meetings for parents, staff briefings, and regular security updates on the district website. Metrics are being established to demonstrate security program effectiveness and track improvement over time. The incident has accelerated several security initiatives that had been delayed due to budget constraints - executive leadership recognized that the cost of prevention is far less than the cost of incident response. Enhanced email filtering, user behavior analytics, and security information and event management (SIEM) capabilities are being deployed. The IT department is receiving additional staffing resources to properly manage security operations. However, recovery also involves addressing staff burnout - the incident response team worked extended hours for three weeks, affecting morale and personal lives. Employee assistance program resources are being promoted to support affected staff. The organization is working to transform this incident from a negative event into a catalyst for positive change, though this requires sustained commitment and resources that must compete with other organizational priorities in future budget cycles.`
      ],
      postIncident: [
        `The after-action review is identifying valuable lessons about both technical controls and organizational culture. From a technical perspective, the incident revealed gaps in email security, access controls, user activity monitoring, and incident response capabilities. These gaps were known to the IT team but had not received sufficient priority or resources for remediation. The incident has changed that calculus - security is now receiving executive attention and budget allocation. However, the review also identifies human factors that contributed to the incident's success. Security awareness was insufficient, with many employees lacking understanding of phishing threats and social engineering tactics. The organizational culture sometimes prioritized convenience over security, with resistance to implementing controls perceived as inconvenient. The incident response plan existed but had never been tested through tabletop exercises, resulting in confusion and delayed response during the actual incident. Moving forward, the organization needs both technical improvements and cultural change. This requires leadership commitment, sustained resources, and recognition that cybersecurity is an organizational responsibility, not just an IT function. The Board of Education is developing new governance policies around cybersecurity, including regular reporting, risk assessment requirements, and accountability mechanisms.`,
        `Long-term organizational learning from this incident requires honest assessment and sustained commitment. The total cost of the phishing incident exceeded $1.8 million, including forensics, legal fees, notification costs, credit monitoring, technology improvements, and lost productivity. This represents approximately 12% of the district's annual IT budget - resources that could have funded proactive security measures. The reputational damage is harder to quantify but real - enrollment has declined slightly, and the district's public perception has been affected. Several high-profile families have left for private schools, citing security concerns. Regulatory investigations concluded without fines, but with recommendations for improvement that effectively create ongoing compliance obligations. The incident has transformed the organization's approach to cybersecurity. What was once viewed as a technical issue is now recognized as an enterprise risk requiring board-level governance. The district has hired a Chief Information Security Officer, established a security committee, and committed to annual security assessments and penetration testing. However, sustaining this commitment over time requires ongoing executive leadership and cultural reinforcement. The ultimate lesson is that cybersecurity is not a one-time project but an ongoing program requiring continuous investment, attention, and improvement. The question facing the organization is whether the lessons learned from this painful experience will be institutionalized or gradually forgotten as time passes and other priorities emerge.`
      ]
    }
  };
  
  // For other incident types, we'll generate similar detailed narratives (abbreviated here for space)
  // Using fallback narrative generator for incident types not yet fully detailed
  const generateNarrative = (incidentType: string, stageType: string, stageNum: number): string => {
    if (narrativeTemplates[incidentType] && narrativeTemplates[incidentType][stageType]) {
      const options = narrativeTemplates[incidentType][stageType];
      return options[Math.floor(Math.random() * options.length)];
    }
    
    // Fallback for incident types not yet fully detailed
    if (stageNum === 1) {
      return `${incident.initialIndicators.join('. ')}. Your Security Operations Center is requesting immediate escalation to incident response protocols. Initial assessment suggests this could be a significant security event requiring coordinated response across multiple teams. The executive leadership team has been notified and is requesting your immediate assessment and recommended course of action. Time is critical - delays in detection and response typically correlate with increased organizational impact and recovery costs.`;
    } else {
      const stageContexts: Record<string, string> = {
        containment: `Initial detection phase is complete. Your incident response team has assembled and begun assessing the full scope of the compromise. However, the threat actor remains active in your environment, and containment decisions must be made rapidly to prevent further damage. Network segmentation, access control changes, and system isolation all have operational impacts that must be balanced against security requirements. Your containment strategy will significantly impact both the immediate effectiveness of your response and the long-term recovery process.`,
        eradication: `Containment measures have stabilized the immediate threat, but complete eradication requires deeper investigation and remediation. Forensic analysis is revealing the tactics, techniques, and procedures used by the threat actor, including persistence mechanisms and potential data exfiltration. Your team must remove all attacker access while preserving evidence for potential legal proceedings and regulatory investigations. The eradication phase requires careful planning to ensure the threat is completely eliminated and cannot re-establish presence in your environment. This is often the most technically complex phase of incident response.`,
        recovery: `With the threat eradicated, focus shifts to restoration of normal operations. However, recovery is not simply returning to pre-incident state - it requires validation that systems are clean, implementation of lessons learned, and often architectural improvements to prevent recurrence. Your recovery strategy must balance speed of restoration against assurance of security. Stakeholder communication is critical during this phase, as operational impacts continue while recovery proceeds. The decisions made during recovery will affect both immediate operational capability and long-term organizational resilience.`,
        postIncident: `Operational recovery is substantially complete, but the incident response process is not finished. The post-incident phase is where organizational learning occurs - transforming a painful experience into improved capabilities and resilience. Your after-action review must honestly assess what worked, what didn't, and what needs to change. This requires psychological safety to discuss failures without blame, as well as executive commitment to implement recommendations. Many organizations fail to capitalize on the lessons from incidents, allowing the same vulnerabilities to persist. The decisions made in this phase will determine whether this incident strengthens your organization or represents a missed opportunity for improvement.`
      };
      return stageContexts[stageType] || `The incident response continues into the ${stageType} phase. Your team must make critical decisions that will affect the outcome of this security event.`;
    }
  };
  
  for (let i = 0; i < numStages; i++) {
    // Cycle through stage types, wrapping around if we have more stages than types
    const stageType = stageTypes[i % stageTypes.length] as keyof typeof STAGE_TEMPLATES;
    const template = STAGE_TEMPLATES[stageType];
    
    // Shuffle choices
    const choices: Choice[] = [
      { text: template.goodActions[Math.floor(Math.random() * template.goodActions.length)], quality: 'good' },
      { text: template.neutralActions[Math.floor(Math.random() * template.neutralActions.length)], quality: 'neutral' },
      { text: template.badActions[Math.floor(Math.random() * template.badActions.length)], quality: 'bad' }
    ];
    
    // Shuffle the choices so good isn't always first
    for (let j = choices.length - 1; j > 0; j--) {
      const k = Math.floor(Math.random() * (j + 1));
      [choices[j], choices[k]] = [choices[k], choices[j]];
    }
    
    // Build narrative with rich context
    const narrative = generateNarrative(selectedType, stageType, i + 1);
    
    // Assign decision maker for this stage
    const decisionMaker = STAGE_DECISION_MAKERS[stageType as keyof typeof STAGE_DECISION_MAKERS];
    
    stages.push({
      stageNumber: i + 1,
      title: template.title,
      narrative,
      choices,
      decisionMaker
    });
  }
  
  return {
    title: incident.title,
    description: incident.description,
    context: incident.context,
    stages,
    teamRoles
  };
}

/**
 * Evaluate a player's choice
 */
export async function evaluateChoice(
  scenario: Scenario,
  stageIndex: number,
  choice: Choice,
  history: any[]
): Promise<Evaluation> {
  // Adjusted scoring: Good=10, Neutral/Acceptable=7 (70%=C), Bad=-5
  const scoreMap = { good: 10, neutral: 7, bad: -5 };
  const scoreChange = scoreMap[choice.quality];
  
  // Get random feedback and consequence based on choice quality
  const feedback = FEEDBACK[choice.quality][Math.floor(Math.random() * FEEDBACK[choice.quality].length)];
  const consequence = CONSEQUENCES[choice.quality][Math.floor(Math.random() * CONSEQUENCES[choice.quality].length)];
  
  return {
    scoreChange,
    feedback,
    consequence
  };
}

/**
 * Generate final debrief
 */
export async function generateDebrief(
  scenario: Scenario,
  history: any[],
  finalScore: number
): Promise<Debrief> {
  // Calculate performance level
  const maxScore = history.length * 10;
  const percentage = (finalScore / maxScore) * 100;
  
  // Determine grade and color
  let grade = '';
  let gradeColor = '';
  if (percentage >= 90) {
    grade = 'A+';
    gradeColor = '#34a853';
  } else if (percentage >= 80) {
    grade = 'A';
    gradeColor = '#34a853';
  } else if (percentage >= 70) {
    grade = 'B';
    gradeColor = '#4a90e2';
  } else if (percentage >= 60) {
    grade = 'C';
    gradeColor = '#fbbc04';
  } else if (percentage >= 50) {
    grade = 'D';
    gradeColor = '#ff9800';
  } else {
    grade = 'F';
    gradeColor = '#ea4335';
  }
  
  let summary = '';
  if (percentage >= 70) {
    summary = `Your incident response team demonstrated enterprise-grade capabilities, adhering to NIST framework best practices throughout all phases. Strategic decision-making, clear stakeholder communication, and systematic approach to detection, containment, eradication, and recovery minimized organizational impact and positioned the organization for rapid restoration.`;
  } else if (percentage >= 40) {
    summary = `The response team managed critical aspects effectively while identifying areas for procedural enhancement. Several decisions introduced operational complexity, but core incident response objectives were achieved. This exercise validates baseline capabilities while highlighting opportunities for protocol refinement.`;
  } else {
    summary = `The incident response encountered significant operational challenges. Multiple critical judgment errors complicated containment and extended recovery timelines. This scenario underscores the importance of formalized IR procedures, regular training, and adherence to established security frameworks.`;
  }
  
  // Generate action summary from history
  const actionsSummary = history.map((item, index) => {
    const stage = scenario.stages[index];
    const quality = item.choice.quality;
    const icon = quality === 'good' ? '✓' : quality === 'neutral' ? '○' : '✗';
    return `${icon} ${stage.title}: ${item.choice.text.substring(0, 80)}...`;
  });
  
  // Generate relevant lessons learned
  const allLessons = [
    'Immediate senior partner engagement and external cybersecurity firm authorization are critical for effective response',
    'Attorney-client privilege protection requires careful vendor selection and oversight during incident investigations',
    'Client communication strategy must balance transparency obligations with ongoing investigation confidentiality',
    'Pre-established relationships with cybersecurity vendors reduce critical response delays during incidents',
    'Cyber insurance activation and documentation requirements should be incorporated into incident response planning',
    'Partner-level incident response policies must be documented, practiced regularly, and continuously updated',
    'Multi-factor authentication and staff training significantly reduce law firm vulnerability to credential attacks',
    'Security awareness programs tailored to legal profession reduce phishing and social engineering success rates',
    'Ransom payments create legal and ethical complications while providing no guarantee of client data recovery',
    'Post-incident security investments demonstrate reasonable care and may reduce malpractice liability exposure',
    'Regulatory compliance and ethical obligations must be integrated throughout the incident response lifecycle',
    'Comprehensive forensic analysis under privilege protection prevents recurrence and supports legal defense strategies'
  ];
  
  // Select 3-5 relevant lessons
  const numLessons = 3 + Math.floor(Math.random() * 3);
  const keyLessons = [];
  const shuffledLessons = [...allLessons].sort(() => Math.random() - 0.5);
  for (let i = 0; i < numLessons; i++) {
    keyLessons.push(shuffledLessons[i]);
  }
  
  // Generate actionable recommendations
  const allRecommendations = [
    'Institute quarterly tabletop exercises with senior partners to test incident response decision-making',
    'Establish formal incident response policy with clear partner roles and external vendor pre-authorization',
    'Engage cybersecurity firm for ongoing monitoring and rapid incident response capabilities',
    'Implement firm-wide security awareness training focusing on legal profession-specific threat vectors',
    'Create emergency escalation procedures with 24/7 senior partner notification and vendor activation',
    'Validate backup systems and establish tested recovery procedures for critical case management systems',
    'Document clear decision authority and communication protocols for all incident response scenarios',
    'Establish pre-incident relationships with cybersecurity forensics firms operating under attorney-client privilege',
    'Review and enhance cyber insurance coverage with specific attention to legal profession exposures',
    'Develop client communication templates for various incident scenarios with regulatory compliance review',
    'Commission comprehensive security assessment by qualified cybersecurity firm with legal industry experience',
    'Establish formal security governance with senior partner oversight and regular compliance auditing'
  ];
  
  const numRecs = 3 + Math.floor(Math.random() * 3);
  const recommendations = [];
  const shuffledRecs = [...allRecommendations].sort(() => Math.random() - 0.5);
  for (let i = 0; i < numRecs; i++) {
    recommendations.push(shuffledRecs[i]);
  }
  
  // Build timeline for detailed review
  const timeline = history.map((item, index) => {
    const stage = scenario.stages[item.stage];
    return {
      stageNumber: item.stage + 1,
      stageTitle: stage.title,
      choiceText: item.choice.text,
      quality: item.choice.quality,
      feedback: item.evaluation.feedback,
      consequence: item.evaluation.consequence,
      scoreChange: item.evaluation.scoreChange
    };
  });
  
  // Generate Law Firm compliance analysis
  const incidentType = scenario.title.toLowerCase();
  const allChoices = history.map(item => item.choice);
  const complianceAnalysis = analyzeLawFirmCompliance(incidentType, scenario, allChoices);

  return {
    finalScore,
    maxScore,
    percentage,
    grade,
    gradeColor,
    summary,
    actionsSummary,
    timeline,
    keyLessons,
    recommendations,
    complianceAnalysis
  };
}
