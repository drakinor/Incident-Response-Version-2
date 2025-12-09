// Procedural scenario generator - no LLM needed!

export interface Choice {
  text: string;
  quality: 'good' | 'neutral' | 'bad';
}

export interface Stage {
  stageNumber: number;
  title: string;
  narrative: string;
  choices: Choice[];
}

export interface Scenario {
  title: string;
  description: string;
  context: string;
  stages: Stage[];
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
}

// Scenario templates
const INCIDENT_TYPES = {
  ransomware: {
    title: 'Enterprise Ransomware Attack',
    description: 'Advanced persistent threat group has deployed ransomware across critical infrastructure.',
    context: 'District-wide security incident affecting 15,000 students and 2,000 staff members. Monday, 06:30 hours.',
    initialIndicators: [
      'Multiple servers encrypted - file systems compromised',
      'Ransom demand: $500,000 Bitcoin within 72 hours',
      'Student Information System offline - no data access',
      'Email infrastructure unavailable'
    ]
  },
  phishing: {
    title: 'Targeted Credential Harvesting Campaign',
    description: 'Sophisticated phishing operation targeting organizational credentials and sensitive access.',
    context: 'Security operations center has detected coordinated phishing attempts. Multiple authentication compromises confirmed.',
    initialIndicators: [
      'HR escalation: 12+ reports of suspicious communications',
      'Credential harvesting confirmed - 8 successful compromises',
      'Anomalous authentication attempts from hostile nation-state IPs',
      'Active account takeover attempts in progress'
    ]
  },
  dataBreach: {
    title: 'Unauthorized Data Exfiltration',
    description: 'Unauthorized access to protected student records and personally identifiable information detected.',
    context: 'Enterprise database containing FERPA-protected records, SSNs, and medical data shows signs of compromise.',
    initialIndicators: [
      'Database audit logs: unauthorized query patterns detected',
      'Mass data export executed at 02:00 hours - 50GB transferred',
      'Access origin: international IP address with no business justification',
      'Protected student records database integrity compromised'
    ]
  },
  insider: {
    title: 'Insider Threat - Privilege Abuse',
    description: 'Former privileged user attempting unauthorized access to critical systems post-termination.',
    context: 'Recently separated system administrator exhibiting suspicious activity patterns suggesting retained access.',
    initialIndicators: [
      'Terminated employee credentials still active - deprovisioning failure',
      'After-hours system access from unusual location',
      'Privilege escalation attempts flagged by security monitoring',
      'Sensitive files copied to unauthorized external storage'
    ]
  },
  ddos: {
    title: 'Distributed Denial of Service Attack',
    description: 'Large-scale DDoS attack disrupting public-facing services during critical enrollment period.',
    context: 'Mission-critical enrollment window. Online services experiencing complete service degradation.',
    initialIndicators: [
      'Website performance degraded to inoperability',
      'Traffic analysis: 10Gbps+ volumetric attack from botnet',
      'Legitimate user access completely blocked',
      'Enrollment deadline: T-minus 6 hours'
    ]
  },
  bec: {
    title: 'Business Email Compromise (BEC)',
    description: 'Sophisticated email fraud targeting financial transactions and wire transfers.',
    context: 'Finance department flagged suspicious wire transfer requests. Attackers impersonating executives.',
    initialIndicators: [
      'CFO received fraudulent wire transfer request appearing to come from Superintendent',
      'Email header analysis reveals external origin with display name spoofing',
      'Three wire transfer requests totaling $487,000 pending approval',
      'Similar phishing attempts detected targeting accounts payable staff'
    ]
  },
  malware: {
    title: 'Malware / Spyware Infection',
    description: 'Advanced malware deployment with potential data exfiltration and system compromise.',
    context: 'Endpoint detection systems flagged suspicious process behavior. Unknown binary executing across systems.',
    initialIndicators: [
      'EDR alerts: unknown malware detected on 23 endpoints',
      'Network traffic analysis shows data exfiltration to command-and-control servers',
      'Keylogger functionality detected - credential theft suspected',
      'Lateral movement indicators - malware spreading via shared drives'
    ]
  }
};

