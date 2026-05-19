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

  // 1. Fetch all registrations from Supabase
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

  useEffect(() => {
    fetchTeams();
  }, []);

  // 2. Update payment_status (Approve / Reject)
  const handleUpdateStatus = async (id: string, newStatus: 'approved' | 'rejected' | 'pending') => {
    try {
      const { error } = await supabase
        .from('tournament_teams')
        .update({ payment_status: newStatus })
        .eq('id', id);

      if (error) throw error;
      
      // Optimistically update local state so the UI changes instantly
      setTeams((prevTeams) =>
        prevTeams.map((team) =>
          team.id === id ? { ...team, payment_status: newStatus } : team
        )
      );
    } catch (error) {
      console.error('Error updating team status:', error);
      alert('Failed to update status. Please try again.');
    }
  }; // <-- Fixed closing bracket here!

  // 3. Engine automated single-elimination bracket generation
  const handleGenerateBracket = async () => {
    // Filter out only the approved teams
    const approvedTeams = teams.filter(t => t.payment_status === 'approved');

    // Enforce a strict single-elimination size (8 teams for Quarterfinals)
    if (approvedTeams.length !== 8) {
      alert(`Bracket generation requires exactly 8 approved teams. You currently have ${approvedTeams.length}.`);
      return;
    }

    if (!confirm('Are you sure you want to generate the tournament bracket? This will reset any existing match configurations.')) return;
    
    setGenerating(true);

    try {
      // Shuffle teams randomly for unbiased seeding
      const shuffledTeams = [...approvedTeams].sort(() => Math.random() - 0.5);

      // Delete old match configurations to prevent duplicate errors
      await supabase.from('tournament_matches').delete().neq('id', '00000000-0000-0000-0000-000000000000');

      // Build the 4 Quarterfinal matches mapping pairs together
      const matchInserts = [];
      for (let i = 0; i < 4; i++) {
        matchInserts.push({
          round_number: 1, // Round 1 = Quarterfinals
          match_number: i + 1,
          team_a_id: shuffledTeams[i * 2].id,
          team_b_id: shuffledTeams[i * 2 + 1].id,
          team_a_score: 0,
          team_b_score: 0,
          status: 'scheduled'
        });
      }

      // Insert matches into Supabase
      const { error } = await supabase.from('tournament_matches').insert(matchInserts);
      if (error) throw error;

      alert('🚀 Bracket created successfully! Round 1 is now officially live.');
  } catch (error: any) {
    // Force JavaScript to serialize the deep properties of the database error
    console.error('Bracket generation crash:', {
      message: error?.message,
      details: error?.details,
      hint: error?.hint,
      code: error?.code
    });
    alert(`Failed to generate bracket structure: ${error?.message || 'Unknown DB Error'}`);
  } finally {
      setGenerating(false);
    }
  };

  // Metric Math
  const totalTeams = teams.length;
  const approvedTeamsCount = teams.filter(t => t.payment_status === 'approved').length;
  const pendingTeams = teams.filter(t => t.payment_status === 'pending').length;
  const totalRevenue = approvedTeamsCount * 500; // ₱500 per approved team

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-400 flex items-center justify-center text-sm font-medium animate-pulse">
        Loading tournament infrastructure control panel...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
      <div className="max-w-6xl mx-auto">
        
        {/* Header section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-900 pb-6 mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full">
              Baham Sports Admin Hub
            </span>
            <h1 className="text-3xl font-black tracking-tight mt-2 text-white">Tournament Operations Dashboard</h1>
            <p className="text-sm text-slate-400 mt-1">Manage incoming player queues, audit GCash payments, and track team allocations.</p>
          </div>
          
          {/* Bracket Engine Trigger Action Button inside layout header */}
          <div className="flex items-center">
            <button
              onClick={handleGenerateBracket}
              disabled={generating}
              className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-slate-950 font-black text-xs uppercase tracking-wider px-5 py-3 rounded-xl shadow-lg shadow-emerald-500/10 active:scale-[0.99] transition-all"
            >
              {generating ? '🎲 Shuffling Pool...' : '🎲 Generate Bracket Tree'}
            </button>
          </div>
        </div>

        {/* Analytics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Sign-ups</p>
            <p className="text-2xl font-black mt-1 text-white">{totalTeams} Teams</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
            <p className="text-xs font-bold text-emerald-500 uppercase tracking-wider">Approved Slots</p>
            <p className="text-2xl font-black mt-1 text-emerald-400">{approvedTeamsCount} Verified</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
            <p className="text-xs font-bold text-amber-500 uppercase tracking-wider">Review Required</p>
            <p className="text-2xl font-black mt-1 text-amber-400">{pendingTeams} Pending</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
            <p className="text-xs font-bold text-blue-500 uppercase tracking-wider">Estimated Revenue</p>
            <p className="text-2xl font-black mt-1 text-blue-400">₱{totalRevenue.toLocaleString()}</p>
          </div>
        </div>

        {/* Main List Area */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
          <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between">
            <h2 className="font-bold text-sm tracking-tight text-slate-200">Registration Queue</h2>
            <button onClick={fetchTeams} className="text-xs text-slate-400 hover:text-white transition-colors bg-slate-950 border border-slate-800 px-2.5 py-1 rounded-md">
              🔄 Refresh List
            </button>
          </div>

          {teams.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-sm">
              No tournament applications detected inside the database yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-950/40 text-slate-400 border-b border-slate-800 text-xs font-bold uppercase tracking-wider">
                    <th className="p-4">Team Info</th>
                    <th className="p-4">Roster Players</th>
                    <th className="p-4">Contact</th>
                    <th className="p-4">Payment Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {teams.map((team) => (
                    <tr key={team.id} className="hover:bg-slate-950/20 transition-colors">
                      <td className="p-4 font-bold text-slate-100">{team.team_name}</td>
                      <td className="p-4 text-slate-300">
                        <div className="flex flex-col">
                          <span>👤 {team.player_1_name} <span className="text-[10px] text-slate-500">(Capt)</span></span>
                          <span className="mt-0.5">👤 {team.player_2_name}</span>
                        </div>
                      </td>
                      <td className="p-4 text-slate-400 font-mono text-xs">{team.contact_number}</td>
                      <td className="p-4">
                        <span className={`inline-block text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          team.payment_status === 'approved' ? 'bg-emerald-500/10 text-emerald-400' :
                          team.payment_status === 'rejected' ? 'bg-rose-500/10 text-rose-400' :
                          'bg-amber-500/10 text-amber-400 animate-pulse'
                        }`}>
                          {team.payment_status}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        {team.payment_status === 'pending' && (
                          <>
                            <button 
                              onClick={() => handleUpdateStatus(team.id, 'approved')}
                              className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs px-3 py-1.5 rounded-md shadow-sm transition-colors"
                            >
                              Approve
                            </button>
                            <button 
                              onClick={() => handleUpdateStatus(team.id, 'rejected')}
                              className="bg-slate-950 hover:bg-rose-500/20 hover:text-rose-400 border border-slate-800 font-medium text-slate-400 text-xs px-3 py-1.5 rounded-md transition-all"
                            >
                              Deny
                            </button>
                          </>
                        )}
                        {team.payment_status !== 'pending' && (
                          <button 
                            onClick={() => handleUpdateStatus(team.id, 'pending')}
                            className="text-[11px] text-slate-500 hover:text-slate-300 underline underline-offset-2 transition-colors"
                          >
                            Reset to Pending
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}