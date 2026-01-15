import AIChat from './AIChat';
import IncidentList from './IncidentList';

const AIHub = () => {
    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">AI Integration Hub</h1>
                    <p className="text-gray-500">Real-time anomaly detection and intelligent assistance.</p>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <section>
                        <IncidentList />
                    </section>
                    <section>
                        <AIChat />
                    </section>
                </div>
            </div>
        </div>
    );
};

export default AIHub;
