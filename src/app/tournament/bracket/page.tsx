'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../../utils/supabase/client';

interface TeamRelation { team_name: string; }
interface MatchNode {
  id: string; round_number: number; match_number: number;
  team_a_score: number; team_b_score: number; status: string;
  team_a?: TeamRelation | null; team_b?: TeamRelation | null;
}

function TournamentBracket() {
  const [rounds, setRounds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    const { data } = await supabase.from('tournament_matches').select(`
      id, round_number, match_number, team_a_score, team_b_score, status, team_a_id, team_b_id,
      team_a:team_a_id(team_name), team_b:team_b_id(team_name)
    `).order('match_number', { ascending: true });

    const clean = (data || []).map((m: any) => ({
      ...m,
      team_a: Array.isArray(m.team_a) ? m.team_a[0] : m.team_a,
      team_b: Array.isArray(m.team_b) ? m.team_b[0] : m.team_b,
    }));

    setRounds([
      { title: 'QUARTERFINALS', matches: clean.filter((m: any) => m.round_number === 1) },
      { title: 'SEMIFINALS', matches: clean.filter((m: any) => m.round_number === 2) },
      { title: 'CHAMPIONSHIP', matches: clean.filter((m: any) => m.round_number === 3) }
    ]);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  if (loading) return <div className="min-h-screen bg-[#450a0a] flex items-center justify-center text-[#facc15] font-mono">LOADING TELEMETRY...</div>;

  return (
    <div className="min-h-screen bg-[#450a0a] text-red-50 p-6 md:p-10 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header - Updated Branding */}
        <div className="border-b border-red-900 pb-6">
          <h1 className="text-3xl font-black uppercase tracking-tighter text-white">Baham Sports Invitational</h1>
          <p className="text-xs font-mono text-[#facc15] mt-2">● REAL-TIME BRACKET TELEMETRY</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {rounds.map((round, i) => (
            <div key={i} className="space-y-4">
              <h2 className="text-[10px] font-black text-red-400 uppercase tracking-widest">{round.title}</h2>
              {round.matches.map((m: MatchNode) => (
                <div key={m.id} className="bg-[#7f1d1d] border border-red-800 rounded-2xl p-4 hover:border-[#facc15]/30 transition-all">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] font-mono text-red-300/60 uppercase">Match #{m.match_number}</span>
                    {m.status === 'live' && <span className="text-[9px] font-bold text-[#facc15] animate-pulse uppercase">Live</span>}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm font-bold">
                      <span className="text-white">{m.team_a?.team_name || 'TBD'}</span>
                      <span className="font-mono text-[#facc15]">{m.team_a_score}</span>
                    </div>
                    <div className="flex justify-between text-sm font-bold">
                      <span className="text-white">{m.team_b?.team_name || 'TBD'}</span>
                      <span className="font-mono text-[#facc15]">{m.team_b_score}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default TournamentBracket;