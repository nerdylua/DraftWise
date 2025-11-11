# DraftWise
## An AI-powered PRD Improver
DraftWise transforms a raw draft PRD into a well-structured, comprehensive final document by simulating professional team debates among domain-specific AI agents.

![Flow Diagram](https://github.com/user-attachments/assets/6f6bb9f0-9310-46ed-8ee6-d2effbdb939c)

## What is DraftWise?

DraftWise is an AI-driven tool designed to enhance Product Requirement Documents (PRDs). It takes in a basic draft PRD as input, simulates a debate among multiple role-specific sub-agents (like UX leads, finance managers, DevOps engineers, and more), and outputs a polished, complete PRD.

These sub-agents are selected based on the content of the draft PRD and work collaboratively (and sometimes competitively!) to ensure all important aspects of product development are covered — from UX to deployment, from costs to compliance.

---

## How it Works

1. **Input Draft**: Users provide a raw PRD draft as input.
2. **Agent Debate**: Domain-specific AI agents are dynamically selected to critique and suggest improvements through a structured debate.
3. **Final Synthesis**: DraftWise synthesizes all feedback into a coherent, improved PRD.

---

## Project Structure

```bash
DraftWise
├── pages/api/
│   ├── debate.ts                  # Streams agent responses (debate flow)
│   ├── download-pdf.ts            # Generate downloadable PRD PDF
│   ├── save-prd.ts                # Saves PRD
│   ├── select-agents.ts           # Auto-selects agents based on PRD content
│   └── synthesize-prd.ts          # Final synthesis of agent inputs
├── public/avatars/                # Agent profile images
├── src/
│   ├── app/                       # Global app layout, styles
│   ├── components/                # UI + functional components
│   │   ├── prd-input.tsx          # PRD input box
│   │   ├── debate-panel.tsx       # Live agent debate UI
│   │   ├── agent-list.tsx         # Displays selected agents
│   │   └── PRDDisplay.tsx         # Final PRD output viewer
│   └── lib/                       # Core logic and helpers
│       ├── agents.ts              # Agent metadata and behavior logic
│       ├── api.ts                 # API functions
│       ├── gates.ts               # Concurrency + timeout guards
│       ├── security.ts            # In-memory rate limiter
│       └── utils.ts               # Utility functions
```
## Powered By

- React + Next.js – Fast, modern web framework.
- shadcn/ui – Beautiful UI components using Radix and Tailwind.
- Tailwind CSS – Utility-first styling.
- TypeScript – Strong typing for safer code.
- Server-Sent Events (SSE) – Real-time streaming of agent debates.
- Gemini (via Vercel AI SDK + Google provider) – Role-based agent responses and synthesis logic.

## Setup Instructions

### 1. Clone the Repository

```powershell
git clone https://github.com/nerdylua/DraftWise.git
cd DraftWise
```

### 2. Install Dependencies

```powershell
npm install
```

### 3. Environment Variable

Create `.env.local` and add:

```env
GOOGLE_GENERATIVE_AI_API_KEY=your_api_key_here
```

Replace `your_api_key_here` with your actual Gemini API key.

### 4. Run the Development Server

```powershell
npm run dev
```

Then open your browser and visit http://localhost:3000

### 5. Build and start (production)

```powershell
npm run build
npm start
```

By default the server runs on http://localhost:3000

## Features
1. Draft PRD parsing and context extraction
1. Dynamic agent selection based on content
1. Simulated live debate with streaming responses
1. Auto-synthesis of agent recommendations
1. PDF export of final PRD
1. Beautiful, developer-friendly UI

## License
This project is licensed under the terms of the MIT License.

## Contributing
Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

