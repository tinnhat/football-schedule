import dayjs from 'dayjs'

export async function predictStandoutPlayer(match, token) {
  if (!token) {
    return 'Set the HUGGINGFACE_API_KEY environment variable to enable predictions.'
  }

  const prompt = `
You are a football data analyst. Based on the upcoming or completed match below, predict which single player is most likely to be the standout performer. Provide a short justification referencing relevant statistics, form, or historical performance.

Match details:
Competition: ${match.competition?.name}
Matchday: ${match.matchday}
Venue: ${match.venue || 'Unknown'}
Date (UTC): ${dayjs(match.utcDate).format('YYYY-MM-DD HH:mm')}
Home team: ${match.homeTeam?.name}
Away team: ${match.awayTeam?.name}
Current status: ${match.status}
Score (if available): ${match.score?.fullTime?.home ?? 'N/A'} - ${
    match.score?.fullTime?.away ?? 'N/A'
  }

Respond with the player name and reasoning in a concise paragraph.
`

  const response = await fetch(
    'https://api-inference.huggingface.co/models/meta-llama/Meta-Llama-3-8B-Instruct',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: 200,
          temperature: 0.7,
        },
      }),
    }
  )

  if (!response.ok) {
    const errorBody = await response.json().catch(() => undefined)
    const messageText = errorBody?.error || response.statusText
    throw new Error(messageText)
  }

  const data = await response.json()

  return data?.[0]?.generated_text?.trim() || 'No prediction available.'
}
