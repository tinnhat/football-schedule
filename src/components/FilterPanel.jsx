import { Col, DatePicker, Divider, Row, Select, Space, Typography } from 'antd'

const { Title, Text } = Typography

export function FilterPanel({
  dateFrom,
  dateTo,
  competitions,
  selectedCompetitions,
  statusOptions,
  statusFilter,
  onDateFromChange,
  onDateToChange,
  onCompetitionsChange,
  onStatusChange
}) {
  return (
    <div className='filter-panel'>
      <Title level={4}>Filters</Title>
      <Row gutter={[16, 16]}>
        <Col xs={24} md={12} lg={8}>
          <Space direction='vertical' className='filter-control'>
            <Text strong>Date from</Text>
            <DatePicker value={dateFrom} onChange={onDateFromChange} allowClear={false} />
          </Space>
        </Col>
        <Col xs={24} md={12} lg={8}>
          <Space direction='vertical' className='filter-control'>
            <Text strong>Date to</Text>
            <DatePicker value={dateTo} onChange={onDateToChange} allowClear={false} />
          </Space>
        </Col>
        <Col xs={24} md={24} lg={8}>
          <Space direction='vertical' className='filter-control'>
            <Text strong>Competitions</Text>
            <Select
              mode='multiple'
              value={selectedCompetitions}
              onChange={onCompetitionsChange}
              options={competitions.map((competition) => ({
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
            <Select value={statusFilter} onChange={onStatusChange} options={statusOptions} />
          </Space>
        </Col>
      </Row>
    </div>
  )
}
