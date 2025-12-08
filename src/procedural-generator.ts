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
  summary: string;
  keyLessons: string[];
  recommendations: string[];
}

// Scenario templates
const INCIDENT_TYPES = {
  ransomware: {
    title: 'Ransomware Attack on School District',
    description: 'A sophisticated ransomware attack has encrypted critical systems across the district.',
    context: 'You are the incident response team for a K-12 school district serving 15,000 students. It\'s Monday morning, 6:30 AM.',
    initialIndicators: [
      'Multiple servers showing encrypted files',
      'Ransom note demanding $500,000 in Bitcoin',
      'Student information system is inaccessible',
      'Email system is down'
    ]
  },
  phishing: {
    title: 'Credential Phishing Campaign',
    description: 'Multiple staff members have fallen victim to a targeted phishing campaign.',
    context: 'You are managing security for a school district. Several teachers reported suspicious emails and some entered their credentials.',
    initialIndicators: [
      'HR received reports of phishing emails',
      '12 staff members clicked malicious links',
      'Unusual login attempts from foreign IPs',
      'Account takeover attempts detected'
    ]
  },
  dataBreach: {
    title: 'Student Data Breach',
    description: 'Unauthorized access to student records has been detected.',
    context: 'Your district stores sensitive student data including SSNs and medical records. An alert has been triggered.',
    initialIndicators: [
      'Database access logs show unauthorized queries',
      'Large data export detected at 2 AM',
      'Unknown IP address from overseas',
      'Student records database compromised'
    ]
  },
  insider: {
    title: 'Insider Threat Investigation',
    description: 'Suspicious activity from a system administrator account has been flagged.',
    context: 'A recently terminated IT staff member may have retained access to critical systems.',
    initialIndicators: [
      'Former employee\'s account still active',
      'Unusual file access after hours',
      'Attempted privilege escalation',
      'Files copied to external storage'
    ]
  },
  ddos: {
    title: 'DDoS Attack on District Website',
    description: 'The district website and online services are under a distributed denial of service attack.',
    context: 'It\'s the first day of online enrollment. The website has become completely inaccessible.',
    initialIndicators: [
      'Website response time extremely slow',
      'Massive traffic spike from multiple IPs',
      'Legitimate users cannot access services',
      'Enrollment deadline is today'
    ]
  }
};

// Stage templates for different phases of IR
const STAGE_TEMPLATES = {
  detection: {
    title: 'Initial Detection & Assessment',
    goodActions: [
      'Immediately activate incident response plan and assemble IR team',
      'Preserve evidence and take detailed screenshots/logs',
      'Isolate affected systems from network while preserving forensics'
    ],
    neutralActions: [
      'Monitor the situation for a few more hours to gather information',
      'Send an email to IT department asking them to investigate',
      'Restart affected systems to see if problem resolves'
    ],
    badActions: [
      'Ignore the alerts - probably a false positive',
      'Delete the suspicious files and continue working',
      'Wait until regular business hours to address'
    ]
  },
  containment: {
    title: 'Containment & Isolation',
    goodActions: [
      'Segment network to isolate infected systems while maintaining critical services',
      'Change all administrative passwords and enable MFA',
      'Work with legal and communications teams on notification strategy'
    ],
    neutralActions: [
      'Shut down entire network as precaution',
      'Reset passwords for affected accounts only',
      'Post vague message on social media about "technical difficulties"'
    ],
    badActions: [
      'Continue operations normally to avoid disruption',
      'Pay the ransom immediately to restore services',
      'Hide the incident from leadership to avoid blame'
    ]
  },
  eradication: {
    title: 'Eradication & Recovery Planning',
    goodActions: [
      'Conduct thorough forensic analysis to identify root cause and scope',
      'Remove threat actor access and patch vulnerabilities',
      'Develop detailed recovery plan with stakeholder input'
    ],
    neutralActions: [
      'Restore from backups without identifying how breach occurred',
      'Apply security patches but skip forensic analysis',
      'Bring systems back online quickly to minimize downtime'
    ],
    badActions: [
      'Restore systems immediately without removing attacker persistence',
      'Skip forensics to save time and money',
      'Blame third-party vendors and take no corrective action'
    ]
  },
  recovery: {
    title: 'Recovery & Restoration',
    goodActions: [
      'Restore systems methodically with verification at each step',
      'Implement enhanced monitoring and detection capabilities',
      'Coordinate with all stakeholders on phased restoration'
    ],
    neutralActions: [
      'Restore all systems simultaneously to save time',
      'Return to normal operations without additional safeguards',
      'Resume services before completing all security checks'
    ],
    badActions: [
      'Restore from compromised backups without verification',
      'Skip testing of restored systems',
      'Tell users everything is fine when vulnerabilities remain'
    ]
  },
  postIncident: {
    title: 'Post-Incident Review & Improvement',
    goodActions: [
      'Conduct comprehensive lessons-learned session with all stakeholders',
      'Update incident response plan based on findings',
      'Implement preventive controls to address root causes'
    ],
    neutralActions: [
      'Document what happened in an email to IT staff',
      'Plan to review security posture "when things slow down"',
      'Make minor improvements but skip formal lessons learned'
    ],
    badActions: [
      'Consider incident closed - move on to other priorities',
      'Don\'t document anything to avoid liability',
      'Blame individuals rather than addressing systemic issues'
    ]
  }
};

