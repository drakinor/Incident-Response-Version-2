// Client-side application logic
let sessionId = generateSessionId();
let currentScenario = null;
let currentStage = null;
let timerInterval = null;
let timeRemaining = 0;
let timePressureMode = 'none';

// Generate a simple session ID
function generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// DOM Elements
const welcomeScreen = document.getElementById('welcome-screen');
const scenarioScreen = document.getElementById('scenario-screen');
const debriefScreen = document.getElementById('debrief-screen');
const startBtn = document.getElementById('start-btn');
const loading = document.getElementById('loading');
const scenarioType = document.getElementById('scenario-type');
const difficultyLevel = document.getElementById('difficulty-level');
const orgContext = document.getElementById('org-context');
const timePressure = document.getElementById('time-pressure');
const teamSizeSelect = document.getElementById('team-size');

// Start new exercise
startBtn.addEventListener('click', async () => {
    const selectedType = scenarioType.value;
    const difficulty = difficultyLevel.value;
    const context = orgContext.value;
    const teamSize = parseInt(teamSizeSelect.value) || 4;
    timePressureMode = timePressure.value;
    
    loading.classList.remove('d-none');
    startBtn.disabled = true;

    try {
        const response = await fetch('/api/scenario/new', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                sessionId, 
                prompt: selectedType,
                difficulty: difficulty,
                orgContext: context,
                teamSize: teamSize
            })
        });

        const data = await response.json();
        
        if (data.error) {
            alert('Error: ' + data.error);
            return;
        }

        currentScenario = data.scenario;
        currentStage = data.stage;

        displayScenario(data.scenario, data.stage);
        
        welcomeScreen.classList.add('d-none');
        scenarioScreen.classList.remove('d-none');
    } catch (error) {
        alert('Failed to start exercise: ' + error.message);
    } finally {
        loading.classList.add('d-none');
        startBtn.disabled = false;
    }
});

// Display scenario and first stage
function displayScenario(scenario, stage) {
    document.getElementById('scenario-title').textContent = scenario.title;
    document.getElementById('scenario-description').textContent = scenario.description;
    document.getElementById('total-stages').textContent = scenario.totalStages;
    document.getElementById('current-stage').textContent = 1;
    document.getElementById('current-score').textContent = 0;
    
    // Display team roster
    displayTeamRoster(scenario.teamRoles);
    
    updateProgress(1, scenario.totalStages);
    displayStage(stage);
}

// Display team roles
function displayTeamRoster(teamRoles) {
    const teamRosterSection = document.getElementById('team-roster');
    const teamRosterList = document.getElementById('team-roster-list');
    
    if (!teamRoles || teamRoles.length === 0) {
        teamRosterSection.classList.add('d-none');
        return;
    }
    
    teamRosterList.innerHTML = '';
    teamRoles.forEach(role => {
        const roleCard = document.createElement('div');
        roleCard.className = 'badge bg-secondary fs-6 p-2';
        roleCard.innerHTML = `<strong>${role.title}</strong><br><small class="text-muted">${role.description}</small>`;
        roleCard.style.cssText = 'min-width: 180px; text-align: left; white-space: normal; line-height: 1.4;';
        teamRosterList.appendChild(roleCard);
    });
    
    teamRosterSection.classList.remove('d-none');
}

