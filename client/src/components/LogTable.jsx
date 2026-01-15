import { format } from 'date-fns';
import { Eye, Clock, CheckCircle, XCircle, ChevronRight } from 'lucide-react';

const LogTable = ({ logs, onViewDetails }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 font-semibold text-gray-700">Status</th>
              <th className="px-6 py-4 font-semibold text-gray-700">Timestamp</th>
              <th className="px-6 py-4 font-semibold text-gray-700">Event Type</th>
              <th className="px-6 py-4 font-semibold text-gray-700 text-right">Latency</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {logs.length === 0 ? (
                <tr>
                    <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                        No logs found. Waiting for events...
                    </td>
                </tr>
            ) : (
                logs.map((log) => (
                    <tr 
                        key={log._id || log.requestPayload.eventId} 
                        onClick={() => onViewDetails(log)}
                        className="hover:bg-indigo-50/50 cursor-pointer transition-colors animate-fade-in-down group"
                    >
                        <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                            {log.status >= 200 && log.status < 300 ? (
                            <CheckCircle size={18} className="text-green-500" />
                            ) : (
                            <XCircle size={18} className="text-red-500" />
                            )}
                            <span className={`font-medium ${log.status >= 200 && log.status < 300 ? 'text-gray-700' : 'text-red-600'}`}>
                            {log.status}
                            </span>
                        </div>
                        </td>
                        <td className="px-6 py-4 text-gray-500 font-mono text-xs">
                        {format(new Date(log.timestamp), 'PP pp')}
                        </td>
                        <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                            {log.requestPayload?.type || 'Unknown'}
                        </span>
                        </td>
                        <td className="px-6 py-4 text-gray-600 font-mono text-xs text-right">
                        <div className="flex items-center justify-end gap-2">
                            <div className="flex items-center gap-1.5">
                                <Clock size={14} className="text-gray-400" />
                                {log.latencyMs}ms
                            </div>
                            <ChevronRight size={16} className="text-gray-300 group-hover:text-indigo-500 transition-colors" />
                        </div>
                        </td>
                    </tr>
                ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LogTable;
