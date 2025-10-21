import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import { message } from "antd";
import { FINISHED_STATUSES, SCHEDULED_STATUSES } from "../constants";

function formatDate(value) {
  return value ? dayjs(value).format("YYYY-MM-DD") : undefined;
}

export function useMatches({ dateFrom, dateTo, competition, statusFilter, token }) {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);

  // ✅ Phát hiện môi trường để chọn base URL phù hợp
  const apiBaseUrl = useMemo(() => {
    if (import.meta.env.DEV) {
      // dev: dùng proxy như cũ (vite.config.js)
      return "/football-data/v4";
    }
    // production: gọi serverless endpoint
    return "/api/matches";
  }, []);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    async function fetchMatches() {
      if (!dateFrom || !dateTo || dayjs(dateFrom).isAfter(dayjs(dateTo))) {
        message.warning("Please select a valid date range.");
        return;
      }

      if (!competition) {
        setMatches([]);
        return;
      }

      setLoading(true);
      setMatches([]);

      try {
        const params = new URLSearchParams({
          dateFrom: formatDate(dateFrom),
          dateTo: formatDate(dateTo),
          competition
        });

        const url = import.meta.env.DEV
          ? `${apiBaseUrl}/competitions/${competition}/matches?${params.toString()}`
          : `${apiBaseUrl}?${params.toString()}`;

        const headers = import.meta.env.DEV
          ? { "X-Auth-Token": token } // Dev gọi trực tiếp API nên cần token
          : {}; // Prod không cần token vì serverless đã gắn sẵn

        const response = await fetch(url, {
          headers,
          signal: controller.signal
        });

        if (!response.ok) {
          const errorBody = await response.json().catch(() => undefined);
          const messageText = errorBody?.message || response.statusText;
          throw new Error(`Unable to load ${competition} matches: ${messageText}`);
        }

        const data = await response.json();
        const merged = data.matches || [];

        const filtered = merged.filter((match) => {
          if (statusFilter === "ALL") return true;
          if (statusFilter === "SCHEDULED") return SCHEDULED_STATUSES.has(match.status);
          if (statusFilter === "FINISHED") return FINISHED_STATUSES.has(match.status);
          return true;
        });

        const sorted = filtered.sort((a, b) => dayjs(a.utcDate).diff(dayjs(b.utcDate)));

        if (isMounted) {
          setMatches(sorted);
        }
      } catch (error) {
        console.error(error);
        if (isMounted && error.name !== "AbortError") {
          message.error(error.message);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchMatches();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [apiBaseUrl, competition, dateFrom, dateTo, statusFilter, token]);

  return { matches, loading };
}
