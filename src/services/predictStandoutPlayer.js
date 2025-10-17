import dayjs from 'dayjs'

export async function predictStandoutPlayer(match, token) {
  if (!token) {
    return 'Set the VITE_OPENAI_API_KEY environment variable to enable predictions.'
  }

  const prompt = `You are a football data analyst. Based on the upcoming or completed match below, predict which single player is most likely to be the standout performer. Provide a short justification referencing relevant statistics, form or historical performance.\n\nMatch details:\nCompetition: ${match.competition?.name}\nMatchday: ${match.matchday}\nVenue: ${match.venue || 'Unknown'}\nDate (UTC): ${dayjs(match.utcDate).format('YYYY-MM-DD HH:mm')}\nHome team: ${match.homeTeam?.name}\nAway team: ${match.awayTeam?.name}\nCurrent status: ${match.status}\nScore (if available): ${match.score?.fullTime?.home ?? 'N/A'} - ${match.score?.fullTime?.away ?? 'N/A'}\n\nRespond with the player name and reasoning in a concise paragraph.`

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful football analytics assistant.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 250
    })
  })

  if (!response.ok) {
    const errorBody = await response.json().catch(() => undefined)
    const messageText = errorBody?.error?.message || response.statusText
    throw new Error(messageText)
  }

  const data = await response.json()
  return data.choices?.[0]?.message?.content?.trim() || 'No prediction available.'
}
