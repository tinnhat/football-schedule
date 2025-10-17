export const COMPETITIONS = [
  { code: 'PL', name: 'Premier League' },
  { code: 'PD', name: 'Primera División' },
  { code: 'BL1', name: 'Bundesliga' },
  { code: 'FL1', name: 'Ligue 1' },
  { code: 'SA', name: 'Serie A' }
]

export const STATUS_OPTIONS = [
  { value: 'ALL', label: 'All matches' },
  { value: 'SCHEDULED', label: 'Scheduled only' },
  { value: 'FINISHED', label: 'Completed only' }
]

export const SCHEDULED_STATUSES = new Set(['SCHEDULED', 'TIMED'])
export const FINISHED_STATUSES = new Set(['FINISHED', 'AWARDED'])
