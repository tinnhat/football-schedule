import {
  CalendarOutlined,
  EnvironmentOutlined,
  PlayCircleOutlined,
  TrophyOutlined,
} from '@ant-design/icons'
import { Button, Card, Divider, Space, Tag, Tooltip, Typography } from 'antd'
import dayjs from 'dayjs'
import { FINISHED_STATUSES, SCHEDULED_STATUSES } from '../constants'

const { Text } = Typography

function TeamRow({ team, score, highlight }) {
  console.log(team)

  return (
    <div className={`match-card__team-row ${highlight ? 'match-card__team-row--highlight' : ''}`}>
      <img
        src={team?.crest ? team.crest : 'https://via.placeholder.com/40?text=TBC'}
        alt={team?.name || 'TBC'}
        className='match-card__team-crest'
      />
      <div className='match-card__team-name'>{team?.name || 'TBC'}</div>
      <div className='match-card__score'>{score}</div>
    </div>
  )
}

function getStatusTag(status) {
  if (FINISHED_STATUSES.has(status)) {
    return (
      <Tag icon={<TrophyOutlined />} color='success'>
        Finished
      </Tag>
    )
  }
  if (SCHEDULED_STATUSES.has(status)) {
    return (
      <Tag icon={<PlayCircleOutlined />} color='processing'>
        Scheduled
      </Tag>
    )
  }
  return <Tag color='default'>{status}</Tag>
}

export function MatchCard({ match, onPredict }) {
  const kickoff = dayjs(match.utcDate)
  const isFinished = FINISHED_STATUSES.has(match.status)
  const fullTimeScore = match.score?.fullTime ?? {}
  const homeScore = isFinished ? fullTimeScore.home ?? 0 : '–'
  const awayScore = isFinished ? fullTimeScore.away ?? 0 : '–'

  return (
    <Card className='match-card' bordered={false} bodyStyle={{ padding: 20 }}>
      <Space direction='vertical' size='middle' style={{ width: '100%' }}>
        <div className='match-card__heading'>
          <Space align='center' size='small'>
            <Tag className='match-card__competition-tag' color='volcano'>
              {match.competition?.name || 'Competition'}
            </Tag>
            {getStatusTag(match.status)}
          </Space>
        </div>

        <div className='match-card__teams'>
          <TeamRow team={match.homeTeam} score={homeScore} highlight={homeScore > awayScore} />
          <Divider plain className='match-card__divider'>
            vs
          </Divider>
          <TeamRow team={match.awayTeam} score={awayScore} highlight={awayScore > homeScore} />
        </div>

        <div className='match-card__meta'>
          <Space direction='vertical' size='small' style={{ width: '100%' }}>
            <Space size='middle' style={{ width: '100%', justifyContent: 'space-between' }}>
              <Space size='small'>
                <CalendarOutlined />
                <Text strong style={{ color: '#1890ff', fontSize: '12px' }}>
                  UTC:
                </Text>
                <Text style={{ fontFamily: 'monospace' }}>
                  {kickoff.format('DD/MM/YYYY HH:mm')}
                </Text>
              </Space>
              <Space size='small'>
                <Text strong style={{ color: '#52c41a', fontSize: '12px' }}>
                  VN:
                </Text>
                <Text style={{ fontFamily: 'monospace' }}>
                  {kickoff.add(7, 'hour').format('DD/MM/YYYY HH:mm')}
                </Text>
              </Space>
            </Space>
            {match.venue && (
              <Space size='small'>
                <EnvironmentOutlined />
                <Text>{match.venue}</Text>
              </Space>
            )}
          </Space>
        </div>

        {/* pending feature */}
        {/* <Tooltip title='Ask the AI assistant for a likely standout player based on form and context.'>
          <Button type='primary' block onClick={() => onPredict(match)}>
            Predict standout player
          </Button>
        </Tooltip> */}
      </Space>
    </Card>
  )
}
