'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function SingleEliminationBracket({ tournamentId }: { tournamentId: string }) {
  const [matches, setMatches] = useState<any[]>([]);

  useEffect(() => {
    const fetchBracket = async () => {
      const { data } = await supabase
        .from('tournament_matches')
        .select(`*, team_a:team_a_id(team_name), team_b:team_b_id(team_name)`)
        .eq('tournament_id', tournamentId)
        .order('match_number', { ascending: true });
      
      if (data) setMatches(data);
    };
    fetchBracket();
  }, [tournamentId]);

  const semis = matches.filter(m => m.round_type === 'semifinal');
  const final = matches.find(m => m.round_type === 'final');

  return (
    <div className="flex flex-col items-center gap-12 py-10">
      {/* Semifinals Row */}
      <div className="flex justify-between w-full max-w-2xl">
        {semis.map((match) => (
          <div key={match.id} className="bg-red-950 p-4 rounded-xl border border-red-900 w-48 text-center">
            <h4 className="text-red-400 text-xs font-black uppercase mb-2">Semifinal</h4>
            <div className="text-white font-bold">{match.team_a?.team_name || 'TBD'}</div>
            <div className="text-amber-500 font-black">vs</div>
            <div className="text-white font-bold">{match.team_b?.team_name || 'TBD'}</div>
          </div>
        ))}
      </div>

      {/* Final Match */}
      <div className="bg-amber-500/10 p-6 rounded-2xl border-2 border-amber-500 w-64 text-center">
        <h4 className="text-amber-500 text-xs font-black uppercase mb-2">Grand Final</h4>
        <div className="text-white font-bold">{final?.team_a?.team_name || 'TBD'}</div>
        <div className="text-amber-500 font-black">vs</div>
        <div className="text-white font-bold">{final?.team_b?.team_name || 'TBD'}</div>
      </div>
    </div>
  );
}