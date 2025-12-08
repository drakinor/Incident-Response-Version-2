import { GoogleGenerativeAI } from '@google/generative-ai';

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

/**
 * Generate a new incident response scenario with 4-5 stages
 */
export async function generateScenario(userPrompt?: string, apiKey?: string): Promise<Scenario> {
  if (!apiKey && !process.env.GEMINI_API_KEY) {
    throw new Error('API key is required. Please provide a Gemini API key.');
  }
  
  const genAI = new GoogleGenerativeAI(apiKey || process.env.GEMINI_API_KEY || '');
  // Try the base gemini-pro model which should always be available
  const model = genAI.getGenerativeModel({ 
    model: 'gemini-2.0-flash-exp'
  });
  
  const prompt = userPrompt || 'A ransomware attack on a K-12 school district';

  const systemPrompt = `You are an expert in incident response and cybersecurity training. Generate a realistic incident response tabletop scenario for training purposes.

The scenario should have:
- A clear title and description
- Context about the organization (K-12, healthcare, etc.)
- Exactly 4-5 stages that escalate in complexity
- Each stage has a narrative inject (what's happening) and exactly 3 choices
- Each choice should be labeled as "good", "neutral", or "bad" based on IR best practices

Return ONLY valid JSON with this structure:
{
  "title": "Scenario title",
  "description": "Brief overview",
  "context": "Organization context",
  "stages": [
    {
      "stageNumber": 1,
      "title": "Stage title",
      "narrative": "What is happening at this stage",
      "choices": [
        {"text": "Choice description", "quality": "good"},
        {"text": "Choice description", "quality": "neutral"},
        {"text": "Choice description", "quality": "bad"}
      ]
    }
  ]
}`;

  try {
    const fullPrompt = `${systemPrompt}

User request: Generate a tabletop scenario: ${prompt}`;

    const result = await model.generateContent(fullPrompt);

    const response = result.response;
    const content = response.text();
    
    if (!content) {
      throw new Error('No response from LLM');
    }

    return JSON.parse(content) as Scenario;
  } catch (error: any) {
    console.error('LLM Error:', error);
    throw new Error(`Failed to generate scenario: ${error.message}`);
  }
}

/**
 * Evaluate a player's choice and provide feedback
 */
export async function evaluateChoice(
  scenario: Scenario,
  stageIndex: number,
  choice: Choice,
  history: any[],
  apiKey?: string
): Promise<Evaluation> {
  const genAI = new GoogleGenerativeAI(apiKey || process.env.GEMINI_API_KEY || '');
  const model = genAI.getGenerativeModel({ 
    model: 'gemini-2.0-flash-exp'
  });
  
  const stage = scenario.stages[stageIndex];
  
  const systemPrompt = `You are evaluating an incident response decision. Provide:
1. Score change (-10 to +10 based on quality: good=+10, neutral=0, bad=-10)
2. Brief feedback explaining why this choice is good/neutral/bad
3. A realistic consequence that will affect the next stage

Return ONLY valid JSON:
{
  "scoreChange": <number>,
  "feedback": "<explanation>",
  "consequence": "<what happens next>"
}`;

  const userPrompt = `Scenario: ${scenario.title}
Stage ${stageIndex + 1}: ${stage.title}
Narrative: ${stage.narrative}
Player chose: "${choice.text}"
Choice quality: ${choice.quality}

Previous decisions: ${history.length > 0 ? JSON.stringify(history.map(h => h.choiceText)) : 'None'}

Evaluate this choice.`;

  try {
    const fullPrompt = `${systemPrompt}

${userPrompt}`;

    const result = await model.generateContent(fullPrompt);

    const response = result.response;
    const content = response.text();
    
    if (!content) {
      throw new Error('No response from LLM');
    }

    return JSON.parse(content) as Evaluation;
  } catch (error: any) {
    console.error('LLM Error:', error);
    // Fallback evaluation
    const scoreMap = { good: 10, neutral: 0, bad: -10 };
    return {
      scoreChange: scoreMap[choice.quality],
      feedback: `This was a ${choice.quality} choice for incident response.`,
      consequence: 'The situation continues to evolve.'
    };
  }
}

/**
 * Generate final debrief with lessons learned
 */
export async function generateDebrief(
  scenario: Scenario,
  history: any[],
  finalScore: number,
  apiKey?: string
): Promise<Debrief> {
  const genAI = new GoogleGenerativeAI(apiKey || process.env.GEMINI_API_KEY || '');
  const model = genAI.getGenerativeModel({ 
    model: 'gemini-2.0-flash-exp'
  });
  
  const systemPrompt = `You are conducting a debrief after an incident response tabletop exercise. Provide:
1. A summary of performance
2. 3-5 key lessons learned
3. 3-5 actionable recommendations

Return ONLY valid JSON:
{
  "finalScore": <number>,
  "summary": "<overall performance summary>",
  "keyLessons": ["<lesson 1>", "<lesson 2>", ...],
  "recommendations": ["<recommendation 1>", "<recommendation 2>", ...]
}`;

  const userPrompt = `Scenario: ${scenario.title}
Final Score: ${finalScore}

Decisions made:
${history.map((h, i) => `Stage ${i + 1}: ${h.choiceText} (${h.evaluation.feedback})`).join('\n')}

Generate a comprehensive debrief.`;

  try {
    const fullPrompt = `${systemPrompt}

${userPrompt}`;

    const result = await model.generateContent(fullPrompt);

    const response = result.response;
    const content = response.text();
    
    if (!content) {
      throw new Error('No response from LLM');
    }

    const result2 = JSON.parse(content) as Debrief;
    result2.finalScore = finalScore; // Ensure we use the actual score
    return result2;
  } catch (error: any) {
    console.error('LLM Error:', error);
    // Fallback debrief
    return {
      finalScore,
      summary: 'Exercise completed. Review your decisions and consider how they align with incident response best practices.',
      keyLessons: [
        'Communication is critical during incidents',
        'Documentation helps with post-incident analysis',
        'Balance speed with thorough investigation'
      ],
      recommendations: [
        'Review your incident response plan',
        'Conduct regular tabletop exercises',
        'Ensure team roles are clearly defined'
      ]
    };
  }
}
