'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabase/client';
import Link from 'next/link';

interface Booking {
  id: string;
  id_custom: string;
  fullName: string;
  email: string;
  phone: string;
  courtId: number;
  date: string;
  slots: string[];
  receiptUrl: string;
  racketsCount: number;
  totalPrice: number;
  status: 'pending' | 'accepted' | 'rejected';
}

export default function AdminDashboardPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Dashboard database read failure:", error);
      setLoading(false);
      return;
    }

    if (data) {
      const formatted: Booking[] = data.map((b: any) => ({
        id: b.id,
        id_custom: b.id_custom,
        fullName: b.full_name,
        email: b.email,
        phone: b.phone,
        courtId: Number(b.court_id),
        date: b.booking_date,
        slots: b.slots,
        receiptUrl: b.receipt_url,
        racketsCount: Number(b.rackets_count || 0),
        totalPrice: Number(b.total_price || 0),
        status: b.status
      }));
      setBookings(formatted);
      setSelectedBooking((prev) => (prev ? formatted.find(item => item.id === prev.id) || null : null));
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDashboardData();
    const liveChannel = supabase
      .channel('dashboard-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, () => {
        fetchDashboardData();
      })
      .subscribe();
    return () => { supabase.removeChannel(liveChannel); };
  }, []);

  const updateStatus = async (id: string, nextStatus: 'accepted' | 'rejected') => {
    setSelectedBooking(null);
    const { error } = await supabase.from('bookings').update({ status: nextStatus }).eq('id', id);
    if (error) {
      alert(`Database rejected write: ${error.message}`);
      fetchDashboardData();
      return;
    }
    fetchDashboardData();
  };

  const getCourtName = (id: number) => {
    const names: Record<number, string> = { 1: 'Court 1 (Indoor Pro)', 2: 'Court 2 (Indoor Standard)', 3: 'Court 3 (Outdoor Showcourt)', 4: 'Court 4 (Outdoor North)', 5: 'Court 5 (Outdoor South)' };
    return names[id] || `Court Slot ${id}`;
  };

  return (
    <div className="min-h-screen bg-[#450a0a] text-red-50 p-6 md:p-12 relative">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Module Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#7f1d1d] p-6 rounded-2xl border border-red-800 shadow-xl">
          <div>
            <div className="flex items-center space-x-2 text-xs font-mono text-[#facc15] font-bold uppercase tracking-wider mb-1">
              <Link href="/" className="hover:underline text-red-300">Hub Home</Link>
              <span>/</span> <span>Reservations Dashboard</span>
            </div>
            <h1 className="text-xl font-black uppercase tracking-tight text-white">Ops Control Dashboard</h1>
          </div>
          <button onClick={fetchDashboardData} className="px-4 py-2 bg-[#450a0a] hover:bg-red-950 text-xs font-bold rounded-xl border border-red-800 transition-all">🔄 Force Sync</button>
        </div>

        {bookings.length === 0 ? (
          <p className="text-center py-12 text-red-300/50">No active operations files logged.</p>
        ) : (
          <div className="bg-[#7f1d1d] border border-red-800 rounded-2xl overflow-hidden shadow-2xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#450a0a]/60 border-b border-red-800 text-[10px] font-black uppercase tracking-wider text-red-300">
                  <th className="p-4">Reference</th>
                  <th className="p-4">Player Details</th>
                  <th className="p-4">Allocation</th>
                  <th className="p-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-red-900/50">
                {bookings.map((row) => (
                  <tr key={row.id} onClick={() => setSelectedBooking(row)} className={`cursor-pointer transition-colors ${selectedBooking?.id === row.id ? 'bg-[#facc15]/10' : 'hover:bg-[#450a0a]/50'}`}>
                    <td className="p-4 font-mono font-black text-[#facc15]">{row.id_custom}</td>
                    <td className="p-4"><p className="font-bold text-white uppercase">{row.fullName}</p><p className="text-[10px] text-red-300/70">{row.email}</p></td>
                    <td className="p-4 font-bold">{getCourtName(row.courtId)}</td>
                    <td className="p-4 text-right"><span className={`px-2 py-1 rounded text-[9px] font-black uppercase ${row.status === 'accepted' ? 'bg-[#facc15]/10 text-[#facc15]' : 'bg-red-900 text-red-300'}`}>{row.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Sidebar */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex justify-end bg-[#450a0a]/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-[#7f1d1d] border-l border-red-800 h-full p-6 overflow-y-auto">
            <h2 className="text-base font-black uppercase text-white mb-6">Reservation Dossier</h2>
            <div className="bg-[#450a0a] p-4 rounded-xl mb-6 space-y-2">
                <div className="flex justify-between"><span className="text-red-300">Name</span><span className="font-bold">{selectedBooking.fullName}</span></div>
                <div className="flex justify-between"><span className="text-red-300">Total</span><span className="font-bold text-[#facc15]">₱{selectedBooking.totalPrice.toLocaleString()}</span></div>
            </div>
            {selectedBooking.receiptUrl && <img src={selectedBooking.receiptUrl} className="rounded-lg border border-red-800 w-full mb-6" alt="Receipt" />}
            
            <div className="flex gap-3">
              <button onClick={() => updateStatus(selectedBooking.id, 'rejected')} className="flex-1 py-3 bg-red-900 text-red-200 font-bold text-xs uppercase rounded-xl">Deny</button>
              <button onClick={() => updateStatus(selectedBooking.id, 'accepted')} className="flex-1 py-3 bg-[#facc15] text-[#450a0a] font-bold text-xs uppercase rounded-xl">Approve</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}