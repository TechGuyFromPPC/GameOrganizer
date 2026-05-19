'use client';

import { useState } from 'react';
import { supabase } from '../../../utils/supabase/client';

// 1. Declare the component clearly as a standard function
function TournamentRegister() {
  const [teamName, setTeamName] = useState('');
  const [player1, setPlayer1] = useState('');
  const [player2, setPlayer2] = useState('');
  const [contact, setContact] = useState('');
  const [uploading, setUploading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    try {
      const { error } = await supabase
        .from('tournament_teams')
        .insert([
          {
            tournament_id: null,
            team_name: teamName,
            player_1_name: player1,
            player_2_name: player2,
            contact_number: contact,
            payment_status: 'pending'
          }
        ]);

      if (error) throw error;
      setSubmitted(true);
    } catch (error) {
      console.error('Registration Error:', error);
      alert('Something went wrong. Please check your connection and try again.');
    } finally {
      setUploading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mb-4 text-2xl font-bold">✓</div>
        <h2 className="text-2xl font-bold mb-2">Registration Submitted!</h2>
        <p className="text-slate-400 max-w-sm text-sm">
          Your entry is now pending review. The Baham Sports committee will verify your GCash transfer shortly.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 flex items-center justify-center">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="mb-6">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full">Official Registration</span>
          <h1 className="text-2xl font-black tracking-tight mt-2 text-white">Tournament Entry Form</h1>
          <p className="text-xs text-slate-400 mt-1">Fill out your team parameters to reserve your spot in the bracket.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Team Identity Name</label>
            <input 
              type="text" required placeholder="e.g., PPC Dinker Kings"
              value={teamName} onChange={(e) => setTeamName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Player 1 (Captain)</label>
              <input 
                type="text" required placeholder="Full Name"
                value={player1} onChange={(e) => setPlayer1(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Player 2 (Partner)</label>
              <input 
                type="text" required placeholder="Full Name"
                value={player2} onChange={(e) => setPlayer2(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Primary Contact Number</label>
            <input 
              type="tel" required placeholder="e.g., 0917XXXXXXX"
              value={contact} onChange={(e) => setContact(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          <div className="border border-dashed border-slate-800 rounded-xl p-4 bg-slate-950/50 text-center">
            <p className="text-xs font-bold text-slate-300">Registration Fee: ₱500 / Team</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Please send via GCash to 0912-345-6789 (Juan D.)</p>
            <div className="mt-3 bg-slate-900 border border-slate-800 py-2 px-3 rounded-lg text-xs text-slate-400 cursor-not-allowed">
              📸 Upload Receipt Feature Coming Next
            </div>
          </div>

          <button 
            type="submit" disabled={uploading}
            className="w-full bg-emerald-500 hover:bg-emerald-600 active:scale-[0.99] disabled:opacity-50 text-slate-950 font-bold text-sm py-2.5 rounded-lg shadow-lg shadow-emerald-500/10 transition-all"
          >
            {uploading ? 'Processing Entry...' : 'Complete Registration'}
          </button>
        </form>
      </div>
    </div>
  );
}

// 2. Explicitly export it as the default target at the very end
export default TournamentRegister;