'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../../utils/supabase/client';

interface TeamRegistration {
  id: string;
  team_name: string;
  player_1_name: string;
  player_2_name: string;
  contact_number: string;
  payment_status: string;
  created_at: string;
}

export default function AdminTournamentsDashboard() {
  const [generating, setGenerating] = useState(false);
  const [teams, setTeams] = useState<TeamRegistration[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTeams = async () => {
    try {
      const { data, error } = await supabase
        .from('tournament_teams')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTeams(data || []);
    } catch (error) {
      console.error('Error fetching teams:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTeams(); }, []);

  const handleUpdateStatus = async (id: string, newStatus: 'approved' | 'rejected' | 'pending') => {
    try {
      const { error } = await supabase
        .from('tournament_teams')
        .update({ payment_status: newStatus })
        .eq('id', id);

      if (error) throw error;
      setTeams((prevTeams) =>
        prevTeams.map((team) =>
          team.id === id ? { ...team, payment_status: newStatus } : team
        )
      );
    } catch (error) {
      console.error('Error updating team status:', error);
      alert('Failed to update status.');
    }
  };

  const handleGenerateBracket = async () => {
    const approvedTeams = teams.filter(t => t.payment_status === 'approved');
    if (approvedTeams.length !== 8) {
      alert(`Bracket generation requires 8 approved teams. You have ${approvedTeams.length}.`);
      return;
    }
    if (!confirm('Generate bracket? This will reset existing matches.')) return;
    
    setGenerating(true);
    try {
      const shuffledTeams = [...approvedTeams].sort(() => Math.random() - 0.5);
      await supabase.from('tournament_matches').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      const matchInserts = [];
      for (let i = 0; i < 4; i++) {
        matchInserts.push({
          round_number: 1,
          match_number: i + 1,
          team_a_id: shuffledTeams[i * 2].id,
          team_b_id: shuffledTeams[i * 2 + 1].id,
          team_a_score: 0,
          team_b_score: 0,
          status: 'scheduled'
        });
      }
      const { error } = await supabase.from('tournament_matches').insert(matchInserts);
      if (error) throw error;
      alert('🚀 Bracket created successfully!');
    } catch (error: any) {
      alert(`Failed to generate bracket: ${error?.message}`);
    } finally {
      setGenerating(false);
    }
  };

  const totalTeams = teams.length;
  const approvedTeamsCount = teams.filter(t => t.payment_status === 'approved').length;
  const pendingTeams = teams.filter(t => t.payment_status === 'pending').length;
  const totalRevenue = approvedTeamsCount * 500;

  if (loading) return <div className="min-h-screen bg-[#450a0a] text-red-400 flex items-center justify-center animate-pulse">Loading Infrastructure...</div>;

  return (
    <div className="min-h-screen bg-[#450a0a] text-red-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-red-900 pb-6 mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#facc15] bg-[#facc15]/10 px-2.5 py-1 rounded-full">Baham Sports Admin Hub</span>
            <h1 className="text-3xl font-black tracking-tight mt-2 text-white">Tournament Operations</h1>
          </div>
          <button
            onClick={handleGenerateBracket}
            disabled={generating}
            className="bg-[#facc15] hover:bg-yellow-500 disabled:opacity-50 text-[#450a0a] font-black text-xs uppercase px-5 py-3 rounded-xl shadow-lg shadow-[#facc15]/10 transition-all"
          >
            {generating ? '🎲 Shuffling...' : '🎲 Generate Bracket Tree'}
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Sign-ups', val: `${totalTeams} Teams`, color: 'text-white' },
            { label: 'Approved Slots', val: `${approvedTeamsCount} Verified`, color: 'text-[#facc15]' },
            { label: 'Review Required', val: `${pendingTeams} Pending`, color: 'text-red-300' },
            { label: 'Estimated Revenue', val: `₱${totalRevenue.toLocaleString()}`, color: 'text-white' }
          ].map((stat, i) => (
            <div key={i} className="bg-[#7f1d1d] border border-red-800 p-4 rounded-xl">
              <p className="text-xs font-bold text-red-300/60 uppercase">{stat.label}</p>
              <p className={`text-2xl font-black mt-1 ${stat.color}`}>{stat.val}</p>
            </div>
          ))}
        </div>

        <div className="bg-[#7f1d1d] border border-red-800 rounded-xl overflow-hidden shadow-xl">
          <div className="px-6 py-4 border-b border-red-800 bg-[#450a0a]/50 flex items-center justify-between">
            <h2 className="font-bold text-sm text-red-50">Registration Queue</h2>
            <button onClick={fetchTeams} className="text-xs text-red-300 hover:text-white px-2.5 py-1 rounded-md bg-[#450a0a] border border-red-800">🔄 Refresh</button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#450a0a] text-red-300 text-xs font-bold uppercase">
                <tr>
                  <th className="p-4">Team Info</th>
                  <th className="p-4">Roster</th>
                  <th className="p-4">Payment</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-red-800/50">
                {teams.map((team) => (
                  <tr key={team.id} className="hover:bg-[#450a0a]/40">
                    <td className="p-4 font-bold">{team.team_name}</td>
                    <td className="p-4 text-red-200">👤 {team.player_1_name}<br />👤 {team.player_2_name}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${team.payment_status === 'approved' ? 'bg-[#facc15]/10 text-[#facc15]' : 'bg-red-900 text-red-300'}`}>
                        {team.payment_status}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      {team.payment_status === 'pending' && (
                        <>
                          <button onClick={() => handleUpdateStatus(team.id, 'approved')} className="bg-[#facc15] text-[#450a0a] font-bold text-[10px] px-3 py-1 rounded">Approve</button>
                          <button onClick={() => handleUpdateStatus(team.id, 'rejected')} className="bg-red-900 border border-red-700 text-red-300 text-[10px] px-3 py-1 rounded">Deny</button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}