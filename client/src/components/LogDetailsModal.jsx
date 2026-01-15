import { X } from 'lucide-react';

const LogDetailsModal = ({ log, onClose }) => {
  if (!log) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold font-mono">Log Details</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">
            <X size={24} />
          </button>
        </div>
        
        <div className="p-6 overflow-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 p-3 rounded">
              <span className="text-xs text-gray-500 uppercase font-bold">Event ID</span>
              <div className="font-mono text-sm break-all">{log.requestPayload?.eventId}</div>
            </div>
            <div className={`p-3 rounded ${log.status >= 200 && log.status < 300 ? 'bg-green-50' : 'bg-red-50'}`}>
              <span className="text-xs text-gray-500 uppercase font-bold">Status</span>
              <div className={`font-mono text-sm font-bold ${log.status >= 200 && log.status < 300 ? 'text-green-700' : 'text-red-700'}`}>{log.status}</div>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <span className="text-xs text-gray-500 uppercase font-bold">Method</span>
              <div className="font-mono text-sm">{log.method}</div>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <span className="text-xs text-gray-500 uppercase font-bold">Latency</span>
              <div className="font-mono text-sm">{log.latencyMs} ms</div>
            </div>
          </div>

          <div className="mb-4">
            <h3 className="text-sm font-bold text-gray-500 uppercase mb-2">Request Payload</h3>
            <pre className="bg-gray-900 text-green-400 p-4 rounded text-xs overflow-x-auto">
              {JSON.stringify(log.requestPayload, null, 2)}
            </pre>
          </div>

          <div>
            <h3 className="text-sm font-bold text-gray-500 uppercase mb-2">Full Response</h3>
            <pre className="bg-gray-900 text-blue-300 p-4 rounded text-xs overflow-x-auto">
              {JSON.stringify(log.responseRaw, null, 2)}
            </pre>
          </div>
        </div>
        
        <div className="p-4 border-t bg-gray-50 flex justify-end">
          <button 
            onClick={onClose} 
            className="px-4 py-2 bg-white border border-gray-300 rounded hover:bg-gray-50 text-sm font-medium"
          >
            Close Esc
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogDetailsModal;
