'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface LiveMatch {
  id: string;
  round_number: number;
  match_number: number;
  team_a_score: number;
  team_b_score: number;
  status: string;
  team_a?: { team_name: string };
  team_b?: { team_name: string };
}

export default function PublicScoreboard() {
  const [matches, setMatches] = useState<LiveMatch[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchScores = async () => {
    const { data } = await supabase
      .from('tournament_matches')
      .select('id, round_number, match_number, team_a_score, team_b_score, status, team_a:team_a_id(team_name), team_b:team_b_id(team_name)')
      .eq('status', 'live')
      .order('match_number', { ascending: true });

    setMatches((data || []).map((m: any) => ({
      ...m,
      team_a: Array.isArray(m.team_a) ? m.team_a[0] : m.team_a,
      team_b: Array.isArray(m.team_b) ? m.team_b[0] : m.team_b,
    })));
    setLoading(false);
  };

  useEffect(() => {
    fetchScores();
    const channel = supabase
      .channel('public-scoreboard')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tournament_matches' }, () => fetchScores())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans">
      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* Header Block */}
        <header className="flex justify-between items-center bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-xl">
          <div>
            <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider mb-1">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
              <span>Live Streams Tracking</span>
            </div>
            <h1 className="text-xl font-black uppercase text-white tracking-tight">Tournament Scoreboard</h1>
          </div>
          <Link href="/" className="text-xs font-mono bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl text-slate-400 hover:text-white transition">
            ✕ Close
          </Link>
        </header>

        {/* Live Standings Matrix */}
        <main className="space-y-4">
          {loading ? (
            <p className="text-xs font-mono text-slate-500 animate-pulse text-center py-12">CONNECTING TO SCORES MATRIX...</p>
          ) : matches.length === 0 ? (
            <div className="bg-slate-900/40 border border-dashed border-slate-800 p-12 rounded-2xl text-center">
              <p className="text-xs font-mono text-slate-500 uppercase tracking-wider">No matches are actively playing live right now</p>
            </div>
          ) : (
            matches.map((match) => (
              <div key={match.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md space-y-3">
                <div className="flex justify-between items-center border-b border-slate-800/60 pb-2 text-[10px] font-mono text-slate-400">
                  <span>ROUND {match.round_number} • MATCH {match.match_number}</span>
                  <span className="text-cyan-400 font-bold uppercase animate-pulse">● LIVE ON COURT</span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center bg-slate-950/40 p-3 rounded-xl border border-slate-850">
                    <span className="font-bold text-sm text-white max-w-[70%] truncate uppercase tracking-tight">{match.team_a?.team_name || 'TBD'}</span>
                    <span className="font-mono text-2xl font-black text-cyan-400">{match.team_a_score}</span>
                  </div>
                  <div className="flex justify-between items-center bg-slate-950/40 p-3 rounded-xl border border-slate-850">
                    <span className="font-bold text-sm text-white max-w-[70%] truncate uppercase tracking-tight">{match.team_b?.team_name || 'TBD'}</span>
                    <span className="font-mono text-2xl font-black text-cyan-400">{match.team_b_score}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </main>

      </div>
    </div>
  );
}