import { useState, useEffect } from 'react';
import axios from 'axios';

const useRealTimeLogs = () => {
    const [logs, setLogs] = useState([]);
    const [connectionStatus, setConnectionStatus] = useState('connecting');

    useEffect(() => {
        // 1. Fetch initial logs
        const fetchHistory = async () => {
            try {
                const response = await axios.get('http://localhost:3000/api/logs?limit=50');
                setLogs(response.data);
            } catch (err) {
                console.error('Failed to fetch initial logs:', err);
            }
        };

        fetchHistory();

        // 2. Connect to SSE
        const eventSource = new EventSource('http://localhost:3000/api/events');

        eventSource.onopen = () => {
            setConnectionStatus('connected');
        };

        eventSource.onmessage = (event) => {
            try {
                const newLog = JSON.parse(event.data);
                // Prepend new log
                setLogs((prevLogs) => [newLog, ...prevLogs]);
            } catch (error) {
                console.error('Error parsing SSE data:', error);
            }
        };

        eventSource.onerror = (err) => {
            console.error('SSE Error:', err);
            setConnectionStatus('error');
            // EventSource automatically tries to reconnect, but we can track state
        };

        return () => {
            eventSource.close();
            setConnectionStatus('disconnected');
        };
    }, []);

    return { logs, connectionStatus };
};

export default useRealTimeLogs;