// Stage templates for different phases of IR
const STAGE_TEMPLATES = {
  detection: {
    title: 'Detection & Initial Assessment',
    goodActions: [
      'Activate incident response protocol - assemble cross-functional IR team immediately',
      'Implement evidence preservation procedures - capture logs, memory dumps, and forensic artifacts',
      'Execute controlled isolation of affected systems while maintaining forensic integrity'
    ],
    neutralActions: [
      'Continue monitoring for additional data points before escalation',
      'Email IT department requesting investigation without formal escalation',
      'Perform system restart to determine if issue self-resolves'
    ],
    badActions: [
      'Dismiss alerts as false positive - continue normal operations',
      'Delete suspicious artifacts to clear disk space',
      'Defer response until standard business hours'
    ]
  },
  containment: {
    title: 'Containment & Threat Isolation',
    goodActions: [
      'Implement network segmentation to isolate compromised systems while preserving business continuity',
      'Execute credential rotation across all administrative accounts - enforce MFA enterprise-wide',
      'Coordinate with legal counsel and communications team on stakeholder notification strategy'
    ],
    neutralActions: [
      'Execute complete network shutdown as precautionary measure',
      'Reset credentials for identified compromised accounts only',
      'Issue generic "technical difficulties" statement to stakeholders'
    ],
    badActions: [
      'Maintain normal operations to avoid service disruption',
      'Authorize ransom payment for immediate service restoration',
      'Suppress incident details from executive leadership'
    ]
  },
  eradication: {
    title: 'Eradication & Root Cause Analysis',
    goodActions: [
      'Conduct comprehensive forensic analysis - identify attack vectors, scope, and threat actor TTPs',
      'Eliminate threat actor persistence mechanisms and remediate identified vulnerabilities',
      'Develop evidence-based recovery strategy with input from all stakeholder groups'
    ],
    neutralActions: [
      'Restore from backup without conducting root cause analysis',
      'Deploy security patches while bypassing forensic investigation',
      'Prioritize rapid service restoration over thorough remediation'
    ],
    badActions: [
      'Restore systems immediately without removing attacker foothold',
      'Eliminate forensic analysis to reduce incident costs',
      'Attribute responsibility to third-party vendors without corrective action'
    ]
  },
  recovery: {
    title: 'Recovery & Service Restoration',
    goodActions: [
      'Execute phased restoration with validation checkpoints at each stage',
      'Deploy enhanced monitoring, detection, and response capabilities',
      'Maintain continuous coordination with stakeholders throughout restoration process'
    ],
    neutralActions: [
      'Restore all systems simultaneously to minimize downtime',
      'Resume normal operations without implementing additional safeguards',
      'Initiate services before completing comprehensive security validation'
    ],
    badActions: [
      'Restore from potentially compromised backups without integrity verification',
      'Bypass testing protocols for restored infrastructure',
      'Declare full operational capability while critical vulnerabilities remain unaddressed'
    ]
  },
  postIncident: {
    title: 'Post-Incident Analysis & Enhancement',
    goodActions: [
      'Facilitate comprehensive after-action review with all stakeholder groups',
      'Update incident response procedures based on lessons learned',
      'Implement preventive controls addressing identified root causes and systemic weaknesses'
    ],
    neutralActions: [
      'Distribute incident summary via email to IT staff',
      'Schedule security posture review for future date TBD',
      'Implement tactical improvements while deferring strategic lessons learned'
    ],
    badActions: [
      'Close incident without formal documentation or review',
      'Avoid documentation to minimize organizational liability',
      'Focus on individual accountability rather than systemic improvement'
    ]
  }
};

