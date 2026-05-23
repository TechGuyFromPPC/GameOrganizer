'use client';

import { useEffect, useState, useRef } from 'react';
import { supabase } from '../utils/supabase/client';

interface LiveScoringDeskProps {
  match: any;
  onRefresh: () => Promise<void>;
  onClose: () => void;
}

export default function LiveScoringDesk({ match, onRefresh, onClose }: LiveScoringDeskProps) {
  const [scoreA, setScoreA] = useState(match.team_a_score || 0);
  const [scoreB, setScoreB] = useState(match.team_b_score || 0);
  const [secondsLeft, setSecondsLeft] = useState(match.clock_seconds_left ?? 720);
  const [isRunning, setIsRunning] = useState(match.clock_is_running || false);
  const [period, setPeriod] = useState(match.current_period || 'Q1');
  const [updating, setUpdating] = useState(false);

  const clockRef = useRef<NodeJS.Timeout | null>(null);

  // Sync state whenever a new match row context is injected
  useEffect(() => {
    setScoreA(match.team_a_score || 0);
    setScoreB(match.team_b_score || 0);
    setSecondsLeft(match.clock_seconds_left ?? 720);
    setIsRunning(match.clock_is_running || false);
    setPeriod(match.current_period || 'Q1');
  }, [match]);

  // ⏱️ Countdown Clock Processing Interval Loops
 // ⏱️ Countdown Clock Processing Interval Loops
useEffect(() => {
  if (isRunning && secondsLeft > 0) {
    clockRef.current = setInterval(() => {
      // 💡 Explicitly type 'prev' as a number to satisfy the compiler
      setSecondsLeft((prev: number) => {
        const nextValue = prev - 1;
        // Sync second drops to Supabase every 5 seconds to reduce API strain
        if (nextValue % 5 === 0 || nextValue === 0) {
          supabase
            .from('tournament_matches')
            .update({ clock_seconds_left: nextValue })
            .eq('id', match.id)
            .then();
        }
        return nextValue;
      });
    }, 1000);
  } else {
    if (clockRef.current) clearInterval(clockRef.current);
  }

  return () => { if (clockRef.current) clearInterval(clockRef.current); };
}, [isRunning, secondsLeft, match.id]);

  // Helper method to format time integers to an explicit MM:SS clock layout
  const formatTime = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 📡 Persistent Database Mutations
  const updateMatchField = async (fields: Record<string, any>) => {
    const { error } = await supabase.from('tournament_matches').update(fields).eq('id', match.id);
    if (error) console.error('Failing to sync live frame modifications:', error);
  };

  const changeScore = (team: 'a' | 'b', delta: number) => {
    if (team === 'a') {
      const next = Math.max(0, scoreA + delta);
      setScoreA(next);
      updateMatchField({ team_a_score: next });
    } else {
      const next = Math.max(0, scoreB + delta);
      setScoreB(next);
      updateMatchField({ team_b_score: next });
    }
  };

  const toggleClock = () => {
    const nextState = !isRunning;
    setIsRunning(nextState);
    updateMatchField({ clock_is_running: nextState, clock_seconds_left: secondsLeft });
  };

  const resetClock = () => {
    setIsRunning(false);
    setSecondsLeft(720);
    updateMatchField({ clock_is_running: false, clock_seconds_left: 720 });
  };

  // 🏁 Archive final values & progress the next bracket tier links
  const handleFinalizeAndArchive = async () => {
    if (scoreA === scoreB) {
      alert("Match can't end in a tie. Please resolve via overtime metrics.");
      return;
    }
    if (!confirm('Finalize and archive this match permanently? This will update the bracket.')) return;

    setUpdating(true);
    const winnerId = scoreA > scoreB ? match.team_a_id : match.team_b_id;
    const currentNum = match.match_number;

    try {
      // 1. Mark active match row closed
      const { error: closeError } = await supabase
        .from('tournament_matches')
        .update({ status: 'completed', clock_is_running: false, clock_seconds_left: secondsLeft })
        .eq('id', match.id);

      if (closeError) throw closeError;

      // 2. Map winning references to next round rows
      let nextMatchNumber = 0;
      let assignmentSlot: 'team_a_id' | 'team_b_id' = 'team_a_id';

      if (currentNum === 1 || currentNum === 2) {
        nextMatchNumber = 5;
        assignmentSlot = currentNum === 1 ? 'team_a_id' : 'team_b_id';
      } else if (currentNum === 3 || currentNum === 4) {
        nextMatchNumber = 6;
        assignmentSlot = currentNum === 3 ? 'team_a_id' : 'team_b_id';
      } else if (currentNum === 5 || currentNum === 6) {
        nextMatchNumber = 7;
        assignmentSlot = currentNum === 5 ? 'team_a_id' : 'team_b_id';
      }

      if (nextMatchNumber > 0) {
        await supabase
          .from('tournament_matches')
          .update({ [assignmentSlot]: winnerId })
          .eq('match_number', nextMatchNumber);
      }

      await onRefresh();
      onClose();
      alert('Match safely archived. Brackets systematically updated.');
    } catch (err: any) {
      alert(`Error closing match: ${err.message}`);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl h-fit space-y-6 shadow-2xl relative overflow-hidden">
      
      {/* GLOWING AMBIENT STATUS DOT */}
      <div className="flex justify-between items-center border-b border-slate-800 pb-3">
        <div>
          <h2 className="text-sm font-black uppercase text-white tracking-tight">Courtside Scoring Desk</h2>
          <span className="text-[10px] font-mono text-slate-500">MATCH #{match.match_number} FRAME CONTROLLER</span>
        </div>
        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${isRunning ? 'bg-red-500/10 text-red-400 animate-pulse' : 'bg-slate-800 text-slate-400'}`}>
          {isRunning ? '● TRANSMITTING' : '⏸ CLOCK PAUSED'}
        </span>
      </div>

      {/* ⏱️ REALTIME BROADCAST GAME CLOCK ENGINE */}
      <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 text-center space-y-3">
        <div className="text-4xl font-black font-mono tracking-widest text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.2)]">
          {formatTime(secondsLeft)}
        </div>
        
        <div className="flex justify-center items-center gap-3">
          <select 
            value={period} 
            onChange={(e) => { setPeriod(e.target.value); updateMatchField({ current_period: e.target.value }); }}
            className="bg-slate-900 border border-slate-800 text-xs text-slate-300 px-2 py-1 rounded font-mono focus:outline-none"
          >
            {['Q1', 'Q2', 'Q3', 'Q4', 'OT1', 'OT2'].map(p => <option key={p} value={p}>{p}</option>)}
          </select>

          <button 
            onClick={toggleClock} 
            className={`px-4 py-1 rounded text-xs font-bold transition ${isRunning ? 'bg-amber-600 hover:bg-amber-500 text-white' : 'bg-emerald-600 hover:bg-emerald-500 text-white'}`}
          >
            {isRunning ? 'Pause Clock' : 'Start Clock'}
          </button>

          <button onClick={resetClock} className="px-2 py-1 bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded text-[11px] font-mono text-slate-400">
            Reset
          </button>
        </div>
      </div>

      {/* ITEMISED POINTS INJECTORS */}
      <div className="space-y-3">
        {/* TEAM A SCORING PACK */}
        <div className="bg-slate-950 p-3 rounded-xl border border-slate-850 flex items-center justify-between">
          <div className="max-w-[110px] truncate"><span className="text-xs font-bold text-slate-200">{match.team_a?.team_name || 'TBD'}</span></div>
          <div className="flex items-center gap-3">
            <span className="text-2xl font-black font-mono text-white min-w-[32px] text-center">{scoreA}</span>
            <div className="flex gap-1">
              <button onClick={() => changeScore('a', -1)} className="px-1.5 py-0.5 bg-slate-900 text-slate-500 border border-slate-800 rounded text-xs hover:text-slate-300">-1</button>
              <button onClick={() => changeScore('a', 1)} className="px-2 py-0.5 bg-slate-800 text-slate-200 rounded text-xs font-bold hover:bg-slate-700">+1</button>
              <button onClick={() => changeScore('a', 2)} className="px-2 py-0.5 bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 rounded text-xs font-bold hover:bg-emerald-600/40">+2</button>
            </div>
          </div>
        </div>

        {/* TEAM B SCORING PACK */}
        <div className="bg-slate-950 p-3 rounded-xl border border-slate-850 flex items-center justify-between">
          <div className="max-w-[110px] truncate"><span className="text-xs font-bold text-slate-200">{match.team_b?.team_name || 'TBD'}</span></div>
          <div className="flex items-center gap-3">
            <span className="text-2xl font-black font-mono text-white min-w-[32px] text-center">{scoreB}</span>
            <div className="flex gap-1">
              <button onClick={() => changeScore('b', -1)} className="px-1.5 py-0.5 bg-slate-900 text-slate-500 border border-slate-800 rounded text-xs hover:text-slate-300">-1</button>
              <button onClick={() => changeScore('b', 1)} className="px-2 py-0.5 bg-slate-800 text-slate-200 rounded text-xs font-bold hover:bg-slate-700">+1</button>
              <button onClick={() => changeScore('b', 2)} className="px-2 py-0.5 bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 rounded text-xs font-bold hover:bg-emerald-600/40">+2</button>
            </div>
          </div>
        </div>
      </div>

      {/* FINAL ARCHIVE TRIGGER */}
      <button
        disabled={updating}
        onClick={handleFinalizeAndArchive}
        className="w-full py-2.5 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition shadow-lg disabled:opacity-50"
      >
        {updating ? 'Processing Bracket Update...' : 'Finish Match & Archive'}
      </button>

    </div>
  );
}