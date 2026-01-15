import { useState, useEffect } from 'react';
import useRealTimeLogs from '../hooks/useRealTimeLogs';
import LogTable from './LogTable';
import LogDetailsModal from './LogDetailsModal';
import SystemInsights from './SystemInsights';
import { Activity, Radio } from 'lucide-react';

const Dashboard = () => {
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    status: ''
  });
  
  const { logs, connectionStatus } = useRealTimeLogs(filters);
  const [selectedLog, setSelectedLog] = useState(null);

  // Close modal on escape
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') setSelectedLog(null);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 md:p-12 font-sans text-gray-800">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600 rounded-lg shadow-lg shadow-indigo-200">
              <Activity className="text-white" size={24} />
            </div>
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-gray-900">BizScout Monitor</h1>
                <p className="text-gray-500 text-sm">Real-time API Observability</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-full border border-gray-200 shadow-sm text-sm">
            <div className={`w-2.5 h-2.5 rounded-full ${connectionStatus === 'connected' ? 'bg-green-500 animate-pulse' : 'bg-amber-500'}`} />
            <span className="font-medium text-gray-600 capitalize">
                {connectionStatus === 'connected' ? 'Live Stream' : connectionStatus}
            </span>
            {connectionStatus === 'connected' && <Radio size={14} className="text-green-600 ml-1" />}
          </div>
        </div>

        {/* Phase 4: AI Insights Placeholder */}
        <SystemInsights />

        {/* Filters & Stats */}
        <div className="grid grid-cols-1 gap-4">
            {/* Filters */}
            <div className="md:col-span-4 bg-white p-4 rounded-lg border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-end">
                <div className="w-full md:w-auto flex-1">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Start Date</label>
                    <input 
                        type="datetime-local" 
                        className="w-full text-sm border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        onChange={(e) => handleFilterChange('startDate', e.target.value)}
                    />
                </div>
                <div className="w-full md:w-auto flex-1">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">End Date</label>
                    <input 
                        type="datetime-local" 
                        className="w-full text-sm border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        onChange={(e) => handleFilterChange('endDate', e.target.value)}
                    />
                </div>
                <div className="w-full md:w-auto flex-1">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Status</label>
                    <select 
                        className="w-full text-sm border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        onChange={(e) => handleFilterChange('status', e.target.value)}
                    >
                        <option value="">All Statuses</option>
                        <option value="success">Success (2xx)</option>
                        <option value="error">Error (4xx/5xx)</option>
                    </select>
                </div>
            </div>

            {/* Stats */}
            <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                <div className="text-gray-500 text-xs uppercase font-bold tracking-wider mb-1">Total Requests</div>
                <div className="text-2xl font-bold text-gray-800">{logs.length}</div>
             </div>
             <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                <div className="text-gray-500 text-xs uppercase font-bold tracking-wider mb-1">Avg Latency</div>
                <div className="text-2xl font-bold text-gray-800">
                    {logs.length > 0 ? Math.round(logs.reduce((acc, log) => acc + log.latencyMs, 0) / logs.length) : 0} <span className="text-sm font-normal text-gray-400">ms</span>
                </div>
             </div>
             <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                <div className="text-gray-500 text-xs uppercase font-bold tracking-wider mb-1">Success Rate</div>
                <div className="text-2xl font-bold text-gray-800">
                    {logs.length > 0 ? Math.round((logs.filter(l => l.status < 400).length / logs.length) * 100) : 0}<span className="text-sm font-normal text-gray-400">%</span>
                </div>
             </div>
        </div>

        {/* Logs Table */}
        <div>
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-800">Latest Logs</h3>
                <span className="text-xs text-gray-400 font-mono hidden md:inline">httpbin.org/anything</span>
            </div>
            <LogTable logs={logs} onViewDetails={setSelectedLog} />
        </div>

      </div>

      {selectedLog && (
        <LogDetailsModal log={selectedLog} onClose={() => setSelectedLog(null)} />
      )}
    </div>
  );
};

export default Dashboard;
