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
    <div className="min-h-screen bg-[#450a0a] text-red-50 p-4 md:p-8 font-sans">
      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* Header Block */}
        <header className="flex justify-between items-center bg-[#7f1d1d] p-5 rounded-2xl border border-red-800 shadow-xl">
          <div>
            <div className="flex items-center space-x-2 text-xs font-mono text-[#facc15] font-bold uppercase tracking-wider mb-1">
              <span className="w-2 h-2 bg-[#facc15] rounded-full animate-pulse" />
              <span>Live Streams Tracking</span>
            </div>
            <h1 className="text-xl font-black uppercase text-white tracking-tight">Tournament Scoreboard</h1>
          </div>
          <Link href="/" className="text-xs font-mono bg-[#450a0a] border border-red-800 px-3 py-1.5 rounded-xl text-red-300 hover:text-white transition">
            ✕ Close
          </Link>
        </header>

        {/* Live Standings Matrix */}
        <main className="space-y-4">
          {loading ? (
            <p className="text-xs font-mono text-red-400 animate-pulse text-center py-12">CONNECTING TO SCORES MATRIX...</p>
          ) : matches.length === 0 ? (
            <div className="bg-[#7f1d1d]/40 border border-dashed border-red-800 p-12 rounded-2xl text-center">
              <p className="text-xs font-mono text-red-400 uppercase tracking-wider">No matches are actively playing live right now</p>
            </div>
          ) : (
            matches.map((match) => (
              <div key={match.id} className="bg-[#7f1d1d] border border-red-800 rounded-2xl p-4 shadow-md space-y-3">
                <div className="flex justify-between items-center border-b border-red-800/60 pb-2 text-[10px] font-mono text-red-300">
                  <span>ROUND {match.round_number} • MATCH {match.match_number}</span>
                  <span className="text-[#facc15] font-bold uppercase animate-pulse">● LIVE ON COURT</span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center bg-[#450a0a]/40 p-3 rounded-xl border border-red-900">
                    <span className="font-bold text-sm text-white max-w-[70%] truncate uppercase tracking-tight">{match.team_a?.team_name || 'TBD'}</span>
                    <span className="font-mono text-2xl font-black text-[#facc15]">{match.team_a_score}</span>
                  </div>
                  <div className="flex justify-between items-center bg-[#450a0a]/40 p-3 rounded-xl border border-red-900">
                    <span className="font-bold text-sm text-white max-w-[70%] truncate uppercase tracking-tight">{match.team_b?.team_name || 'TBD'}</span>
                    <span className="font-mono text-2xl font-black text-[#facc15]">{match.team_b_score}</span>
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