// Consequence templates based on choice quality
const CONSEQUENCES = {
  good: [
    'Decisive action has effectively limited incident scope. Team demonstrates strong situational awareness.',
    'Executive leadership acknowledges transparent communication. Stakeholder confidence maintained.',
    'Evidence preservation protocols properly executed. Forensic analysis and legal proceedings supported.',
    'Systematic approach yielding comprehensive visibility into incident parameters and threat landscape.',
    'Proactive measures successfully prevented lateral movement. Incident contained within acceptable parameters.'
  ],
  neutral: [
    'Situation partially stabilized. Several critical gaps require immediate attention.',
    'Approach demonstrates reasonable judgment but overlooks key strategic considerations.',
    'Team managing incident within acceptable parameters. Enhanced coordination recommended.',
    'Progress documented. Alternative approaches may have yielded superior outcomes.',
    'Stakeholder groups requesting clarification on response strategy and decision rationale.'
  ],
  bad: [
    'Incident scope expanding. Additional infrastructure now compromised. Threat actor demonstrating persistence.',
    'Critical forensic evidence destroyed or contaminated. Investigation significantly impaired.',
    'Stakeholder confusion and concern escalating. Communication breakdown evident.',
    'Threat actor exploiting response delays to establish additional footholds.',
    'Legal and compliance teams identifying potential regulatory violations and liability exposure.',
    'Recovery timeline extended 48-72 hours. Business impact assessment being revised upward.'
  ]
};

// Feedback templates
const FEEDBACK = {
  good: [
    'Exemplary decision-making. Aligns with NIST incident response framework best practices.',
    'Strategic choice demonstrating mature security operations mindset. Business continuity preserved.',
    'Professional response. This approach reflects enterprise-grade security thinking.',
    'Sound tactical decision considering both immediate containment and long-term organizational impact.',
    'Excellent judgment. Optimal balance between urgency and methodical execution.'
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
 * Generate a procedural scenario
 */
export async function generateScenario(userPrompt?: string): Promise<Scenario> {
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
    
    stages.push({
      stageNumber: i + 1,
      title: template.title,
      narrative,
      choices
    });
  }
  
  return {
    title: incident.title,
    description: incident.description,
    context: incident.context,
    stages
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
    'Rapid detection and immediate response activation directly correlate with reduced organizational impact',
    'Forensic evidence preservation is mission-critical for investigation, attribution, and legal proceedings',
    'Stakeholder communication requires coordinated strategy with legal counsel and executive leadership',
    'Network segmentation architecture limits threat actor lateral movement and reduces blast radius',
    'Validated backup procedures and tested recovery capabilities are fundamental resilience requirements',
    'Incident response playbooks must be documented, exercised regularly, and continuously improved',
    'Multi-factor authentication implementation significantly reduces credential-based attack surface',
    'Security awareness programs reduce human vulnerability to social engineering and phishing campaigns',
    'Ransom payment funds criminal enterprises and provides no guarantee of data recovery or decryption',
    'After-action reviews transform incident response into organizational learning and capability enhancement',
    'Legal and compliance integration early in incident lifecycle prevents regulatory exposure',
    'Root cause analysis through forensics prevents incident recurrence and identifies systemic weaknesses'
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
    'Institute quarterly tabletop exercises simulating various threat scenarios and testing IR procedures',
    'Conduct comprehensive IR plan review - update procedures based on exercise findings and gaps identified',
    'Deploy enhanced monitoring, detection, and response (MDR) capabilities across critical infrastructure',
    'Execute organization-wide security awareness training focusing on phishing, social engineering, and threat recognition',
    'Establish formal escalation matrix with 24/7 contact procedures for IR team activation',
    'Validate backup integrity and recovery procedures - conduct restoration testing quarterly',
    'Document clear roles, responsibilities, and decision authority for all incident response personnel',
    'Implement endpoint detection and response (EDR) platform for real-time threat visibility',
    'Establish pre-incident relationships with external forensics firms, legal counsel, and cyber insurance carriers',
    'Architect network segmentation following zero-trust principles to limit adversary movement',
    'Develop communication playbooks for stakeholder groups: executives, board, employees, customers, regulators',
    'Commission third-party security architecture assessment focusing on defense-in-depth strategy'
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
    recommendations
  };
}
