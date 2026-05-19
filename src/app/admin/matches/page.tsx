'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface Match {
  id: string;
  round_number: number;
  match_number: number;
  team_a_id: string | null;
  team_b_id: string | null;
  team_a_score: number;
  team_b_score: number;
  status: string;
  team_a?: { team_name: string } | null;
  team_b?: { team_name: string } | null;
}

export default function MatchScoringDesk() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchMatches = async () => {
    try {
      const { data, error } = await supabase
        .from('tournament_matches')
        .select(`
          id, round_number, match_number, team_a_id, team_b_id, team_a_score, team_b_score, status,
          team_a:team_a_id(team_name), team_b:team_b_id(team_name)
        `)
        .or('status.eq.live,status.eq.scheduled')
        .order('round_number', { ascending: true })
        .order('match_number', { ascending: true });

      if (error) throw error;
      setMatches((data || []).map((m: any) => ({
        ...m,
        team_a: Array.isArray(m.team_a) ? m.team_a[0] : m.team_a,
        team_b: Array.isArray(m.team_b) ? m.team_b[0] : m.team_b,
      })));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMatches(); }, []);

  const adjustScore = async (matchId: string, team: 'a' | 'b', delta: number) => {
    const match = matches.find(m => m.id === matchId);
    if (!match || match.status === 'completed') return;

    const currentScore = team === 'a' ? match.team_a_score : match.team_b_score;
    const nextScore = Math.max(0, currentScore + delta);

    setMatches(prev => prev.map(m => m.id === matchId ? { ...m, [team === 'a' ? 'team_a_score' : 'team_b_score']: nextScore } : m));

    await supabase
      .from('tournament_matches')
      .update({ [team === 'a' ? 'team_a_score' : 'team_b_score']: nextScore })
      .eq('id', matchId);
  };

  const changeStatus = async (matchId: string, nextStatus: string) => {
    setUpdatingId(matchId);
    await supabase.from('tournament_matches').update({ status: nextStatus }).eq('id', matchId);
    await fetchMatches();
    setUpdatingId(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
      <header className="max-w-3xl mx-auto border-b border-slate-800 pb-4 mb-6 flex justify-between items-center">
        <div>
          <span className="text-xs font-mono text-amber-400 font-bold uppercase tracking-wider">Ops Console</span>
          <h1 className="text-xl font-black text-white">Match Scoring Desk</h1>
        </div>
        <Link href="/live" className="text-xs text-cyan-400 border border-cyan-500/20 px-3 py-1.5 rounded-xl bg-cyan-950/20 hover:bg-cyan-900/30 transition">
          View Live TV Monitor →
        </Link>
      </header>

      <main className="max-w-3xl mx-auto space-y-4">
        {loading ? (
          <div className="text-center py-12 font-mono text-xs text-slate-500 animate-pulse">LOADING LIVE MATRIX...</div>
        ) : (
          matches.map(match => (
            <div key={match.id} className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-mono text-slate-500 font-bold block">R{match.round_number} MATCH {match.match_number}</span>
                <span className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded ${match.status === 'live' ? 'bg-cyan-500/10 text-cyan-400' : 'bg-slate-950 text-amber-400'}`}>{match.status}</span>
              </div>

              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between bg-slate-950/40 p-2 rounded-lg text-sm">
                  <span className="truncate">{match.team_a?.team_name || 'TBD'}</span>
                  <div className="flex items-center space-x-2">
                    <button onClick={() => adjustScore(match.id, 'a', -1)} className="w-6 h-6 bg-slate-800 rounded hover:bg-slate-700">-</button>
                    <span className="w-6 text-center font-mono font-bold text-cyan-400">{match.team_a_score}</span>
                    <button onClick={() => adjustScore(match.id, 'a', 1)} className="w-6 h-6 bg-slate-800 rounded hover:bg-slate-700">+</button>
                  </div>
                </div>
                <div className="flex items-center justify-between bg-slate-950/40 p-2 rounded-lg text-sm">
                  <span className="truncate">{match.team_b?.team_name || 'TBD'}</span>
                  <div className="flex items-center space-x-2">
                    <button onClick={() => adjustScore(match.id, 'b', -1)} className="w-6 h-6 bg-slate-800 rounded hover:bg-slate-700">-</button>
                    <span className="w-6 text-center font-mono font-bold text-cyan-400">{match.team_b_score}</span>
                    <button onClick={() => adjustScore(match.id, 'b', 1)} className="w-6 h-6 bg-slate-800 rounded hover:bg-slate-700">+</button>
                  </div>
                </div>
              </div>

              <div className="sm:w-24 flex justify-end">
                {match.status === 'scheduled' && (
                  <button onClick={() => changeStatus(match.id, 'live')} disabled={updatingId !== null} className="w-full text-center bg-cyan-500 text-slate-950 font-bold text-[11px] py-1.5 rounded-lg uppercase tracking-wider">Start</button>
                )}
                {match.status === 'live' && (
                  <button onClick={() => changeStatus(match.id, 'completed')} disabled={updatingId !== null} className="w-full text-center bg-emerald-500 text-slate-950 font-bold text-[11px] py-1.5 rounded-lg uppercase tracking-wider">Finish</button>
                )}
              </div>
            </div>
          ))
        )}
      </main>
    </div>
  );
}