import { useEffect, useMemo, useState } from 'react'
import {
  Button,
  Col,
  DatePicker,
  Divider,
  Empty,
  Layout,
  Modal,
  Row,
  Select,
  Space,
  Spin,
  Table,
  Tag,
  Typography,
  message
} from 'antd'
import dayjs from 'dayjs'
import './App.css'

const { Header, Content, Footer } = Layout
const { Title, Paragraph, Text } = Typography

const COMPETITIONS = [
  { code: 'PL', name: 'Premier League' },
  { code: 'PD', name: 'Primera División' },
  { code: 'BL1', name: 'Bundesliga' },
  { code: 'FL1', name: 'Ligue 1' },
  { code: 'SA', name: 'Serie A' }
]

const STATUS_OPTIONS = [
  { value: 'ALL', label: 'All matches' },
  { value: 'SCHEDULED', label: 'Scheduled only' },
  { value: 'FINISHED', label: 'Completed only' }
]

const SCHEDULED_STATUSES = new Set(['SCHEDULED', 'TIMED'])
const FINISHED_STATUSES = new Set(['FINISHED', 'AWARDED'])

const footballToken = import.meta.env.VITE_FOOTBALL_DATA_TOKEN
const openAiToken = import.meta.env.VITE_OPENAI_API_KEY

