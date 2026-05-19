'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../../utils/supabase/client';

interface MatchNode {
  id: string;
  round_number: number;
  match_number: number;
  team_a_score: number;
  team_b_score: number;
  status: string;
  team_a?: any; // Loosened to prevent deep nesting array errors
  team_b?: any;
}

interface BracketRound {
  title: string;
  matches: MatchNode[];
}
function TournamentBracket() {
  const [rounds, setRounds] = useState<BracketRound[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLiveBracketData = async () => {
    try {
      // Fetch matches and perform a relational join to pull team profile names
      const { data, error } = await supabase
        .from('tournament_matches')
        .select(`
          id, round_number, match_number, team_a_score, team_b_score, status,
          team_a:team_a_id(team_name),
          team_b:team_b_id(team_name)
        `)
        .order('match_number', { ascending: true });

      if (error) throw error;

      const dbMatches = data || [];

      // Organize matches structurally into their corresponding rounds
      const structuralRounds: BracketRound[] = [
        { title: 'Quarterfinals (Round 1)', matches: dbMatches.filter(m => m.round_number === 1) },
        { title: 'Semifinals (Round 2)', matches: dbMatches.filter(m => m.round_number === 2) },
        { title: 'Championship (Round 3)', matches: dbMatches.filter(m => m.round_number === 3) }
      ];

      setRounds(structuralRounds);
    } catch (error) {
      console.error('Error fetching bracket:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveBracketData();

    // Corrected explicit configuration object assignments for the real-time stream
    const channel = supabase
      .channel('live-bracket-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tournament_matches'
        },
        () => {
          fetchLiveBracketData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-400 flex items-center justify-center text-sm font-medium animate-pulse">
        Fetching real-time Baham Sports match parameters...
      </div>
    );
  }

  // Handle scenario where bracket button hasn't been clicked yet
  const hasMatches = rounds.some(r => r.matches.length > 0);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 overflow-x-auto selection:bg-emerald-500/30">
      <div className="max-w-7xl mx-auto min-w-[1000px]">
        
        <div className="mb-12 text-center lg:text-left border-b border-slate-900 pb-6">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full">
            Official Live Tree
          </span>
          <h1 className="text-3xl font-black tracking-tight mt-2 text-white">Baham Sports Invitational</h1>
          <p className="text-sm text-slate-400 mt-1">Single elimination framework platform. Real-time court scoring updates.</p>
        </div>

        {!hasMatches ? (
          <div className="text-center p-16 border border-dashed border-slate-800 rounded-2xl max-w-md mx-auto mt-12">
            <p className="text-sm text-slate-400 font-medium">Tournament bracket has not been generated yet.</p>
            <p className="text-xs text-slate-600 mt-1">Once the administrator closes registration and seeds the pool, the tree will render automatically.</p>
          </div>
        ) : (
          <div className="flex justify-between items-center gap-8 px-4">
            {rounds.map((round, roundIndex) => (
              <div key={roundIndex} className="flex-1 flex flex-col justify-around h-[550px] min-w-[260px]">
                
                <div className="text-center mb-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500 bg-slate-900/50 py-1.5 border border-slate-800/60 rounded-md">
                    {round.title}
                  </p>
                </div>

                <div className="flex-1 flex flex-col justify-around">
                  {round.matches.map((match) => (
                    <div 
                      key={match.id} 
                      className={`bg-slate-900 border rounded-xl overflow-hidden shadow-lg transition-all ${
                        match.status === 'live' ? 'border-emerald-500 ring-1 ring-emerald-500/20' : 'border-slate-800'
                      }`}
                    >
                      {match.status === 'live' && (
                        <div className="bg-emerald-500 text-slate-950 text-[10px] font-black uppercase tracking-widest text-center py-0.5 animate-pulse">
                          • Match Live on Court
                        </div>
                      )}

                      <div className="divide-y divide-slate-800/50">
                        {/* Team Row A */}
                        <div className="flex justify-between items-center px-4 py-2.5 bg-slate-900/40">
                          <span className="text-xs font-semibold text-slate-200">
                            {match.team_a?.team_name || 'TBD'}
                          </span>
                          <span className="bg-slate-950 px-2 py-0.5 rounded text-xs font-mono font-bold text-slate-400 border border-slate-800">
                            {match.team_a_score}
                          </span>
                        </div>

                        {/* Team Row B */}
                        <div className="flex justify-between items-center px-4 py-2.5 bg-slate-900/40">
                          <span className="text-xs font-semibold text-slate-200">
                            {match.team_b?.team_name || 'TBD'}
                          </span>
                          <span className="bg-slate-950 px-2 py-0.5 rounded text-xs font-mono font-bold text-slate-400 border border-slate-800">
                            {match.team_b_score}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Handle empty nodes for future placeholder rounds */}
                  {round.matches.length === 0 && roundIndex === 1 && (
                    <>
                      <div className="bg-slate-900/20 border border-dashed border-slate-800/40 h-16 rounded-xl flex items-center justify-center text-xs text-slate-600">Waiting for Semifinalists</div>
                      <div className="bg-slate-900/20 border border-dashed border-slate-800/40 h-16 rounded-xl flex items-center justify-center text-xs text-slate-600">Waiting for Semifinalists</div>
                    </>
                  )}
                  {round.matches.length === 0 && roundIndex === 2 && (
                    <div className="bg-slate-900/20 border border-dashed border-slate-800/40 h-16 rounded-xl flex items-center justify-center text-xs text-slate-600">Waiting for Finalists</div>
                  )}
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default TournamentBracket;