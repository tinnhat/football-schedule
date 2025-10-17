import { useMemo } from 'react'
import { AreaChartOutlined, CheckCircleTwoTone, FieldTimeOutlined } from '@ant-design/icons'
import { Card, Col, Empty, Row, Skeleton, Space, Statistic, Typography } from 'antd'
import dayjs from 'dayjs'
import { FINISHED_STATUSES, SCHEDULED_STATUSES } from '../constants'
import { MatchCard } from './MatchCard'

const { Title, Text } = Typography

export function MatchesSection({ matches, loading, onPredict }) {
  const { totalMatches, finishedCount, scheduledCount, earliestKickoff, latestKickoff } =
    useMemo(() => {
      if (!matches.length) {
        return {
          totalMatches: 0,
          finishedCount: 0,
          scheduledCount: 0,
          earliestKickoff: null,
          latestKickoff: null,
        }
      }

      const sortedByKickoff = [...matches].sort(
        (a, b) => dayjs(a.utcDate).valueOf() - dayjs(b.utcDate).valueOf()
      )
      const finished = matches.filter(match => FINISHED_STATUSES.has(match.status)).length
      const scheduled = matches.filter(match => SCHEDULED_STATUSES.has(match.status)).length

      return {
        totalMatches: matches.length,
        finishedCount: finished,
        scheduledCount: scheduled,
        earliestKickoff: sortedByKickoff[0]?.utcDate ?? null,
        latestKickoff: sortedByKickoff[sortedByKickoff.length - 1]?.utcDate ?? null,
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
      {matches.map(match => (
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
              prefix={
                <AreaChartOutlined className='summary-card__icon summary-card__icon--primary' />
              }
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
        <Card bordered={false} className='matches-panel__window' style={{ marginBottom: 16 }}>
          <Space direction='vertical' size={8} style={{ width: '100%' }}>
            <Text
              type='secondary'
              style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}
            >
              Match Time Window
            </Text>

            <Space direction='vertical' size={4} style={{ width: '100%' }}>
              <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <Text strong style={{ color: '#1890ff', fontSize: '13px' }}>
                  UTC Time
                </Text>
                <Text style={{ fontSize: '13px', fontFamily: 'monospace' }}>
                  {dayjs(earliestKickoff).format('DD/MM/YYYY HH:mm')} →{' '}
                  {dayjs(latestKickoff).format('DD/MM/YYYY HH:mm')}
                </Text>
              </div>

              <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <Text strong style={{ color: '#52c41a', fontSize: '13px' }}>
                  Vietnam Time (UTC+7)
                </Text>
                {" "}
                <Text style={{ fontSize: '13px', fontFamily: 'monospace' }}>
                  {dayjs(earliestKickoff).add(7, 'hour').format('DD/MM/YYYY HH:mm')} →{' '}
                  {dayjs(latestKickoff).add(7, 'hour').format('DD/MM/YYYY HH:mm')}
                </Text>
              </div>
            </Space>
          </Space>
        </Card>
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