function App() {
  const today = useMemo(() => dayjs(), [])
  const [dateFrom, setDateFrom] = useState(today.startOf('day'))
  const [dateTo, setDateTo] = useState(today.add(7, 'day').startOf('day'))
  const [selectedCompetitions, setSelectedCompetitions] = useState(
    COMPETITIONS.map((competition) => competition.code)
  )
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [matches, setMatches] = useState([])
  const [loadingMatches, setLoadingMatches] = useState(false)
  const [predictionModalOpen, setPredictionModalOpen] = useState(false)
  const [predictionLoading, setPredictionLoading] = useState(false)
  const [predictionResult, setPredictionResult] = useState('')
  const [selectedMatch, setSelectedMatch] = useState(null)

  useEffect(() => {
    async function fetchMatches() {
      if (!footballToken) {
        message.error('Missing football-data.org API token. Please configure VITE_FOOTBALL_DATA_TOKEN.')
        return
      }

      if (!dateFrom || !dateTo || dateFrom.isAfter(dateTo)) {
        message.warning('Please select a valid date range.')
        return
      }

      setLoadingMatches(true)
      setMatches([])

      try {
        const params = new URLSearchParams({
          dateFrom: dateFrom.format('YYYY-MM-DD'),
          dateTo: dateTo.format('YYYY-MM-DD')
        })

        const responses = await Promise.all(
          selectedCompetitions.map(async (competitionCode) => {
            const response = await fetch(
              `https://api.football-data.org/v4/competitions/${competitionCode}/matches?${params.toString()}`,
              {
                headers: {
                  'X-Auth-Token': footballToken
                }
              }
            )

            if (!response.ok) {
              const errorBody = await response.json().catch(() => undefined)
              const messageText = errorBody?.message || response.statusText
              throw new Error(`Unable to load ${competitionCode} matches: ${messageText}`)
            }

            const data = await response.json()
            return data.matches || []
          })
        )

        const merged = responses.flat()

        const filtered = merged.filter((match) => {
          if (statusFilter === 'ALL') return true
          if (statusFilter === 'SCHEDULED') {
            return SCHEDULED_STATUSES.has(match.status)
          }
          if (statusFilter === 'FINISHED') {
            return FINISHED_STATUSES.has(match.status)
          }
          return true
        })

        const sorted = filtered.sort((a, b) => dayjs(a.utcDate).diff(dayjs(b.utcDate)))

        setMatches(sorted)
      } catch (error) {
        console.error(error)
        message.error(error.message)
      } finally {
        setLoadingMatches(false)
      }
    }

    if (selectedCompetitions.length > 0) {
      fetchMatches()
    } else {
      setMatches([])
    }
  }, [dateFrom, dateTo, selectedCompetitions, statusFilter])

  const columns = [
    {
      title: 'Kick-off',
      dataIndex: 'utcDate',
      key: 'utcDate',
      render: (value) => dayjs(value).format('DD MMM YYYY HH:mm')
    },
    {
      title: 'Competition',
      dataIndex: ['competition', 'name'],
      key: 'competition'
    },
    {
      title: 'Match',
      key: 'match',
      render: (_, record) => (
        <Space direction='vertical' size={0}>
          <Text strong>
            {record.homeTeam.name} vs {record.awayTeam.name}
          </Text>
          <Text type='secondary'>{record.venue || 'Venue TBC'}</Text>
        </Space>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        if (FINISHED_STATUSES.has(status)) {
          return <Tag color='green'>Finished</Tag>
        }
        if (SCHEDULED_STATUSES.has(status)) {
          return <Tag color='blue'>Scheduled</Tag>
        }
        return <Tag color='default'>{status}</Tag>
      }
    },
    {
      title: 'Score',
      key: 'score',
      render: (_, record) => {
        if (FINISHED_STATUSES.has(record.status)) {
          const home = record.score.fullTime.home ?? 0
          const away = record.score.fullTime.away ?? 0
          return (
            <Text>
              {home} - {away}
            </Text>
          )
        }
        return <Text type='secondary'>TBD</Text>
      }
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Button type='link' onClick={() => handlePredict(record)}>
          Predict standout player
        </Button>
      )
    }
  ]

  const handlePredict = async (match) => {
    setSelectedMatch(match)
    setPredictionResult('')
    setPredictionModalOpen(true)

    if (!openAiToken) {
      setPredictionResult('Set the VITE_OPENAI_API_KEY environment variable to enable predictions.')
      return
    }

    setPredictionLoading(true)
    try {
      const prompt = `You are a football data analyst. Based on the upcoming or completed match below, predict which single player is most likely to be the standout performer. Provide a short justification referencing relevant statistics, form or historical performance.\n\nMatch details:\nCompetition: ${match.competition?.name}\nMatchday: ${match.matchday}\nVenue: ${match.venue || 'Unknown'}\nDate (UTC): ${dayjs(match.utcDate).format('YYYY-MM-DD HH:mm')}\nHome team: ${match.homeTeam?.name}\nAway team: ${match.awayTeam?.name}\nCurrent status: ${match.status}\nScore (if available): ${match.score?.fullTime?.home ?? 'N/A'} - ${match.score?.fullTime?.away ?? 'N/A'}\n\nRespond with the player name and reasoning in a concise paragraph.`

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${openAiToken}`
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
      const content = data.choices?.[0]?.message?.content?.trim()
      setPredictionResult(content || 'No prediction available.')
    } catch (error) {
      console.error(error)
      setPredictionResult(`Unable to fetch prediction: ${error.message}`)
    } finally {
      setPredictionLoading(false)
    }
  }

  const handleModalClose = () => {
    setPredictionModalOpen(false)
    setSelectedMatch(null)
    setPredictionResult('')
  }

  return (
    <Layout className='app-layout'>
      <Header className='app-header'>
        <Title level={2} style={{ color: 'white', margin: 0 }}>
          Football Schedule Dashboard
        </Title>
        <Paragraph style={{ color: 'rgba(255,255,255,0.75)', margin: 0 }}>
          Track fixtures and get quick AI-powered player predictions.
        </Paragraph>
      </Header>
      <Content className='app-content'>
        <div className='filter-panel'>
          <Title level={4}>Filters</Title>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12} lg={8}>
              <Space direction='vertical' className='filter-control'>
                <Text strong>Date from</Text>
                <DatePicker value={dateFrom} onChange={(value) => setDateFrom(value)} allowClear={false} />
              </Space>
            </Col>
            <Col xs={24} md={12} lg={8}>
              <Space direction='vertical' className='filter-control'>
                <Text strong>Date to</Text>
                <DatePicker value={dateTo} onChange={(value) => setDateTo(value)} allowClear={false} />
              </Space>
            </Col>
            <Col xs={24} md={24} lg={8}>
              <Space direction='vertical' className='filter-control'>
                <Text strong>Competitions</Text>
                <Select
                  mode='multiple'
                  value={selectedCompetitions}
                  onChange={setSelectedCompetitions}
                  options={COMPETITIONS.map((competition) => ({
                    label: competition.name,
                    value: competition.code
                  }))}
                  placeholder='Select competitions'
                />
              </Space>
            </Col>
          </Row>
          <Divider style={{ margin: '16px 0' }} />
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Space direction='vertical' className='filter-control'>
                <Text strong>Match status</Text>
                <Select value={statusFilter} onChange={setStatusFilter} options={STATUS_OPTIONS} />
              </Space>
            </Col>
          </Row>
        </div>

        <div className='table-wrapper'>
          <Title level={4}>Matches</Title>
          {loadingMatches ? (
            <div className='loading-wrapper'>
              <Spin tip='Loading matches...' size='large' />
            </div>
          ) : matches.length === 0 ? (
            <Empty description='No matches to display' />
          ) : (
            <Table
              columns={columns}
              dataSource={matches.map((match) => ({
                ...match,
                key: `${match.id}`
              }))}
              pagination={{ pageSize: 10 }}
              scroll={{ x: true }}
            />
          )}
        </div>
      </Content>
      <Footer style={{ textAlign: 'center' }}>
        Data from football-data.org. Predictions powered by OpenAI.
      </Footer>

      <Modal
        title='AI Player Prediction'
        open={predictionModalOpen}
        onCancel={handleModalClose}
        footer={null}
        destroyOnClose
      >
        {selectedMatch && (
          <Space direction='vertical' size='middle' style={{ width: '100%' }}>
            <div>
              <Text strong>
                {selectedMatch.homeTeam?.name} vs {selectedMatch.awayTeam?.name}
              </Text>
              <br />
              <Text type='secondary'>
                {dayjs(selectedMatch.utcDate).format('DD MMM YYYY HH:mm')} · {selectedMatch.competition?.name}
              </Text>
            </div>
            <Divider style={{ margin: '8px 0' }} />
            {predictionLoading ? <Spin tip='Generating prediction...' /> : <Paragraph>{predictionResult}</Paragraph>}
          </Space>
        )}
      </Modal>
    </Layout>
  )
}

export default App
