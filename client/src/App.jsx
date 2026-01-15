import { useState } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import AIHub from './components/AIHub';

function App() {
  const [currentView, setCurrentView] = useState('dashboard');

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Navbar currentView={currentView} setCurrentView={setCurrentView} />
      
      <main>
        {currentView === 'dashboard' ? (
            <Dashboard />
        ) : (
            <AIHub />
        )}
      </main>
    </div>
  );
}

export default App;
