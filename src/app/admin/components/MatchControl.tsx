'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function MatchControl({ matches, onUpdate }: { matches: any[], onUpdate: () => void }) {
  const updateMatchStatus = async (id: string, status: string) => {
    await supabase.from('tournament_matches').update({ status }).eq('id', id);
    onUpdate(); // Triggers a re-fetch to update the UI
  };

  return (
    <div className="space-y-4">
      {matches.map((m) => (
        <div key={m.id} className="bg-red-950 p-4 rounded-xl border border-red-800">
          <div className="flex justify-between items-center mb-4">
            <span className="font-black text-amber-500 uppercase">
              {m.team_a?.team_name || 'TBD'} vs {m.team_b?.team_name || 'TBD'}
            </span>
            {/* Status Badge */}
            <span className={`px-2 py-1 text-[10px] font-black rounded ${
              m.status === 'live' ? 'bg-red-500 text-white' : 'bg-gray-700 text-gray-300'
            }`}>
              {m.status?.toUpperCase() || 'SCHEDULED'}
            </span>
          </div>

          <div className="flex gap-2">
            {m.status !== 'live' && (
              <button 
                onClick={() => updateMatchStatus(m.id, 'live')}
                className="flex-1 bg-green-700 py-2 rounded font-black text-xs hover:bg-green-600"
              >
                START GAME
              </button>
            )}
            {m.status === 'live' && (
              <button 
                onClick={() => updateMatchStatus(m.id, 'completed')}
                className="flex-1 bg-red-700 py-2 rounded font-black text-xs hover:bg-red-600"
              >
                END GAME
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}