// Consequence templates based on choice quality
const CONSEQUENCES = {
  good: [
    'Your quick and decisive action limited the blast radius. The team is confident in the containment.',
    'Leadership is pleased with the transparency and communication. Stakeholders feel informed.',
    'Evidence has been properly preserved. This will help with forensics and any legal proceedings.',
    'The systematic approach is paying off. You have good visibility into the incident scope.',
    'Your proactive measures prevented further damage. The incident is under control.'
  ],
  neutral: [
    'The situation is partially addressed but some gaps remain. More work needed.',
    'Your approach is reasonable but may have missed some important considerations.',
    'The team is managing but would benefit from more coordination and planning.',
    'Progress is being made, though the approach could have been more effective.',
    'Some stakeholders have questions about the response strategy.'
  ],
  bad: [
    'The situation has worsened. Additional systems are now compromised.',
    'Critical evidence has been destroyed or contaminated. Forensics will be difficult.',
    'Stakeholders are confused and concerned about lack of communication.',
    'The threat actor has gained additional access due to delayed response.',
    'Legal and compliance team is worried about regulatory violations.',
    'Recovery timeline has been extended significantly due to this setback.'
  ]
};

// Feedback templates
const FEEDBACK = {
  good: [
    'Excellent decision. This follows incident response best practices.',
    'Strong choice - you prioritized both security and business continuity.',
    'Well done. This approach demonstrates mature security thinking.',
    'Solid response - you\'re considering both immediate and long-term impacts.',
    'Great call. This balances urgency with thoroughness.'
  ],
  neutral: [
    'Acceptable approach, though there might be more effective options.',
    'This works but may cause some complications later.',
    'Reasonable choice given the pressure, but not optimal.',
    'This addresses the immediate concern but misses bigger picture.',
    'Fair decision, though it could create additional challenges.'
  ],
  bad: [
    'This decision will significantly complicate the response.',
    'Poor choice - this violates incident response fundamentals.',
    'This approach will likely make the situation worse.',
    'Problematic decision that may have legal and compliance ramifications.',
    'This choice shows lack of IR experience and will cause issues.',
    'Critical error - this gives the attacker an advantage.'
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
    if (lowerPrompt.includes('ransomware')) selectedType = 'ransomware';
    else if (lowerPrompt.includes('phish')) selectedType = 'phishing';
    else if (lowerPrompt.includes('breach') || lowerPrompt.includes('data')) selectedType = 'dataBreach';
    else if (lowerPrompt.includes('insider')) selectedType = 'insider';
    else if (lowerPrompt.includes('ddos') || lowerPrompt.includes('dos')) selectedType = 'ddos';
  }
  
  const incident = INCIDENT_TYPES[selectedType as keyof typeof INCIDENT_TYPES];
  
  // Generate 4-5 stages
  const stageTypes = ['detection', 'containment', 'eradication', 'recovery', 'postIncident'];
  const numStages = 4 + Math.floor(Math.random() * 2); // 4 or 5 stages
  
  const stages: Stage[] = [];
  
  for (let i = 0; i < numStages; i++) {
    const stageType = stageTypes[i] as keyof typeof STAGE_TEMPLATES;
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
    
    // Build narrative
    let narrative = '';
    if (i === 0) {
      narrative = `${incident.initialIndicators.join('. ')}. What is your first response?`;
    } else {
      narrative = `The incident response continues. Your team needs to focus on ${stageType}. What's your next move?`;
    }
    
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
  const scoreMap = { good: 10, neutral: 0, bad: -10 };
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
  
  let summary = '';
  if (percentage >= 70) {
    summary = `Excellent response! You scored ${finalScore} out of ${maxScore} points (${percentage.toFixed(0)}%). Your team demonstrated strong incident response capabilities, following best practices and maintaining clear communication throughout the crisis. The systematic approach to detection, containment, eradication, and recovery minimized impact to the organization.`;
  } else if (percentage >= 40) {
    summary = `Good effort. You scored ${finalScore} out of ${maxScore} points (${percentage.toFixed(0)}%). Your team handled several aspects well, though there's room for improvement in following established IR procedures. Some decisions created additional challenges, but overall the incident was managed reasonably well.`;
  } else {
    summary = `Challenging response. You scored ${finalScore} out of ${maxScore} points (${percentage.toFixed(0)}%). The incident response faced significant difficulties. Several critical mistakes were made that complicated containment and recovery. This scenario highlights the importance of having a well-tested IR plan and following security fundamentals.`;
  }
  
  // Generate relevant lessons learned
  const allLessons = [
    'Speed of initial detection and response is critical - delayed action increases impact',
    'Proper evidence preservation is essential for forensics and potential legal action',
    'Communication with stakeholders must be clear, timely, and coordinated',
    'Network segmentation limits blast radius and contains incidents more effectively',
    'Regular backups and tested recovery procedures are your safety net',
    'Incident response plans must be documented, practiced, and regularly updated',
    'Multi-factor authentication can prevent many credential-based attacks',
    'Security awareness training reduces likelihood of successful phishing',
    'Never pay ransoms - it funds criminal activity and doesn\'t guarantee recovery',
    'Post-incident reviews turn painful experiences into organizational learning',
    'Legal and compliance teams must be involved early in major incidents',
    'Forensic analysis identifies root cause and prevents recurrence'
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
    'Schedule quarterly tabletop exercises to practice incident response procedures',
    'Review and update incident response plan to address gaps identified in this exercise',
    'Implement enhanced monitoring and detection capabilities on critical systems',
    'Conduct security awareness training for all staff focusing on phishing and social engineering',
    'Establish clear escalation procedures and contact lists for IR team members',
    'Test backup restoration procedures to ensure they work when needed',
    'Document and communicate roles and responsibilities during security incidents',
    'Deploy endpoint detection and response (EDR) tools for better visibility',
    'Establish relationships with external forensics and legal resources before incidents occur',
    'Implement network segmentation to limit lateral movement during breaches',
    'Create communication templates for various stakeholder groups',
    'Conduct a security architecture review focusing on defense-in-depth'
  ];
  
  const numRecs = 3 + Math.floor(Math.random() * 3);
  const recommendations = [];
  const shuffledRecs = [...allRecommendations].sort(() => Math.random() - 0.5);
  for (let i = 0; i < numRecs; i++) {
    recommendations.push(shuffledRecs[i]);
  }
  
  return {
    finalScore,
    summary,
    keyLessons,
    recommendations
  };
}
