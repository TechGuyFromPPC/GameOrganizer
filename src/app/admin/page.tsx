'use client';
import { useState } from 'react';
import ManageTournaments from './components/ManageTournaments';
import PendingRegistrations from './components/PendingRegistrations';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('tournaments');

  return (
    <div className="min-h-screen bg-[#450a0a] p-8 text-white">
      <h1 className="text-4xl font-black mb-8 text-amber-500 uppercase tracking-tighter">Control Center</h1>
      
      <div className="flex gap-2 mb-8">
        <button onClick={() => setActiveTab('tournaments')} className={`px-6 py-2 rounded-lg font-bold ${activeTab === 'tournaments' ? 'bg-amber-500 text-black' : 'bg-red-900'}`}>Tournaments</button>
        <button onClick={() => setActiveTab('registrations')} className={`px-6 py-2 rounded-lg font-bold ${activeTab === 'registrations' ? 'bg-amber-500 text-black' : 'bg-red-900'}`}>Pending Teams</button>
      </div>

      <div className="bg-red-950/50 p-6 rounded-xl border border-red-900">
        {activeTab === 'tournaments' ? <ManageTournaments /> : <PendingRegistrations />}
      </div>
    </div>
  );
}