import { Empty, Space, Spin, Table, Tag, Typography } from 'antd'
import dayjs from 'dayjs'
import { FINISHED_STATUSES, SCHEDULED_STATUSES } from '../constants'

const { Title, Text } = Typography

function renderMatchInfo(record) {
  return (
    <Space direction='vertical' size={0}>
      <Text strong>
        {record.homeTeam.name} vs {record.awayTeam.name}
      </Text>
      <Text type='secondary'>{record.venue || 'Venue TBC'}</Text>
    </Space>
  )
}

function renderStatus(status) {
  if (FINISHED_STATUSES.has(status)) {
    return <Tag color='green'>Finished</Tag>
  }
  if (SCHEDULED_STATUSES.has(status)) {
    return <Tag color='blue'>Scheduled</Tag>
  }
  return <Tag color='default'>{status}</Tag>
}

function renderScore(record) {
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

export function MatchesSection({ matches, loading, onPredict }) {
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
      render: (_, record) => renderMatchInfo(record)
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (value) => renderStatus(value)
    },
    {
      title: 'Score',
      key: 'score',
      render: (_, record) => renderScore(record)
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Typography.Link onClick={() => onPredict(record)}>
          Predict standout player
        </Typography.Link>
      )
    }
  ]

  return (
    <div className='table-wrapper'>
      <Title level={4}>Matches</Title>
      {loading ? (
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
  )
}
