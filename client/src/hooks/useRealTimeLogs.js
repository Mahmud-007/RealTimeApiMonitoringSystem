import { useState, useEffect } from 'react';
import axios from 'axios';

const useRealTimeLogs = (filters) => {
    const [logs, setLogs] = useState([]);
    const [connectionStatus, setConnectionStatus] = useState('connecting');

    useEffect(() => {
        // 1. Fetch initial logs (with filters)
        const fetchHistory = async () => {
            try {
                const params = new URLSearchParams({ limit: 50 });
                if (filters?.startDate) params.append('startDate', filters.startDate);
                if (filters?.endDate) params.append('endDate', filters.endDate);
                if (filters?.status) params.append('status', filters.status);

                const response = await axios.get(`http://localhost:3000/api/logs?${params.toString()}`);
                // Support both old array format and new paginated format
                setLogs(Array.isArray(response.data) ? response.data : response.data.data);
            } catch (err) {
                console.error('Failed to fetch initial logs:', err);
            }
        };

        fetchHistory();

        // 2. Connect to SSE (Only if no filters are active - usually we want real-time only on "Live" view)
        // For simplicity, we'll keep it active but you might want to disable it if viewing historical data
        const eventSource = new EventSource('http://localhost:3000/api/events');

        eventSource.onopen = () => {
            setConnectionStatus('connected');
        };

        eventSource.onmessage = (event) => {
            // Only prepend if we are not deep filtering (optional logic, but good for UX)
            // For now, we will always prepend to show liveliness
            try {
                const newLog = JSON.parse(event.data);
                setLogs((prevLogs) => [newLog, ...prevLogs]);
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
    }, [filters?.startDate, filters?.endDate, filters?.status]); // Re-run when filters change

    return { logs, connectionStatus };
};

export default useRealTimeLogs;
