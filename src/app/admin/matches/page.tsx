'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../../utils/supabase/client';
import LiveScoringDesk from '../../../components/LiveScoringDesk';

export default function AdminMatchesDashboard() {
  const [matches, setMatches] = useState<any[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchAllMatches = async () => {
    try {
      const { data, error } = await supabase
        .from('tournament_matches')
        .select(`
          id, round_number, match_number, status, current_period, clock_seconds_left, clock_is_running,
          team_a_score, team_b_score, team_a_id, team_b_id,
          team_a:team_a_id(team_name),
          team_b:team_b_id(team_name)
        `)
        .order('match_number', { ascending: true });

      if (error) throw error;

      const uniqueMap = new Map();
      (data || []).forEach(m => uniqueMap.set(m.match_number, m));
      setMatches(Array.from(uniqueMap.values()));
      
      if (selectedMatch) {
        const freshData = data?.find(m => m.id === selectedMatch.id);
        if (freshData) setSelectedMatch(freshData);
      }
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAllMatches(); }, []);

  const handleStartMatch = async (matchId: string, matchNum: number) => {
    setActionLoading(true);
    try {
      const { error } = await supabase
        .from('tournament_matches')
        .update({ status: 'live', clock_is_running: true, clock_seconds_left: 720 })
        .eq('id', matchId);

      if (error) throw error;
      await fetchAllMatches();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const scheduledMatches = matches.filter(m => m.status === 'scheduled');
  const liveMatches = matches.filter(m => m.status === 'live');
  const completedMatches = matches.filter(m => m.status === 'completed');

  if (loading) return <div className="p-8 text-xs font-mono text-red-500">LOADING TELEMETRY...</div>;

  return (
    <div className="min-h-screen bg-[#450a0a] text-red-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <header className="border-b border-red-900 pb-4">
          <h1 className="text-2xl font-black tracking-tight text-white uppercase">Baham Sports Control Desk</h1>
          <p className="text-xs text-red-300">Initialize matches, input active scores, and archive tournament brackets.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-6">
            
            {/* LIVE QUEUE */}
            <section className="bg-[#7f1d1d]/40 p-4 rounded-xl border border-yellow-500/20">
              <h2 className="text-xs font-bold text-[#facc15] uppercase tracking-widest mb-3 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#facc15] animate-pulse" /> Live Courtside Logs ({liveMatches.length})
              </h2>
              {liveMatches.length === 0 ? (
                <p className="text-xs text-red-400/50 font-mono">No live games found.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {liveMatches.map(m => (
                    <button 
                      key={m.id} 
                      onClick={() => setSelectedMatch(m)}
                      className={`p-3 bg-[#7f1d1d] border rounded-lg text-left transition ${selectedMatch?.id === m.id ? 'ring-2 ring-[#facc15] border-transparent' : 'border-red-800 hover:border-red-700'}`}
                    >
                      <div className="flex justify-between text-[10px] font-mono text-red-300 mb-1">
                        <span>MATCH #{m.match_number}</span>
                        <span>{m.current_period}</span>
                      </div>
                      <div className="text-xs font-bold truncate text-white">
                        {m.team_a?.team_name || 'TBD'} vs {m.team_b?.team_name || 'TBD'}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </section>

            {/* UPCOMING QUEUE */}
            <section className="bg-[#7f1d1d]/40 p-4 rounded-xl border border-red-900">
              <h2 className="text-xs font-bold text-red-300 uppercase tracking-widest mb-3">Upcoming Matches ({scheduledMatches.length})</h2>
              <div className="space-y-2">
                {scheduledMatches.map(m => (
                  <div key={m.id} className="flex justify-between items-center p-3 bg-[#450a0a] border border-red-800 rounded-lg">
                    <div>
                      <span className="text-[10px] font-mono text-red-400 block">MATCH #{m.match_number} (Round {m.round_number})</span>
                      <span className="text-xs font-semibold text-red-100">
                        {m.team_a?.team_name || 'TBD'} <span className="text-red-700 px-1">vs</span> {m.team_b?.team_name || 'TBD'}
                      </span>
                    </div>
                    <button
                      disabled={actionLoading}
                      onClick={() => handleStartMatch(m.id, m.match_number)}
                      className="text-[11px] font-bold bg-[#facc15] hover:bg-yellow-500 text-[#450a0a] px-3 py-1.5 rounded transition disabled:opacity-50"
                    >
                      Start Match
                    </button>
                  </div>
                ))}
              </div>
            </section>

            {/* COMPLETED QUEUE */}
            <section className="bg-[#7f1d1d]/40 p-4 rounded-xl border border-red-900 opacity-60">
              <h2 className="text-xs font-bold text-red-500 uppercase tracking-widest mb-3">Archived Games ({completedMatches.length})</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {completedMatches.map(m => (
                  <div key={m.id} className="p-2.5 bg-[#450a0a] border border-red-900 rounded-md text-xs font-mono text-red-300 flex justify-between">
                    <span>M#{m.match_number}: {m.team_a?.team_name} vs {m.team_b?.team_name}</span>
                    <span className="font-bold text-white">{m.team_a_score}-{m.team_b_score}</span>
                  </div>
                ))}
              </div>
            </section>

          </div>

          <div>
            {!selectedMatch ? (
              <div className="bg-[#7f1d1d]/50 border border-dashed border-red-800 p-8 rounded-2xl text-center text-xs text-red-300 font-mono">
                Select an active game to mount the real-time scoring desk.
              </div>
            ) : (
              <LiveScoringDesk 
                match={selectedMatch} 
                onRefresh={fetchAllMatches} 
                onClose={() => setSelectedMatch(null)} 
              />
            )}
          </div>

        </div>
      </div>
    </div>
  );
}