// Display a stage with its choices
function displayStage(stage) {
    document.getElementById('stage-title').textContent = stage.title;
    document.getElementById('stage-narrative').textContent = stage.narrative;
    
    // Display decision maker if available
    const decisionMakerBadge = document.getElementById('decision-maker-badge');
    if (stage.decisionMaker) {
        decisionMakerBadge.textContent = `👤 Decision Maker: ${stage.decisionMaker}`;
        decisionMakerBadge.classList.remove('d-none');
    } else {
        decisionMakerBadge.classList.add('d-none');
    }
    
    // Set urgency indicator based on stage
    const stageNum = stage.stageNumber;
    const urgencyIndicator = document.getElementById('urgency-indicator');
    if (stageNum <= 2) {
        urgencyIndicator.textContent = 'CRITICAL - IMMEDIATE ACTION REQUIRED';
        urgencyIndicator.className = 'badge bg-danger';
    } else if (stageNum <= 4) {
        urgencyIndicator.textContent = 'HIGH STAKES - SIGNIFICANT IMPACT';
        urgencyIndicator.className = 'badge bg-warning text-dark';
    } else {
        urgencyIndicator.textContent = 'STRATEGIC - LONG-TERM CONSEQUENCES';
        urgencyIndicator.className = 'badge bg-info';
    }
    
    const choicesContainer = document.getElementById('choices-container');
    choicesContainer.innerHTML = '';
    
    stage.choices.forEach((choice, index) => {
        const choiceCard = document.createElement('div');
        choiceCard.className = 'col-md-4';
        choiceCard.innerHTML = `
            <div class="card choice-card h-100" data-choice="${index}">
                <div class="card-body text-center">
                    <div class="choice-number">${index + 1}</div>
                    <p class="mt-3">${choice.text}</p>
                </div>
            </div>
        `;
        
        choiceCard.querySelector('.choice-card').addEventListener('click', () => {
            selectChoice(index);
        });
        
        choicesContainer.appendChild(choiceCard);
    });
    
    // Hide evaluation feedback
    document.getElementById('evaluation-feedback').classList.add('d-none');
    
    // Start timer if enabled
    startPhaseTimer();
    
    // Trigger interrupt event randomly (30% chance on phases 2-4)
    if (stageNum >= 2 && stageNum <= 4 && Math.random() < 0.3) {
        setTimeout(() => showInterruptEvent(stageNum), Math.random() * 15000 + 10000); // 10-25 sec delay
    }
}

// Timer functions
function startPhaseTimer() {
    // Clear any existing timer
    if (timerInterval) {
        clearInterval(timerInterval);
    }
    
    if (timePressureMode === 'none') {
        document.getElementById('timer-display').classList.add('d-none');
        return;
    }
    
    // Set time based on pressure level
    timeRemaining = timePressureMode === 'realistic' ? 180 : 90; // 3 min or 90 sec
    
    document.getElementById('timer-display').classList.remove('d-none');
    updateTimerDisplay();
    
    timerInterval = setInterval(() => {
        timeRemaining--;
        updateTimerDisplay();
        
        if (timeRemaining <= 0) {
            clearInterval(timerInterval);
            handleTimerExpiry();
        }
    }, 1000);
}

function updateTimerDisplay() {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    const display = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    document.getElementById('time-remaining').textContent = display;
    
    const timerBadge = document.querySelector('.pulse-timer');
    if (timeRemaining <= 30) {
        timerBadge.classList.add('timer-critical');
    } else if (timeRemaining <= 60) {
        timerBadge.classList.add('timer-warning');
        timerBadge.classList.remove('timer-critical');
    }
}

function handleTimerExpiry() {
    alert('⏰ TIME EXPIRED! Decision is being made based on current assessment.');
    // Auto-select neutral choice (middle option)
    const choices = document.querySelectorAll('.choice-card');
    if (choices.length > 0) {
        selectChoice(1); // Select middle choice
    }
}

// Interrupt event system
function showInterruptEvent(stageNum) {
    const interruptEvents = [
        {
            message: 'CEO demanding immediate briefing on media inquiry',
            context: 'Board meeting in 30 minutes. What do we tell stakeholders?'
        },
        {
            message: 'Hospital CMO: "We\'ve had to cancel 12 surgeries. How long until systems are back?"',
            context: 'Patient safety is paramount. Operations team needs decision now.'
        },
        {
            message: 'Legal Counsel: "Local news is running a story tonight. We need to coordinate messaging."',
            context: 'Reputation management requires immediate response strategy.'
        },
        {
            message: 'CFO: "Cyber insurance carrier is on the line. They\'re asking about our response protocols."',
            context: 'Coverage may be affected by our decisions. They need documentation.'
        },
        {
            message: 'HR Director: "Employees are asking questions. Some are worried about payroll data exposure."',
            context: 'Internal communication critical. Morale and trust at stake.'
        }
    ];
    
    const event = interruptEvents[Math.floor(Math.random() * interruptEvents.length)];
    document.getElementById('interrupt-message').textContent = event.message;
    document.getElementById('interrupt-context').textContent = event.context;
    document.getElementById('interrupt-event').classList.remove('d-none');
}

