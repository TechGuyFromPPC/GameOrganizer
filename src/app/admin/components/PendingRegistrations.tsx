'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function PendingRegistrations() {
  const [teams, setTeams] = useState<any[]>([]);

  useEffect(() => {
    const fetchTeams = async () => {
      const { data } = await supabase.from('team_registrations').select('*').eq('status', 'pending');
      setTeams(data || []);
    };
    fetchTeams();
  }, []);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-amber-500">Pending Approvals</h2>
      {teams.length === 0 ? (
        <p className="text-red-400">No pending registrations.</p>
      ) : (
        teams.map(team => (
          <div key={team.id} className="p-4 bg-red-900/50 rounded flex justify-between items-center border border-red-800">
            <div>
              <p className="font-bold">{team.team_name}</p>
              <p className="text-xs text-red-300">Coach: {team.coach_name}</p>
            </div>
            <button className="bg-green-600 hover:bg-green-500 px-3 py-1 rounded text-sm font-bold text-white">
              Approve
            </button>
          </div>
        ))
      )}
    </div>
  );
}