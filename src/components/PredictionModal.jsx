import { Divider, Modal, Space, Spin, Typography } from 'antd'
import dayjs from 'dayjs'

const { Text, Paragraph } = Typography

export function PredictionModal({ open, loading, match, result, onClose }) {
  return (
    <Modal title='AI Player Prediction' open={open} onCancel={onClose} footer={null} destroyOnClose>
      {match && (
        <Space direction='vertical' size='middle' style={{ width: '100%' }}>
          <div>
            <Text strong>
              {match.homeTeam?.name} vs {match.awayTeam?.name}
            </Text>
            <br />
            <Text type='secondary'>
              {dayjs(match.utcDate).format('DD MMM YYYY HH:mm')} · {match.competition?.name}
            </Text>
          </div>
          <Divider style={{ margin: '8px 0' }} />
          {loading ? <Spin tip='Generating prediction...' /> : <Paragraph>{result}</Paragraph>}
        </Space>
      )}
    </Modal>
  )
}