document.getElementById('dismiss-interrupt').addEventListener('click', () => {
    document.getElementById('interrupt-event').classList.add('d-none');
});

// Handle choice selection
async function selectChoice(choiceIndex) {
    // Stop timer
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    
    // Disable all choices
    const choices = document.querySelectorAll('.choice-card');
    choices.forEach(c => c.style.pointerEvents = 'none');
    
    // Highlight selected choice
    choices[choiceIndex].classList.add('selected');

    try {
        const response = await fetch('/api/scenario/choice', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId, choiceIndex })
        });

        const data = await response.json();
        
        if (data.error) {
            alert('Error: ' + data.error);
            return;
        }

        if (data.complete) {
            // Show debrief
            displayDebrief(data.debrief);
        } else {
            // Show evaluation and next stage
            displayEvaluation(data.evaluation, data.nextStage, data.currentScore);
        }
    } catch (error) {
        alert('Failed to process choice: ' + error.message);
        choices.forEach(c => c.style.pointerEvents = 'auto');
    }
}

// Display evaluation feedback
function displayEvaluation(evaluation, nextStage, currentScore) {
    const stageNum = parseInt(document.getElementById('current-stage').textContent);
    
    document.getElementById('evaluation-text').textContent = evaluation.feedback;
    document.getElementById('consequence-text').textContent = evaluation.consequence;
    document.getElementById('evaluation-feedback').classList.remove('d-none');
    
    // Update score
    document.getElementById('current-score').textContent = currentScore;
    
    // Store next stage for continue button
    document.getElementById('continue-btn').onclick = () => {
        document.getElementById('current-stage').textContent = stageNum + 1;
        updateProgress(stageNum + 1, currentScenario.totalStages);
        displayStage(nextStage);
        
        // Re-enable choices
        document.querySelectorAll('.choice-card').forEach(c => {
            c.style.pointerEvents = 'auto';
            c.classList.remove('selected');
        });
    };
}

