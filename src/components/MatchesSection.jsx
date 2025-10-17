import { useMemo } from 'react'
import {
  AreaChartOutlined,
  CheckCircleTwoTone,
  FieldTimeOutlined
} from '@ant-design/icons'
import { Card, Col, Empty, Row, Skeleton, Space, Statistic, Typography } from 'antd'
import dayjs from 'dayjs'
import { FINISHED_STATUSES, SCHEDULED_STATUSES } from '../constants'
import { MatchCard } from './MatchCard'

const { Title, Text } = Typography

export function MatchesSection({ matches, loading, onPredict }) {
  const { totalMatches, finishedCount, scheduledCount, earliestKickoff, latestKickoff } = useMemo(() => {
    if (!matches.length) {
      return {
        totalMatches: 0,
        finishedCount: 0,
        scheduledCount: 0,
        earliestKickoff: null,
        latestKickoff: null
      }
    }

    const sortedByKickoff = [...matches].sort((a, b) => dayjs(a.utcDate).valueOf() - dayjs(b.utcDate).valueOf())
    const finished = matches.filter((match) => FINISHED_STATUSES.has(match.status)).length
    const scheduled = matches.filter((match) => SCHEDULED_STATUSES.has(match.status)).length

    return {
      totalMatches: matches.length,
      finishedCount: finished,
      scheduledCount: scheduled,
      earliestKickoff: sortedByKickoff[0]?.utcDate ?? null,
      latestKickoff: sortedByKickoff[sortedByKickoff.length - 1]?.utcDate ?? null
    }
  }, [matches])

  const renderSkeletons = () => (
    <Row gutter={[16, 16]}>
      {Array.from({ length: 4 }).map((_, index) => (
        <Col key={`skeleton-${index}`} xs={24} md={12} xl={8}>
          <Card className='match-card' bordered={false}>
            <Skeleton active paragraph={{ rows: 4 }} />
          </Card>
        </Col>
      ))}
    </Row>
  )

  const renderMatches = () => (
    <Row gutter={[16, 16]}>
      {matches.map((match) => (
        <Col key={match.id} xs={24} md={12} xl={8}>
          <MatchCard match={match} onPredict={onPredict} />
        </Col>
      ))}
    </Row>
  )

  return (
    <div className='matches-panel'>
      <div className='matches-panel__header'>
        <div>
          <Title level={4} style={{ marginBottom: 4 }}>
            Matches
          </Title>
          <Text type='secondary'>Explore fixtures and request AI insight for any game.</Text>
        </div>
      </div>

      <Row gutter={[16, 16]} className='matches-panel__summary'>
        <Col xs={24} md={8}>
          <Card bordered={false} className='summary-card'>
            <Statistic
              title='Total matches'
              value={totalMatches}
              prefix={<AreaChartOutlined className='summary-card__icon summary-card__icon--primary' />}
            />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card bordered={false} className='summary-card'>
            <Statistic
              title='Scheduled'
              value={scheduledCount}
              prefix={<FieldTimeOutlined className='summary-card__icon summary-card__icon--info' />}
            />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card bordered={false} className='summary-card'>
            <Statistic
              title='Completed'
              value={finishedCount}
              prefix={<CheckCircleTwoTone twoToneColor='#52c41a' className='summary-card__icon' />}
            />
          </Card>
        </Col>
      </Row>

      {earliestKickoff && latestKickoff && (
        <Space direction='vertical' size={0} className='matches-panel__window'>
          <Text type='secondary'>Time window</Text>
          <Text strong>
            {dayjs(earliestKickoff).format('DD MMM YYYY HH:mm')} – {dayjs(latestKickoff).format('DD MMM YYYY HH:mm')}
          </Text>
        </Space>
      )}

      {loading ? (
        renderSkeletons()
      ) : matches.length === 0 ? (
        <Empty description='No matches to display. Adjust your filters to see more games.' />
      ) : (
        renderMatches()
      )}
    </div>
  )
}
