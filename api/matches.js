export default async function handler(req, res) {
  const { competition, dateFrom, dateTo } = req.query;
  const token = import.meta.env.VITE_FOOTBALL_DATA_TOKEN; // 👉 Lưu key trong Vercel env

  if (!competition || !dateFrom || !dateTo) {
    return res.status(400).json({ message: 'Missing query parameters' });
  }

  const url = `https://api.football-data.org/v4/competitions/${competition}/matches?dateFrom=${dateFrom}&dateTo=${dateTo}`;

  try {
    const response = await fetch(url, {
      headers: { 'X-Auth-Token': token }
    });

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}
