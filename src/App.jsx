import { useMemo, useState } from 'react'
import { Layout, Typography, message } from 'antd'
import dayjs from 'dayjs'
import './App.css'
import { COMPETITIONS, STATUS_OPTIONS } from './constants'
import { FilterPanel } from './components/FilterPanel'
import { MatchesSection } from './components/MatchesSection'
import { PredictionModal } from './components/PredictionModal'
import { useMatches } from './hooks/useMatches'
import { predictStandoutPlayer } from './services/predictStandoutPlayer'

const { Header, Content, Footer } = Layout
const { Title, Paragraph } = Typography

const footballToken = import.meta.env.VITE_FOOTBALL_DATA_TOKEN
const openAiToken = import.meta.env.VITE_OPENAI_API_KEY

function App() {
  const today = useMemo(() => dayjs(), [])
  const [dateFrom, setDateFrom] = useState(today.startOf('day'))
  const [dateTo, setDateTo] = useState(today.add(6, 'day').endOf('day'))
  const [selectedCompetitions, setSelectedCompetitions] = useState(COMPETITIONS[0].code)
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [predictionModalOpen, setPredictionModalOpen] = useState(false)
  const [predictionLoading, setPredictionLoading] = useState(false)
  const [predictionResult, setPredictionResult] = useState('')
  const [selectedMatch, setSelectedMatch] = useState(null)

  const { matches, loading } = useMatches({
    dateFrom,
    dateTo,
    competition: selectedCompetitions,
    statusFilter,
    token: footballToken,
  })

  const handlePredict = async match => {
    setSelectedMatch(match)
    setPredictionResult('')
    setPredictionModalOpen(true)

    try {
      setPredictionLoading(true)
      const result = await predictStandoutPlayer(match, openAiToken)
      setPredictionResult(result)
    } catch (error) {
      console.error(error)
      message.error(error.message)
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
        <FilterPanel
          dateFrom={dateFrom}
          dateTo={dateTo}
          competitions={COMPETITIONS}
          selectedCompetitions={selectedCompetitions}
          statusOptions={STATUS_OPTIONS}
          statusFilter={statusFilter}
          onDateFromChange={setDateFrom}
          onDateToChange={setDateTo}
          onCompetitionsChange={setSelectedCompetitions}
          onStatusChange={setStatusFilter}
        />

        <MatchesSection matches={matches} loading={loading} onPredict={handlePredict} />
      </Content>
      <Footer style={{ textAlign: 'center' }}>
        Data from football-data.org.
      </Footer>

      <PredictionModal
        open={predictionModalOpen}
        loading={predictionLoading}
        match={selectedMatch}
        result={predictionResult}
        onClose={handleModalClose}
      />
    </Layout>
  )
}

export default App
