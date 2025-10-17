import { useMemo, useState } from 'react'
import {
  CalendarOutlined,
  FilterOutlined,
  FlagOutlined,
  ThunderboltOutlined
} from '@ant-design/icons'
import {
  Button,
  Card,
  Col,
  DatePicker,
  Row,
  Segmented,
  Select,
  Space,
  Tooltip,
  Typography
} from 'antd'
import dayjs from 'dayjs'

const { Title, Text } = Typography

const presetOptions = [
  {
    key: 'TODAY',
    label: 'Today',
    icon: <CalendarOutlined />,
    getRange: () => {
      const start = dayjs().startOf('day')
      return { from: start, to: start.endOf('day') }
    }
  },
  {
    key: 'NEXT_7',
    label: 'Next 7 days',
    icon: <ThunderboltOutlined />,
    getRange: () => {
      const start = dayjs().startOf('day')
      return { from: start, to: start.add(6, 'day').endOf('day') }
    }
  },
  {
    key: 'NEXT_30',
    label: 'Next 30 days',
    icon: <FlagOutlined />,
    getRange: () => {
      const start = dayjs().startOf('day')
      return { from: start, to: start.add(29, 'day').endOf('day') }
    }
  }
]

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
  const [activePreset, setActivePreset] = useState(() => presetOptions[1].key)

  const statusSegmentedOptions = useMemo(
    () =>
      statusOptions.map((option) => ({
        label: option.label,
        value: option.value
      })),
    [statusOptions]
  )

  const handlePresetSelect = (key) => {
    const preset = presetOptions.find((item) => item.key === key)
    if (!preset) return

    const { from, to } = preset.getRange()
    onDateFromChange(from)
    onDateToChange(to)
    setActivePreset(key)
  }

  const handleDateFromChange = (value) => {
    onDateFromChange(value)
    setActivePreset(null)
  }

  const handleDateToChange = (value) => {
    onDateToChange(value)
    setActivePreset(null)
  }

  const disabledDate = (current) => {
    if (!current) return false
    const earliest = dayjs().subtract(1, 'year')
    const latest = dayjs().add(1, 'year')
    return current.isBefore(earliest, 'day') || current.isAfter(latest, 'day')
  }

  return (
    <Card
      className='filter-panel'
      bordered={false}
      title={
        <Space align='center'>
          <FilterOutlined className='filter-panel__icon' />
          <Title level={4} style={{ margin: 0 }}>
            Filter matches
          </Title>
        </Space>
      }
      extra={
        <Space size='small'>
          {presetOptions.map((preset) => (
            <Tooltip key={preset.key} title={`Show matches for ${preset.label.toLowerCase()}`}>
              <Button
                type={activePreset === preset.key ? 'primary' : 'default'}
                ghost={activePreset !== preset.key}
                icon={preset.icon}
                onClick={() => handlePresetSelect(preset.key)}
              >
                {preset.label}
              </Button>
            </Tooltip>
          ))}
        </Space>
      }
    >
      <Row gutter={[24, 24]}>
        <Col xs={24} md={12} xl={8}>
          <Space direction='vertical' className='filter-control'>
            <Text type='secondary'>Date from</Text>
            <DatePicker
              value={dateFrom}
              onChange={handleDateFromChange}
              allowClear={false}
              size='large'
              style={{ width: '100%' }}
              disabledDate={disabledDate}
            />
          </Space>
        </Col>
        <Col xs={24} md={12} xl={8}>
          <Space direction='vertical' className='filter-control'>
            <Text type='secondary'>Date to</Text>
            <DatePicker
              value={dateTo}
              onChange={handleDateToChange}
              allowClear={false}
              size='large'
              style={{ width: '100%' }}
              disabledDate={disabledDate}
            />
          </Space>
        </Col>
        <Col xs={24} xl={8}>
          <Space direction='vertical' className='filter-control'>
            <Text type='secondary'>Competitions</Text>
            <Select
              mode='multiple'
              size='large'
              value={selectedCompetitions}
              onChange={onCompetitionsChange}
              options={competitions.map((competition) => ({
                label: competition.name,
                value: competition.code
              }))}
              placeholder='Select competitions'
              maxTagCount='responsive'
            />
          </Space>
        </Col>
      </Row>
      <Row gutter={[24, 24]} style={{ marginTop: 8 }}>
        <Col span={24}>
          <Space direction='vertical' className='filter-control'>
            <Text type='secondary'>Match status</Text>
            <Segmented
              size='large'
              block
              value={statusFilter}
              onChange={onStatusChange}
              options={statusSegmentedOptions}
            />
          </Space>
        </Col>
      </Row>
    </Card>
  )
}