// Display final debrief
function displayDebrief(debrief) {
    // Display score and grade with color coding
    const scoreElement = document.getElementById('final-score');
    scoreElement.textContent = `${debrief.finalScore}/${debrief.maxScore} (${Math.round(debrief.percentage)}%)`;
    
    const gradeElement = document.getElementById('final-grade');
    gradeElement.textContent = debrief.grade;
    gradeElement.style.backgroundColor = debrief.gradeColor;
    gradeElement.style.color = 'white';
    
    // Color the debrief card header and add hue to the entire card
    const debriefCard = document.querySelector('#debrief-screen .card');
    const debriefHeader = document.querySelector('#debrief-screen .card-header');
    
    debriefHeader.style.backgroundColor = debrief.gradeColor;
    debriefHeader.style.color = 'white';
    
    // Add a subtle colored hue to the entire card using box-shadow
    debriefCard.style.boxShadow = `0 0 40px ${debrief.gradeColor}40, 0 0 80px ${debrief.gradeColor}20`;
    debriefCard.style.border = `2px solid ${debrief.gradeColor}60`;
    
    // Display performance summary
    document.getElementById('debrief-summary').textContent = debrief.summary;
    
    // Display detailed timeline for discussion
    const timelineContainer = document.getElementById('timeline-container');
    timelineContainer.innerHTML = '';
    debrief.timeline.forEach((item, index) => {
        const timelineCard = document.createElement('div');
        timelineCard.className = 'card mb-3';
        
        // Determine color based on quality
        let borderColor = '#34a853'; // green
        let bgColor = '#34a85310'; // light green
        let qualityBadge = 'STRONG DECISION';
        let qualityIcon = '✓';
        let scoreDisplay = `+${item.scoreChange}`;
        
        if (item.quality === 'neutral') {
            borderColor = '#fbbc04'; // amber
            bgColor = '#fbbc0410'; // light amber
            qualityBadge = 'ACCEPTABLE';
            qualityIcon = '○';
            scoreDisplay = `${item.scoreChange}`;
        } else if (item.quality === 'bad') {
            borderColor = '#ea4335'; // red
            bgColor = '#ea433510'; // light red
            qualityBadge = 'SUBOPTIMAL';
            qualityIcon = '✗';
            scoreDisplay = `${item.scoreChange}`;
        }
        
        timelineCard.style.borderLeft = `5px solid ${borderColor}`;
        timelineCard.style.backgroundColor = bgColor;
        
        timelineCard.innerHTML = `
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-start mb-2">
                    <h6 class="mb-0 text-uppercase fw-bold">Stage ${item.stageNumber}: ${item.stageTitle}</h6>
                    <div class="text-end">
                        <span class="badge" style="background-color: ${borderColor}; color: white;">${qualityIcon} ${qualityBadge}</span>
                        <span class="badge bg-secondary ms-2">${scoreDisplay} pts</span>
                    </div>
                </div>
                <div class="mt-2">
                    <p class="mb-2"><strong>Decision Made:</strong> ${item.choiceText}</p>
                    <p class="mb-2"><strong>Assessment:</strong> ${item.feedback}</p>
                    <p class="mb-0"><strong>Outcome:</strong> ${item.consequence}</p>
                </div>
            </div>
        `;
        
        timelineContainer.appendChild(timelineCard);
    });
    
    // Display actions taken
    const actionsList = document.getElementById('actions-list');
    actionsList.innerHTML = '';
    debrief.actionsSummary.forEach(action => {
        const li = document.createElement('li');
        li.className = 'list-group-item';
        // Color code based on icon
        if (action.startsWith('✓')) {
            li.style.borderLeftColor = '#34a853';
            li.style.borderLeftWidth = '4px';
        } else if (action.startsWith('✗')) {
            li.style.borderLeftColor = '#ea4335';
            li.style.borderLeftWidth = '4px';
        } else {
            li.style.borderLeftColor = '#fbbc04';
            li.style.borderLeftWidth = '4px';
        }
        li.textContent = action;
        actionsList.appendChild(li);
    });
    
    const lessonsList = document.getElementById('lessons-list');
    lessonsList.innerHTML = '';
    debrief.keyLessons.forEach(lesson => {
        const li = document.createElement('li');
        li.className = 'list-group-item';
        li.textContent = lesson;
        lessonsList.appendChild(li);
    });
    
    const recsList = document.getElementById('recommendations-list');
    recsList.innerHTML = '';
    debrief.recommendations.forEach(rec => {
        const li = document.createElement('li');
        li.className = 'list-group-item';
        li.textContent = rec;
        recsList.appendChild(li);
    });
    
    // Display compliance analysis if available
    if (debrief.complianceAnalysis) {
        displayComplianceAnalysis(debrief.complianceAnalysis);
    }
    
    // Display discussion prompts for facilitators
    const promptsList = document.getElementById('prompts-list');
    promptsList.innerHTML = '';
    const discussionPrompts = [
        `Which decision point felt most challenging, and why? How would your organization handle this in real life?`,
        `Review Stage ${Math.ceil(debrief.timeline.length / 2)}: Could alternative approaches have improved the outcome?`,
        `What communication channels and stakeholders would need to be activated for this type of incident?`,
        `Does your organization have the documented procedures needed for each phase of this response?`,
        `What resources (tools, staff, external partners) would be needed to execute the recommended actions?`,
        `How would time pressure affect decision-making in a real incident? What can be pre-planned?`,
        `Which lessons learned should become action items for your incident response plan?`
    ];
    
    discussionPrompts.forEach(prompt => {
        const li = document.createElement('li');
        li.className = 'mb-2';
        li.textContent = prompt;
        promptsList.appendChild(li);
    });
    
    scenarioScreen.classList.add('d-none');
    debriefScreen.classList.remove('d-none');
}

// Print/Export functionality
document.getElementById('print-btn').addEventListener('click', () => {
    window.print();
});

// Update progress bar
function updateProgress(current, total) {
    const percent = (current / total) * 100;
    document.getElementById('progress-bar').style.width = percent + '%';
    document.getElementById('progress-bar').textContent = Math.round(percent) + '%';
}

