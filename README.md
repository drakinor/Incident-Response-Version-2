# IRP Tabletop Simulator

Lightweight, procedurally-generated incident response tabletop simulator for K-12 and similar environments.

## Overview

This Node.js + TypeScript web application generates realistic incident response scenarios using procedural generation (like No Man's Sky generates planets). It's designed for security teams, CTOs, and incident response facilitators to conduct training exercises with their teams.

**No AI API keys required!** Everything runs locally with pre-built scenario templates and randomization algorithms.

### Key Features

- **Procedurally-Generated Scenarios**: Dynamic incident response scenarios using algorithmic templates
- **5 Incident Types**: Ransomware, Phishing, Data Breach, Insider Threat, DDoS attacks
- **Multi-Stage Exercises**: 5 escalating stages per scenario (Detection → Containment → Eradication → Recovery → Post-Incident)
- **Decision-Based Learning**: 3 choices per stage (good/neutral/bad) with randomized presentation
- **Real-Time Scoring**: Tracks team performance throughout the exercise (+10/0/-10 per stage)
- **Comprehensive Debrief**: Performance-based lessons learned and recommendations
- **Facilitator-Friendly**: Simple interface designed for casting to a TV/projector
- **Offline Ready**: No external dependencies or API calls needed

## Quick Start

### Prerequisites

- **Node.js** (LTS version 20.x or higher) - [Download from nodejs.org](https://nodejs.org/)

### Installation

1. **Clone or download this repository**

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the server**
   ```bash
   npm start
   ```

4. **Open in your browser**
   
   Navigate to: **http://localhost:3000**

That's it! No API keys, no configuration, just run and go.

## How to Run a Tabletop Exercise

### Setup

1. Start the application (`npm start`)
2. Open http://localhost:3000 in your browser
3. Cast your browser window to a TV or projector
4. Gather your incident response team

### Running the Exercise

1. **Generate Scenario**
   - Select an incident type (Random, Ransomware, Phishing, Data Breach, Insider Threat, or DDoS)
   - Or leave on "Random" for variety
   - Click "Start Exercise"
   - Scenario generates instantly (no waiting!)

2. **Navigate Each Stage**
   - Read the narrative inject aloud to your team
   - Display the 3 response options (randomized each time)
   - Facilitate discussion among team members
   - Vote or decide on the best choice
   - Click the chosen option
   - Review the consequence and move to next stage

3. **Review Debrief**
   - After all 5 stages, view the final score
   - Discuss performance-based lessons learned
   - Review recommendations with your team
   - Document action items for your actual IR plan

### Tips for Facilitators

- **Time Management**: Allocate 5-10 minutes per stage for discussion
- **Encourage Participation**: Ask different team members to justify choices
- **Real-World Context**: Relate choices back to your actual environment
- **Document Insights**: Take notes during the debrief for follow-up actions
- **Iterate**: Run multiple scenarios to cover different incident types
- **Mix It Up**: Use "Random" for variety or select specific types for focused training

## Project Structure

```
incident-response-tabletop/
├── src/                          # TypeScript source files
│   ├── server.ts                # Express server & API routes
│   ├── procedural-generator.ts  # Procedural scenario generation
│   └── llm.ts                   # (Deprecated) Legacy LLM integration
├── public/                       # Static web assets
│   ├── index.html               # Main UI
│   ├── styles.css               # Styling
│   └── app.js                   # Client-side JavaScript
├── dist/                         # Compiled JavaScript (generated)
├── package.json                  # Node.js dependencies
├── tsconfig.json                 # TypeScript configuration
└── README.md                     # This file
```

## How It Works

The simulator uses **procedural generation** to create scenarios:

1. **Incident Templates**: 5 pre-built incident types (ransomware, phishing, data breach, insider threat, DDoS)
2. **Stage Templates**: 5 phase templates (detection, containment, eradication, recovery, post-incident)
3. **Choice Randomization**: Good/neutral/bad choices shuffled each time
4. **Scoring Algorithm**: +10 for good choices, 0 for neutral, -10 for bad
5. **Performance-Based Debrief**: Feedback adapts to final score percentage

Like No Man's Sky generates planets algorithmically, this generates incident scenarios with infinite variety from building blocks.

## Development

### Build & Run Commands

```bash
# Install dependencies
npm install

# Build TypeScript to JavaScript
npm run build

# Start the server (builds first)
npm start

# Development mode (rebuild + run)
npm run dev

# Watch mode (auto-recompile on changes)
npm run watch
```

### TypeScript Development

The project uses TypeScript with strict mode enabled. Source files in `src/` are compiled to `dist/`.

Key modules:
- **server.ts**: Express HTTP server, REST API endpoints, session management
- **procedural-generator.ts**: Algorithmic scenario generation with templates and randomization

## API Endpoints

### POST `/api/scenario/new`
Generate a new scenario

**Request:**
```json
{
  "sessionId": "session_12345",
  "scenarioType": "ransomware"
}
```

**Response:**
```json
{
  "success": true,
  "scenario": {
    "title": "Scenario title",
    "description": "Brief description",
    "totalStages": 5
  },
  "stage": {
    "stageNumber": 1,
    "title": "Initial Detection",
    "narrative": "...",
    "choices": [...]
  }
}
```

### POST `/api/scenario/choice`
Submit a choice for the current stage

**Request:**
```json
{
  "sessionId": "session_12345",
  "choiceIndex": 0
}
```

**Response:**
```json
{
  "success": true,
  "complete": false,
  "evaluation": {
    "scoreChange": 10,
    "feedback": "Good choice...",
    "consequence": "The situation improves..."
  },
  "nextStage": {...},
  "currentScore": 10
}
```

### GET `/api/scenario/status/:sessionId`
Get current session status

## Customization

### Adding New Incident Types

Edit `src/procedural-generator.ts` to add new incident templates:

```typescript
const INCIDENT_TYPES = {
  yourNewType: {
    title: "Your Incident Title",
    description: "Brief description",
    initialIndicators: ["indicator 1", "indicator 2", "..."],
    // ... more configuration
### Adjusting Scoring

Modify the scoring logic in `src/procedural-generator.ts`:

```typescript
const scoreMap = { good: 10, neutral: 0, bad: -10 };  // Adjust values
```

### Custom Stage Templates

Add new stage templates in `src/procedural-generator.ts` to vary the exercise flow:

```typescript
const STAGE_TEMPLATES = {
  // Add your custom stages here
};
```

## Troubleshooting

### "Failed to generate scenario"

- **Check Console**: Open browser DevTools (F12) and check for JavaScript errors
- **Server Running**: Ensure the server is running on http://localhost:3000
- **Network Issues**: Check browser Network tab for failed API calls

### Port Already in Use

Change the port in `src/server.ts`:
```typescript
const PORT = 3001;  // Change from 3000
```

Or kill existing Node processes:
```powershell
taskkill /F /IM node.exe
```

### TypeScript Compilation Errors

```bash
# Clean and rebuild
rm -rf dist/
npm run build
```

## Technical Details

### Procedural Generation Algorithm

The simulator uses a **template-based procedural generation** system:

1. **Incident Selection**: Randomly selects from 5 incident type templates
2. **Stage Construction**: Builds 5 stages using phase templates (detection → containment → eradication → recovery → post-incident)
3. **Choice Randomization**: Shuffles good/neutral/bad choices for each stage
4. **Consequence Mapping**: Maps choices to pre-written consequences
5. **Score Calculation**: Tracks cumulative score across all stages
6. **Debrief Generation**: Selects feedback based on final score percentage

This approach ensures:
- **Consistency**: Scenarios follow realistic IR workflows
- **Variety**: Randomization prevents repetitive exercises
- **Performance**: Instant generation with no API latency
- **Reliability**: No external dependencies or rate limits
- **Offline Capability**: Works without internet connection

## Security Notes

- **Local Only**: This app is designed for localhost use during exercises
- **No Persistence**: Sessions are in-memory only (restart clears data)
- **Authentication**: No auth by default - add if deploying remotely
- **No External Calls**: All data stays on your machine

## License

MIT License - Feel free to use and modify for your organization's training needs.

## Support

For issues or questions:
1. Check this README
2. Review error messages in the browser console (F12)
3. Check server logs in the terminal
4. Verify Node.js version is 20.x or higher

## Future Enhancements

Potential additions:
- [ ] **Add "Run" icon/favicon** - Add a proper icon for the browser tab and app branding
- [ ] Optional local LLM integration (Ollama + TinyLlama) for narrative variety
- [ ] Multiple facilitator support with separate sessions
- [ ] Export debrief as PDF
- [ ] Integration with Microsoft Teams or Slack
- [ ] Persistent storage (database)
- [ ] Multi-language support
- [ ] Custom scoring rubrics
- [ ] More incident type templates

---

**Happy Training! Stay prepared. 🛡️**
