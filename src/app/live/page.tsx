'use client';

import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../utils/supabase/client';

interface Booking {
  id: string;
  fullName: string;
  courtId: number;
  date: string;
  slots: string[];
  status: 'pending' | 'accepted' | 'rejected';
}

export default function LiveCourtsPage() {
  const [currentCalendarDate, setCurrentCalendarDate] = useState(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  const currentYear = currentCalendarDate.getFullYear();
  const currentMonth = currentCalendarDate.getMonth();

  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) days.push(null);
    for (let day = 1; day <= daysInMonth; day++) days.push(new Date(currentYear, currentMonth, day));
    return days;
  }, [currentYear, currentMonth]);

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    const fetchLiveDatabaseBookings = async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select('id_custom, full_name, court_id, booking_date, slots, status')
        .eq('booking_date', selectedDateStr)
        .not('status', 'eq', 'rejected');

      if (error) return;
      if (data) {
        setBookings(data.map((b: any) => ({
          id: b.id_custom,
          fullName: b.full_name,
          courtId: Number(b.court_id),
          date: b.booking_date,
          slots: b.slots,
          status: b.status
        })));
      }
    };

    fetchLiveDatabaseBookings();
    const liveChannel = supabase.channel('live-monitor-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, fetchLiveDatabaseBookings)
      .subscribe();

    return () => { supabase.removeChannel(liveChannel); };
  }, [selectedDateStr]);

  const courts = [
    { id: 1, name: 'Court 1', icon: '💎 Indoor' }, { id: 2, name: 'Court 2', icon: '💎 Indoor' },
    { id: 3, name: 'Court 3', icon: '☀️ Outdoor' }, { id: 4, name: 'Court 4', icon: '☀️ Outdoor' },
    { id: 5, name: 'Court 5', icon: '☀️ Outdoor' }
  ];

  const timeSlots = ['6:00 AM', '7:00 AM', '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM', '7:00 PM', '8:00 PM', '9:00 PM'];

  return (
    <div className="min-h-screen bg-[#450a0a] text-red-50 antialiased pb-24">
      <header className="border-b border-red-800 bg-[#7f1d1d] px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <span className="bg-[#facc15] text-[#450a0a] p-2 rounded-xl font-black text-sm">📊</span>
          <div>
            <h1 className="font-black text-base text-white uppercase">Live Court Monitor</h1>
            <p className="text-[10px] font-bold text-red-300">Realtime Occupancy System</p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-[10px] font-bold uppercase bg-[#450a0a] p-2 rounded-xl border border-red-800">
          <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-[#facc15] block"></span><span>Open</span></div>
          <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-red-400 block"></span><span>Booked</span></div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 mt-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 bg-[#7f1d1d] border border-red-800 p-5 rounded-2xl shadow-xl">
          <h3 className="text-xs font-black uppercase text-red-300 mb-4">Select Date</h3>
          <p className="text-sm font-bold text-[#facc15] bg-[#450a0a] border border-red-800 rounded-xl p-2.5 text-center mb-4">
            {monthNames[currentMonth]} {currentYear}
          </p>
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((dateObj, idx) => {
              if (!dateObj) return <div key={idx} />;
              const dateString = dateObj.toISOString().split('T')[0];
              const isSelected = selectedDateStr === dateString;
              return (
                <button key={dateString} onClick={() => setSelectedDateStr(dateString)} 
                  className={`h-8 rounded-lg text-xs font-bold ${isSelected ? 'bg-[#facc15] text-[#450a0a]' : 'bg-[#450a0a] hover:bg-red-950'}`}>
                  {dateObj.getDate()}
                </button>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-3 overflow-x-auto bg-[#7f1d1d]/20 border border-red-800 rounded-2xl p-6">
          <div className="min-w-[700px] grid grid-cols-5 gap-4">
            {courts.map((court) => (
              <div key={court.id} className="space-y-3">
                <div className="bg-[#450a0a] border border-red-800 p-3 rounded-xl text-center">
                  <h2 className="font-black text-xs text-white">{court.name}</h2>
                </div>
                <div className="space-y-2">
                  {timeSlots.map((time) => {
                    const activeMatch = bookings.find(b => b.date === selectedDateStr && b.courtId === court.id && b.slots.includes(time));
                    const isBooked = !!activeMatch;
                    return (
                      <div key={time} className={`border rounded-xl p-2.5 h-20 ${isBooked ? 'border-red-500/50 bg-red-900/20' : 'border-red-800 bg-[#450a0a]/40'}`}>
                        <div className="flex justify-between font-mono text-[10px] font-bold text-red-200">
                          {time} <span>{isBooked ? 'OCCUPIED' : 'OPEN'}</span>
                        </div>
                        {activeMatch && <div className="mt-2 text-[9px] font-black text-[#facc15] truncate">{activeMatch.id}</div>}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}