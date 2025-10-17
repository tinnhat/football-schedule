import { useEffect, useMemo, useState } from 'react'
import dayjs from 'dayjs'
import { message } from 'antd'
import { FINISHED_STATUSES, SCHEDULED_STATUSES } from '../constants'

function formatDate(value) {
  return value ? dayjs(value).format('YYYY-MM-DD') : undefined
}

export function useMatches({ dateFrom, dateTo, competitions, statusFilter, token }) {
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(false)

  const apiBaseUrl = useMemo(() => {
    const raw =
      import.meta.env.VITE_FOOTBALL_API_BASE_URL ||
      (import.meta.env.DEV ? '/football-data' : 'https://api.football-data.org')
    return raw.replace(/\/$/, '')
  }, [])

  useEffect(() => {
    let isMounted = true
    const controller = new AbortController()

    async function fetchMatches() {
      if (!token) {
        message.error('Missing football-data.org API token. Please configure VITE_FOOTBALL_DATA_TOKEN.')
        return
      }

      if (!dateFrom || !dateTo || dayjs(dateFrom).isAfter(dayjs(dateTo))) {
        message.warning('Please select a valid date range.')
        return
      }

      if (!competitions.length) {
        setMatches([])
        return
      }

      setLoading(true)
      setMatches([])

      try {
        const params = new URLSearchParams({
          dateFrom: formatDate(dateFrom),
          dateTo: formatDate(dateTo)
        })

        const responses = await Promise.all(
          competitions.map(async (competitionCode) => {
            const response = await fetch(
              `${apiBaseUrl}/v4/competitions/${competitionCode}/matches?${params.toString()}`,
              {
                headers: {
                  'X-Auth-Token': token
                },
                signal: controller.signal
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

        if (isMounted) {
          setMatches(sorted)
        }
      } catch (error) {
        console.error(error)
        if (isMounted && error.name !== 'AbortError') {
          message.error(error.message)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchMatches()

    return () => {
      isMounted = false
      controller.abort()
    }
  }, [apiBaseUrl, competitions, dateFrom, dateTo, statusFilter, token])

  return { matches, loading }
}
