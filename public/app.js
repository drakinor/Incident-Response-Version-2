// Client-side application logic
let sessionId = generateSessionId();
let currentScenario = null;
let currentStage = null;

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

// Start new exercise
startBtn.addEventListener('click', async () => {
    const selectedType = scenarioType.value;
    
    loading.classList.remove('d-none');
    startBtn.disabled = true;

    try {
        const response = await fetch('/api/scenario/new', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId, prompt: selectedType })
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
    
    updateProgress(1, scenario.totalStages);
    displayStage(stage);
}

// Display a stage with its choices
function displayStage(stage) {
    document.getElementById('stage-title').textContent = stage.title;
    document.getElementById('stage-narrative').textContent = stage.narrative;
    
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
}

// Handle choice selection
async function selectChoice(choiceIndex) {
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
    
    scenarioScreen.classList.add('d-none');
    debriefScreen.classList.remove('d-none');
}

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
