'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function ManageTournaments() {
  const [tournaments, setTournaments] = useState<any[]>([]);

  useEffect(() => {
    const fetchTournaments = async () => {
      const { data } = await supabase.from('tournaments').select('*');
      if (data) setTournaments(data);
    };
    fetchTournaments();
  }, []);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-amber-500">Tournament List</h2>
      <Link href="/admin/tournaments/create" className="inline-block bg-red-900 px-4 py-2 rounded text-sm text-white hover:bg-red-800">
        + Create New Tournament
      </Link>
      
      <div className="grid gap-2">
        {tournaments.map((t) => (
          <div key={t.id} className="p-4 bg-red-900/50 rounded flex justify-between items-center border border-red-800">
            <div>
              <p className="font-bold">{t.title}</p>
              <p className="text-xs text-red-300">Sport: {t.sport}</p>
            </div>
            <Link href={`/admin/tournaments/${t.id}`} className="bg-amber-500 text-black px-3 py-1 rounded text-sm font-bold">
              Manage
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}