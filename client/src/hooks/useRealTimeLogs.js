import { useState, useEffect } from 'react';
import axios from 'axios';

const useRealTimeLogs = (filters, page = 1) => {
    const [logs, setLogs] = useState([]);
    const [connectionStatus, setConnectionStatus] = useState('connecting');
    const [totalLogs, setTotalLogs] = useState(0);
    const [stats, setStats] = useState({
        totalLogs: 0,
        avgLatency: 0,
        successRate: 0
    });

    useEffect(() => {
        // 1. Fetch initial logs (with filters and page)
        const fetchHistory = async () => {
            try {
                const params = new URLSearchParams({ limit: 50, page: page });
                if (filters?.startDate) params.append('startDate', filters.startDate);
                if (filters?.endDate) params.append('endDate', filters.endDate);
                if (filters?.status) params.append('status', filters.status);

                const response = await axios.get(`/api/logs?${params.toString()}`);

                if (response.data.pagination) {
                    setLogs(response.data.data);
                    setTotalLogs(response.data.pagination.total);
                } else {
                    // Fallback for array response
                    setLogs(response.data);
                    setTotalLogs(response.data.length);
                }
            } catch (err) {
                console.error('Failed to fetch initial logs:', err);
            }
        };

        // 2. Fetch overall statistics (independent of page)
        const fetchStats = async () => {
            try {
                const params = new URLSearchParams();
                if (filters?.startDate) params.append('startDate', filters.startDate);
                if (filters?.endDate) params.append('endDate', filters.endDate);
                if (filters?.status) params.append('status', filters.status);

                const response = await axios.get(`/api/stats?${params.toString()}`);
                setStats(response.data);
            } catch (err) {
                console.error('Failed to fetch stats:', err);
            }
        };

        fetchHistory();
        fetchStats();

        // 3. Connect to SSE
        const eventSource = new EventSource('/api/events');

        eventSource.onopen = () => {
            setConnectionStatus('connected');
        };

        eventSource.onmessage = (event) => {
            try {
                const newLog = JSON.parse(event.data);
                setLogs((prevLogs) => [newLog, ...prevLogs]);
                // Refresh stats when new log arrives
                fetchStats();
            } catch (error) {
                console.error('Error parsing SSE data:', error);
            }
        };

        eventSource.onerror = (err) => {
            console.error('SSE Error:', err);
            setConnectionStatus('error');
        };

        return () => {
            eventSource.close();
            setConnectionStatus('disconnected');
        };
    }, [filters?.startDate, filters?.endDate, filters?.status, page]);

    return { logs, connectionStatus, totalLogs, stats };
};

export default useRealTimeLogs;
