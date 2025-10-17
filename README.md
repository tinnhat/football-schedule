# Football Schedule Dashboard

A React + Vite single page application that surfaces fixtures from [football-data.org](https://www.football-data.org/) for the top European leagues and adds an AI powered prediction helper using the OpenAI API.

## Features

- 📅 **Flexible scheduling filters** – choose any date range and show only the leagues you care about: Premier League (PL), Primera División (PD), Bundesliga (BL1), Ligue 1 (FL1) and Serie A (SA).
- 🔄 **Status filtering** – quickly toggle between scheduled, completed or all fixtures.
- 📊 **Rich match table** – consolidated view of kick-off time, competition, venue, score and quick actions.
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
```

> ⚠️ Both tokens are read at build time by Vite. Restart the dev server after updating the `.env` file.

### Running the app

```bash
npm run dev
```

Open your browser to the URL printed in the terminal (typically [http://localhost:5173](http://localhost:5173)).

### Building for production

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

## Implementation notes

- **UI framework** – built with React 19 and [Ant Design 5](https://ant.design/components/overview/).
- **Data fetching** – each selected competition calls `https://api.football-data.org/v4/competitions/{code}/matches` scoped by the chosen date range. Results are merged, sorted chronologically and filtered client-side by match status.
- **Date handling** – Ant Design’s `DatePicker` (powered by Day.js) drives the `dateFrom`/`dateTo` state; validation prevents invalid ranges.
- **Prediction workflow** – clicking “Predict standout player” opens a modal and, if an OpenAI key is configured, calls the `/v1/chat/completions` endpoint with the `gpt-4o-mini` model to generate a concise summary. Errors are displayed inline.
- **Resilience** – the app surfaces helpful toasts when tokens are missing, when the API rejects a request, or when a prediction cannot be generated.

## Project structure

```
src/
├── App.jsx        # Main dashboard and UI logic
├── App.css        # Styling for layout panels and table wrappers
└── main.jsx       # Vite entry point with Ant Design reset styles
```

## Testing the APIs

The project does not include automated tests. To verify your tokens manually:

1. Confirm the football-data token works by running the app and selecting a short date range (e.g. today to +7 days).
2. Confirm the OpenAI key by opening any match and checking that a prediction loads in the modal.

## License

This project is provided as-is for demonstration purposes.
