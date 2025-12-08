# IRP Tabletop Simulator

Lightweight, LLM-powered incident response tabletop simulator for K-12 and similar environments.

## Overview

This Node.js + TypeScript web application generates realistic incident response scenarios on the fly using AI. It's designed for security teams, CTOs, and incident response facilitators to conduct training exercises with their teams.

### Key Features

- **LLM-Generated Scenarios**: Dynamic incident response scenarios tailored to your environment
- **Multi-Stage Exercises**: 4-5 escalating stages per scenario
- **Decision-Based Learning**: 3 choices per stage (good/neutral/bad)
- **Real-Time Scoring**: Tracks team performance throughout the exercise
- **Comprehensive Debrief**: AI-generated lessons learned and recommendations
- **Facilitator-Friendly**: Simple interface designed for casting to a TV/projector

## Quick Start

### Prerequisites

- **Node.js** (LTS version 20.x or higher) - [Download from nodejs.org](https://nodejs.org/)
- **Google Gemini API Key** - Free tier available at [aistudio.google.com](https://aistudio.google.com/app/apikey)
  - No credit card required!
  - Can be entered directly in the app UI

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

5. **Enter your API key in the UI**
   
   - Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
   - Sign in and create a free API key
   - Paste it into the "API Key" field in the app
   - Your key is stored securely in your browser's localStorage
   
   **Alternative:** You can also set it in a `.env` file (optional):
   ```bash
   cp .env.example .env
   # Edit .env and add: GEMINI_API_KEY=your_key_here
   ```

## How to Run a Tabletop Exercise

### Setup

1. Start the application (`npm start`)
2. Open http://localhost:3000 in your browser
3. Enter your Gemini API key (get one free at [Google AI Studio](https://aistudio.google.com/app/apikey))
4. Cast your browser window to a TV or projector
5. Gather your incident response team

### Running the Exercise

1. **Generate Scenario**
   - Enter a custom prompt (e.g., "Ransomware attack on school district") or leave blank for default
   - Click "Start Exercise"
   - Wait while the AI generates a 4-5 stage scenario

2. **Navigate Each Stage**
   - Read the narrative inject aloud to your team
   - Display the 3 response options
   - Facilitate discussion among team members
   - Vote or decide on the best choice
   - Click the chosen option
   - Review the consequence and move to next stage

3. **Review Debrief**
   - After all stages, view the final score
   - Discuss AI-generated lessons learned
   - Review recommendations with your team
   - Document action items for your actual IR plan

### Tips for Facilitators

- **Time Management**: Allocate 5-10 minutes per stage for discussion
- **Encourage Participation**: Ask different team members to justify choices
- **Real-World Context**: Relate choices back to your actual environment
- **Document Insights**: Take notes during the debrief for follow-up actions
- **Iterate**: Run multiple scenarios to cover different incident types

## Project Structure

```
incident-response-tabletop/
├── src/                    # TypeScript source files
│   ├── server.ts          # Express server & API routes
│   └── llm.ts             # OpenAI integration for scenario generation
├── public/                # Static web assets
│   ├── index.html         # Main UI
│   ├── styles.css         # Styling
│   └── app.js             # Client-side JavaScript
├── dist/                  # Compiled JavaScript (generated)
├── .env                   # Environment variables (create from .env.example)
├── .env.example           # Example environment configuration
├── package.json           # Node.js dependencies
├── tsconfig.json          # TypeScript configuration
└── README.md              # This file
```

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
- **llm.ts**: Google Gemini API integration for scenario generation, evaluation, and debrief

## API Endpoints

### POST `/api/scenario/new`
Generate a new scenario

**Request:**
```json
{
  "sessionId": "session_12345",
  "prompt": "Ransomware attack on K-12 district"
}
```

**Response:**
```json
{
  "success": true,
  "scenario": {
    "title": "Scenario title",
    "description": "Brief description",
    "totalStages": 4
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

### Changing LLM Models

Edit `src/llm.ts` to change the Gemini model:

```typescript
const model = genAI.getGenerativeModel({ 
  model: 'gemini-2.0-flash-exp'  // Current default (experimental, fast, free)
});
```

**Available models:**
- `gemini-2.0-flash-exp` - Latest experimental model (free tier, recommended)
- Other models may require different API access levels

### Adjusting Scoring

Modify the scoring logic in `src/llm.ts`:

```typescript
const scoreMap = { good: 10, neutral: 0, bad: -10 };  // Adjust values
```

### Custom Scenarios

You can hardcode scenarios by modifying the `generateScenario` function in `src/llm.ts` to return predefined JSON instead of calling the LLM.

## Troubleshooting

### "Failed to generate scenario"

- **Check API Key**: Ensure your `GEMINI_API_KEY` is correct in `.env`
- **Check Quota**: Verify you haven't exceeded free tier limits at [AI Studio](https://aistudio.google.com/)
- **Rate Limit (429 error)**: Wait 60 seconds - free tier has 15 requests/minute limit
- **Network Issues**: Ensure you can reach generativelanguage.googleapis.com
- **Model Access**: Make sure your API key has access to experimental models

### Port Already in Use

Change the port in `.env`:
```
PORT=3001
```

### TypeScript Compilation Errors

```bash
# Clean and rebuild
rm -rf dist/
npm run build
```

## Cost Estimates

Google Gemini API pricing (as of December 2024):

**Free Tier (No credit card required):**
- Up to 15 requests per minute
- Up to 1 million tokens per day
- Perfect for training exercises and tabletop simulations

**Paid Tier:**
- `gemini-1.5-pro`: ~$0.10 - $0.25 per complete exercise
- `gemini-1.5-flash`: ~$0.02 - $0.05 per complete exercise

Most organizations will stay well within the free tier for regular tabletop exercises.

## Security Notes

- **API Keys**: Keys entered in the UI are stored in browser localStorage only (never sent to any server except Google's API)
- **Local Only**: This app is designed for localhost use during exercises
- **No Persistence**: Sessions are in-memory only (restart clears data)
- **Authentication**: No auth by default - add if deploying remotely
- **Browser Storage**: Clear browser data to remove stored API key

## License

MIT License - Feel free to use and modify for your organization's training needs.

## Support

For issues or questions:
1. Check this README
2. Review error messages in the browser console
3. Check server logs in the terminal
4. Verify API key and credits

## Future Enhancements

Potential additions:
- [ ] **Add "Run" icon/favicon** - Add a proper icon for the browser tab and app branding
- [ ] Multiple facilitator support with separate sessions
- [ ] Scenario templates library
- [ ] Export debrief as PDF
- [ ] Integration with Microsoft Teams or Slack
- [ ] Persistent storage (database)
- [ ] Multi-language support
- [ ] Custom scoring rubrics

---

**Happy Training! Stay prepared. 🛡️**
