# Incident Response Tabletop Simulator - Copilot Instructions

## Project Overview
This is a Node.js + TypeScript web application that runs incident response tabletop exercises using LLM-generated scenarios.

## Tech Stack
- Node.js (LTS 20.x+)
- TypeScript
- Express for HTTP server
- Static HTML + Bootstrap CSS
- Google Gemini API for LLM calls

## Project Structure
- `/src` - TypeScript source files
- `/public` - Static assets (HTML, CSS, client-side JS)
- `/dist` - Compiled JavaScript output

## Development Guidelines
- Use TypeScript strict mode
- Follow REST API conventions for endpoints
- Keep HTML simple and accessible
- Use Bootstrap 5 for styling
- Handle LLM API errors gracefully
- Validate user input on both client and server

## Key Features
- Scenario generation with 4-5 stages
- 3 choices per stage (good/neutral/bad)
- Scoring system
- Final debrief with lessons learned
- Designed for facilitator-led sessions

## Running the Project
```bash
npm install
npm start
```
Server runs on http://localhost:3000
