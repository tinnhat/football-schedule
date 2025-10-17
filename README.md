# Football Schedule Dashboard

A React + Vite single page application that surfaces fixtures from [football-data.org](https://www.football-data.org/) for the top European leagues and adds an AI powered prediction helper using the OpenAI API.

## Features

- 📅 **Flexible scheduling filters** – quick presets for today, the next 7 days or 30 days alongside manual pickers for full control across Premier League (PL), Primera División (PD), Bundesliga (BL1), Ligue 1 (FL1) and Serie A (SA).
- 🔄 **Status filtering** – Segmented control to instantly switch between scheduled, completed or all fixtures.
- 🪄 **Polished match gallery** – responsive cards summarise competition, kick-off window, venue and live score with elegant highlights for the leading team.
- 🤖 **AI standout player predictions** – pick a match and let OpenAI suggest who might be the key performer, with concise reasoning.

## Getting started

### Prerequisites

- Node.js 18+
- API tokens
  - [football-data.org token](https://www.football-data.org/client/register) (free tier works for the listed competitions).
  - [OpenAI API key](https://platform.openai.com/account/api-keys) for the prediction helper (optional – the UI handles the absence of a key and disables predictions).

### Installation

```bash
npm install
```

### Environment variables

Create a `.env` file in the project root (same level as `package.json`) with the following values:

```bash
VITE_FOOTBALL_DATA_TOKEN=your_football_data_token
VITE_OPENAI_API_KEY=your_openai_api_key # optional, only needed for predictions
VITE_FOOTBALL_API_BASE_URL=/football-data # optional override, defaults to proxy when omitted
```

> ⚠️ Both tokens are read at build time by Vite. Restart the dev server after updating the `.env` file.

The `VITE_FOOTBALL_API_BASE_URL` variable lets you point the frontend at a custom proxy if you deploy behind your own backend. When left undefined the app automatically targets the built-in Vite proxy (`/football-data`) during development and the public API URL in production builds.

### Running the app

```bash
npm run dev
```

Open your browser to the URL printed in the terminal (typically [http://localhost:5173](http://localhost:5173)).

> 💡 **CORS fix:** the Vite dev and preview servers proxy any request that starts with `/football-data` to `https://api.football-data.org`. This bypasses the restrictive `Access-Control-Allow-Origin: http://localhost` header returned by the upstream API and keeps development friction-free. No additional setup is required beyond providing your API token.

### Building for production

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

## Implementation notes

- **UI framework** – built with React 19 and [Ant Design 5](https://ant.design/components/overview/) plus custom gradients for the hero header, filters and match cards.
- **Data fetching** – the `useMatches` hook orchestrates batched calls to `/v4/competitions/{code}/matches`, merges and sorts results, and exposes loading state. Requests flow through the Vite proxy in local development to avoid CORS issues.
- **Date handling** – Ant Design’s `DatePicker` (powered by Day.js) drives the `dateFrom`/`dateTo` state; validation prevents invalid ranges and presets keep the common windows one click away.
- **Prediction workflow** – clicking “Predict standout player” opens a modal and, if an OpenAI key is configured, calls the `/v1/chat/completions` endpoint with the `gpt-4o-mini` model to generate a concise summary. Errors are displayed inline.
- **Resilience** – the app surfaces helpful toasts when tokens are missing, when the API rejects a request, or when a prediction cannot be generated. Fetches are aborted when filters change to avoid race conditions.

## Project structure

```
src/
├── App.jsx                 # Main dashboard and layout orchestration
├── App.css                 # Global styling, gradients and card presentation
├── components/
│   ├── FilterPanel.jsx     # Filter presets, segmented status control and selectors
│   ├── MatchCard.jsx       # Presentational card for a single match
│   ├── MatchesSection.jsx  # Summary metrics and responsive card grid
│   └── PredictionModal.jsx # AI prediction modal
├── hooks/
│   └── useMatches.js       # Data fetching, merging and status filtering
├── services/
│   └── predictStandoutPlayer.js # OpenAI integration
└── main.jsx                # Vite entry point with Ant Design reset styles
```

## Testing the APIs

The project does not include automated tests. To verify your tokens manually:

1. Confirm the football-data token works by running the app and selecting a short date range (e.g. today to +7 days).
2. Confirm the OpenAI key by opening any match and checking that a prediction loads in the modal.

## License

This project is provided as-is for demonstration purposes.
