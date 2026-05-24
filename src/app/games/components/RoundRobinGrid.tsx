'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function RoundRobinGrid({ tournamentId }: { tournamentId: string }) {
  const [teams, setTeams] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      // 1. Fetch all teams for this tournament
      const { data: teamData } = await supabase
        .from('teams')
        .select('*')
        .eq('tournament_id', tournamentId);
      
      // 2. Fetch all matches
      const { data: matchData } = await supabase
        .from('tournament_matches')
        .select('*')
        .eq('tournament_id', tournamentId);
      
      if (teamData) setTeams(teamData);
      if (matchData) setMatches(matchData);
    };
    fetchData();
  }, [tournamentId]);

  // Helper to find a match between two specific teams
  const getResult = (teamAId: string, teamBId: string) => {
    return matches.find(m => 
      (m.team_a_id === teamAId && m.team_b_id === teamBId) || 
      (m.team_a_id === teamBId && m.team_b_id === teamAId)
    );
  };

  return (
    <div className="overflow-x-auto p-4">
      <table className="w-full text-center border-collapse">
        <thead>
          <tr>
            <th className="p-3 border border-red-900 text-amber-500">Team</th>
            {teams.map(t => (
              <th key={t.id} className="p-3 border border-red-900 text-white text-xs">{t.team_name}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {teams.map(rowTeam => (
            <tr key={rowTeam.id}>
              <td className="p-3 border border-red-900 text-white font-bold">{rowTeam.team_name}</td>
              {teams.map(colTeam => {
                const match = getResult(rowTeam.id, colTeam.id);
                return (
                  <td key={colTeam.id} className="p-3 border border-red-900 text-red-300">
                    {rowTeam.id === colTeam.id ? '-' : (match ? `${match.team_a_score}-${match.team_b_score}` : 'vs')}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}