// Restart exercise
document.getElementById('restart-btn').addEventListener('click', () => {
    sessionId = generateSessionId();
    currentScenario = null;
    currentStage = null;
    
    debriefScreen.classList.add('d-none');
    welcomeScreen.classList.remove('d-none');
    
    document.getElementById('scenario-prompt').value = '';
});

// Display compliance analysis
function displayComplianceAnalysis(complianceAnalysis) {
    // Set risk level with color coding
    const riskElement = document.getElementById('compliance-risk-level');
    const riskBadge = document.getElementById('compliance-risk-badge');
    riskElement.textContent = complianceAnalysis.riskLevel;
    
    // Color code risk levels with subtle styling
    const riskStyles = {
        'Low': { color: '#198754', bg: '#d1e7dd' },
        'Medium': { color: '#fd7e14', bg: '#fff3cd' },
        'High': { color: '#dc3545', bg: '#f8d7da' },
        'Critical': { color: '#ffffff', bg: '#dc3545' }
    };
    
    const style = riskStyles[complianceAnalysis.riskLevel] || { color: '#6c757d', bg: '#e9ecef' };
    riskBadge.style.backgroundColor = style.bg;
    riskBadge.style.color = style.color;
    riskBadge.style.border = `1px solid ${style.color}30`;
    
    // Display compliance requirements with cleaner styling
    const requirementsContainer = document.getElementById('compliance-requirements');
    requirementsContainer.innerHTML = '';
    
    complianceAnalysis.requirements.forEach(req => {
        if (req.triggered) {
            const reqDiv = document.createElement('div');
            reqDiv.className = 'alert alert-light border-start border-warning border-3 mb-3 py-3';
            reqDiv.style.borderLeftWidth = '4px';
            
            let additionalInfo = '';
            if (req.timeframe || req.penalties) {
                additionalInfo = '<div class="row mt-3">';
                if (req.timeframe) {
                    additionalInfo += `<div class="col-md-6"><small class="text-muted"><strong>Timeframe:</strong> ${req.timeframe}</small></div>`;
                }
                if (req.penalties) {
                    additionalInfo += `<div class="col-md-6"><small class="text-muted"><strong>Penalties:</strong> ${req.penalties}</small></div>`;
                }
                additionalInfo += '</div>';
            }
            
            reqDiv.innerHTML = `
                <div class="d-flex align-items-start">
                    <div class="me-3 mt-1">
                        <span class="badge bg-warning text-dark rounded-circle" style="width: 24px; height: 24px; display: flex; align-items: center; justify-content: center;">⚠</span>
                    </div>
                    <div class="flex-grow-1">
                        <h6 class="alert-heading mb-2">${req.name}</h6>
                        <p class="mb-2">${req.description}</p>
                        ${additionalInfo}
                        <details class="mt-3">
                            <summary class="btn btn-link p-0 text-decoration-none small">View Details</summary>
                            <ul class="mt-2 mb-0 small text-muted">
                                ${req.details.map(detail => `<li class="mb-1">${detail}</li>`).join('')}
                            </ul>
                        </details>
                    </div>
                </div>
            `;
            
            requirementsContainer.appendChild(reqDiv);
        }
    });
    
    // Display compliance recommendations with icons
    const complianceRecsList = document.getElementById('compliance-recommendations-list');
    complianceRecsList.innerHTML = '';
    complianceAnalysis.recommendations.forEach(rec => {
        const li = document.createElement('li');
        li.className = 'mb-2 d-flex align-items-start';
        li.innerHTML = `
            <span class="me-2 mt-1 text-primary">•</span>
            <span class="small">${rec}</span>
        `;
        complianceRecsList.appendChild(li);
    });
    
    // Display ethical considerations with icons
    const ethicalList = document.getElementById('ethical-considerations-list');
    ethicalList.innerHTML = '';
    complianceAnalysis.ethicalConsiderations.forEach(consideration => {
        const li = document.createElement('li');
        li.className = 'mb-2 d-flex align-items-start';
        li.innerHTML = `
            <span class="me-2 mt-1 text-info">•</span>
            <span class="small">${consideration}</span>
        `;
        ethicalList.appendChild(li);
    });
}
