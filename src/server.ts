import express, { Request, Response } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { generateScenario, evaluateChoice, generateDebrief } from './procedural-generator';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// In-memory session storage (for simplicity; use Redis or DB in production)
interface Session {
  scenario: any;
  currentStage: number;
  score: number;
  history: any[];
}

const sessions = new Map<string, Session>();

// Routes
app.get('/', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.post('/api/scenario/new', async (req: Request, res: Response) => {
  try {
    const { sessionId, prompt } = req.body;
    
    console.log('Received request:', { sessionId, promptLength: prompt?.length || 0 });
    
    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID required' });
    }

    // Validate and sanitize prompt
    let sanitizedPrompt = '';
    if (prompt && typeof prompt === 'string') {
      // Trim and limit length to prevent abuse
      sanitizedPrompt = prompt.trim().substring(0, 200);
      
      // Remove any potentially dangerous characters or HTML
      sanitizedPrompt = sanitizedPrompt.replace(/[<>{}[\]\\]/g, '');
      
      // If nothing useful remains after sanitization, clear it
      if (sanitizedPrompt.length < 3) {
        sanitizedPrompt = '';
      }
    }

    const scenario = await generateScenario(sanitizedPrompt || undefined);
    
    sessions.set(sessionId, {
      scenario,
      currentStage: 0,
      score: 0,
      history: []
    });

    res.json({
      success: true,
      scenario: {
        title: scenario.title,
        description: scenario.description,
        totalStages: scenario.stages.length
      },
      stage: scenario.stages[0]
    });
  } catch (error: any) {
    console.error('Error generating scenario:', error);
    res.status(500).json({ error: error.message || 'Failed to generate scenario' });
  }
});

app.post('/api/scenario/choice', async (req: Request, res: Response) => {
  try {
    const { sessionId, choiceIndex } = req.body;
    
    if (!sessionId || choiceIndex === undefined) {
      return res.status(400).json({ error: 'Session ID and choice index required' });
    }

    const session = sessions.get(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const currentStage = session.scenario.stages[session.currentStage];
    const choice = currentStage.choices[choiceIndex];

    // Evaluate the choice
    const evaluation = await evaluateChoice(
      session.scenario,
      session.currentStage,
      choice,
      session.history
    );

    // Update session
    session.score += evaluation.scoreChange;
    session.history.push({
      stage: session.currentStage,
      choice: choice,
      choiceText: choice.text,
      evaluation
    });
    session.currentStage++;

    // Check if scenario is complete
    if (session.currentStage >= session.scenario.stages.length) {
      const debrief = await generateDebrief(session.scenario, session.history, session.score);
      return res.json({
        success: true,
        complete: true,
        debrief
      });
    }

    // Return next stage
    const nextStage = session.scenario.stages[session.currentStage];
    res.json({
      success: true,
      complete: false,
      evaluation,
      nextStage,
      currentScore: session.score
    });
  } catch (error: any) {
    console.error('Error processing choice:', error);
    res.status(500).json({ error: error.message || 'Failed to process choice' });
  }
});

app.get('/api/scenario/status/:sessionId', (req: Request, res: Response) => {
  const session = sessions.get(req.params.sessionId);
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }

  res.json({
    currentStage: session.currentStage,
    totalStages: session.scenario.stages.length,
    score: session.score
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Incident Response Tabletop Simulator running on http://localhost:${PORT}`);
  console.log(`   Ready for tabletop exercises!`);
});
