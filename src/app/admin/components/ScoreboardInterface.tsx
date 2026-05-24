// FILE: src/app/admin/components/ScoreboardInterface.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import Digit from './Digit';

interface MatchData {
  id: string;
  team_a: { team_name: string };
  team_b: { team_name: string };
  team_a_score: number;
  team_b_score: number;
  timer_minutes: number;
  timer_seconds: number;
  status: string;
  period: string;
  fouls_a: number;
  fouls_b: number;
  timeouts_a: number;
  timeouts_b: number;
}

const ScoreboardInterface = ({ matchId }: { matchId: string }) => {
  const [matchData, setMatchData] = useState<MatchData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timerRunning, setTimerRunning] = useState(false);
  const [shotClock, setShotClock] = useState(24);

  // --- Fetch and Update Functions ---

  const fetchMatch = useCallback(async () => {
    const { data, error } = await supabase
      .from('tournament_matches')
      .select('*, team_a:team_a_id(team_name), team_b:team_b_id(team_name)')
      .eq('id', matchId)
      .single();

    if (data) {
      setMatchData(data);
      // Synchronize timer and shot clock state with database if needed.
    }
   setLoading(false);
  }, [matchId]);

  const updateMatch = async (updates: Partial<MatchData>) => {
    // Optimistically update local state for immediate visual feedback
    if (matchData) {
        setMatchData({ ...matchData, ...updates });
    }
    
    // Asynchronously push to database
    await supabase.from('tournament_matches').update(updates).eq('id', matchId);
    // onUpdate(); // We don't need a heavy refetch here as we are doing it locally.
  };

  // --- Game State Logic ---

  // Start/Pause Timer
  const toggleTimer = () => {
    const isNowRunning = !timerRunning;
    setTimerRunning(isNowRunning);
    // Also update database state for 'is_paused' if we track that.
  };

  // Main Game Timer and Shot Clock Loop
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (timerRunning && matchData) {
      interval = setInterval(() => {
        // --- 1. Decrement Shot Clock ---
        setShotClock((prev) => {
          if (prev <= 1) return 24; // Auto-reset for demo. In practice, requires input.
          return prev - 1;
        });

        // --- 2. Decrement Main Timer ---
        let { timer_minutes, timer_seconds } = matchData;

        if (timer_seconds > 0) {
          timer_seconds -= 1;
        } else if (timer_minutes > 0) {
          timer_minutes -= 1;
          timer_seconds = 59;
        } else {
          // Time is up! 0:00. End game or period.
          setTimerRunning(false);
          // updateMatch({ status: 'completed' }); // Example action
        }

        updateMatch({ timer_minutes, timer_seconds });

      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerRunning, matchData, updateMatch]);

  // Handle Score/Foul Changes
  const adjustValue = (field: keyof MatchData, increment: number, min = 0, max = Infinity) => {
    if (!matchData) return;
    
    const currentValue = matchData[field] as number;
    const newValue = Math.max(min, Math.min(max, currentValue + increment));
    
    updateMatch({ [field]: newValue });
  };

  // Reset Shot Clock
  const resetShotClock = () => {
    setShotClock(24);
  };

  // --- Data Loading State ---

  useEffect(() => {
    fetchMatch();
  }, [fetchMatch]);

  if (loading) return <div className="text-white">Loading Interface...</div>;
  if (!matchData) return <div className="text-white">Match data not found.</div>;

  // --- Component Styling / Class Mapping ---
  // Define custom styles for digits based on their role
  const teamDigitProps = { color: '#0FF' }; // Cyan for teams
  const shotClockDigitProps = { color: '#F00' }; // Red for shot clock

  return (
    <div className="w-full h-full bg-[#111] p-4 font-mono select-none text-white rounded-lg flex flex-col justify-between"
         style={{ maxHeight: '80vh', aspectRatio: '1.618/1' }}>
      
      {/* 1. TOP SECTION: Time, Status, tapping area for Start/Stop */}
      <div className="relative w-full h-[30%] bg-[#1a1a1a] rounded flex items-center justify-center cursor-pointer p-4 group"
           onClick={toggleTimer}>
        <span className="absolute top-2 left-4 text-xs font-black uppercase text-amber-500">Tap to {timerRunning ? 'PAUSE' : 'START'}</span>
        
        {/* Main Timer Display */}
        <div className="flex gap-2 h-[80%] aspect-[4/3]">
          <Digit digit={matchData.timer_minutes} />
          <Digit digit=":" />
          <Digit digit={Math.floor(matchData.timer_seconds / 10)} />
          <Digit digit={matchData.timer_seconds % 10} />
        </div>

        {/* Start/Pause Overlay (optional feedback on hover) */}
        <div className={`absolute inset-0 bg-green-500/10 flex items-center justify-center font-black transition-opacity ${timerRunning ? 'opacity-0' : 'opacity-0 group-hover:opacity-100'}`}>
          PAUSED
        </div>
      </div>

      {/* 2. MIDDLE SECTION: Scores, Shot Clock, Period */}
      <div className="w-full flex-grow flex justify-between gap-4 p-2">
        
        {/* HOME Team controls and display */}
        <div className="flex-1 bg-[#1a1a1a] p-4 rounded flex flex-col items-center justify-between gap-2">
          <span className="font-black text-amber-500 truncate w-full text-center">{matchData.team_a.team_name}</span>
          <div className="flex gap-2 h-[60%] cursor-pointer" onClick={() => adjustValue('team_a_score', 2)} onContextMenu={(e) => { e.preventDefault(); adjustValue('team_a_score', -1); }}>
              <Digit digit={Math.floor(matchData.team_a_score / 10)} {...teamDigitProps} />
              <Digit digit={matchData.team_a_score % 10} {...teamDigitProps} />
          </div>
          <div className="flex gap-2 w-full text-center text-amber-400 font-bold">
            Adjust Score:
            <span onClick={() => adjustValue('team_a_score', 1)} className="p-1 px-2 border border-amber-500 rounded cursor-pointer hover:bg-amber-900">+1</span>
            <span onClick={() => adjustValue('team_a_score', -1)} className="p-1 px-2 border border-amber-500 rounded cursor-pointer hover:bg-amber-900">-1</span>
          </div>
        </div>

        {/* CENTRAL controls: Shot Clock and Period */}
        <div className="w-[30%] flex flex-col gap-2 p-2 justify-center items-center">
            
            {/* Shot Clock (tapping resets) */}
            <div className="flex gap-2 h-[50%] aspect-[3/2] bg-[#222] p-2 rounded-lg cursor-pointer" onClick={resetShotClock}>
              <Digit digit={Math.floor(shotClock / 10)} {...shotClockDigitProps}/>
              <Digit digit={shotClock % 10} {...shotClockDigitProps}/>
            </div>
            
            {/* Period (tapping changes, cycling through 1-4, OT) */}
            <div className="w-full flex-1 flex flex-col items-center justify-center gap-1 bg-[#222] p-2 rounded cursor-pointer" 
                onClick={() => {
                  const periods = ['1','2','3','4','OT'];
                  const nextIndex = (periods.indexOf(matchData.period) + 1) % periods.length;
                  updateMatch({ period: periods[nextIndex] });
                }}>
                <label className="text-[10px] text-amber-300 font-bold uppercase">PERIOD</label>
                <div className="font-bold text-4xl text-blue-500 px-4 py-1 bg-black rounded font-mono">{matchData.period}</div>
            </div>

        </div>

        {/* AWAY Team controls and display (mirrors Home) */}
        <div className="flex-1 bg-[#1a1a1a] p-4 rounded flex flex-col items-center justify-between gap-2">
          <span className="font-black text-amber-500 truncate w-full text-center">{matchData.team_b.team_name}</span>
          <div className="flex gap-2 h-[60%] cursor-pointer" onClick={() => adjustValue('team_b_score', 2)} onContextMenu={(e) => { e.preventDefault(); adjustValue('team_b_score', -1); }}>
              <Digit digit={Math.floor(matchData.team_b_score / 10)} {...teamDigitProps} />
              <Digit digit={matchData.team_b_score % 10} {...teamDigitProps} />
          </div>
          <div className="flex gap-2 w-full text-center text-amber-400 font-bold">
            Adjust Score:
            <span onClick={() => adjustValue('team_b_score', 1)} className="p-1 px-2 border border-amber-500 rounded cursor-pointer hover:bg-amber-900">+1</span>
            <span onClick={() => adjustValue('team_b_score', -1)} className="p-1 px-2 border border-amber-500 rounded cursor-pointer hover:bg-amber-900">-1</span>
          </div>
        </div>

      </div>

      {/* 3. BOTTOM SECTION: Fouls and Timeouts for both teams */}
      <div className="w-full h-[15%] bg-[#1a1a1a] rounded flex gap-4 p-2 px-8">
        
        {/* Home Side stats */}
        <div className="flex-grow flex gap-4 items-center justify-start">
            <div className="flex gap-2 items-center text-red-500">
                <label className="text-xs uppercase font-bold text-amber-400">FOULS</label>
                <div className="w-12 h-12 flex items-center justify-center font-bold text-xl bg-[#222] p-1 px-3 rounded cursor-pointer" 
                    onClick={() => adjustValue('fouls_a', 1)}>
                    {matchData.fouls_a}
                </div>
            </div>
            <div className="flex gap-2 items-center text-amber-500">
                <label className="text-xs uppercase font-bold text-amber-400">TIMEOUTS</label>
                <div className="w-12 h-12 flex items-center justify-center font-bold text-xl bg-[#222] p-1 px-3 rounded cursor-pointer" 
                    onClick={() => adjustValue('timeouts_a', -1, 0)}>
                    {matchData.timeouts_a}
                </div>
            </div>
        </div>

        {/* Away Side stats (mirrors Home) */}
        <div className="flex-grow flex gap-4 items-center justify-end">
             <div className="flex gap-2 items-center text-amber-500">
                <label className="text-xs uppercase font-bold text-amber-400">TIMEOUTS</label>
                <div className="w-12 h-12 flex items-center justify-center font-bold text-xl bg-[#222] p-1 px-3 rounded cursor-pointer" 
                    onClick={() => adjustValue('timeouts_b', -1, 0)}>
                    {matchData.timeouts_b}
                </div>
            </div>
            <div className="flex gap-2 items-center text-red-500">
                <label className="text-xs uppercase font-bold text-amber-400">FOULS</label>
                <div className="w-12 h-12 flex items-center justify-center font-bold text-xl bg-[#222] p-1 px-3 rounded cursor-pointer" 
                    onClick={() => adjustValue('fouls_b', 1)}>
                    {matchData.fouls_b}
                </div>
            </div>
        </div>

      </div>

    </div>
  );
};

export default ScoreboardInterface;