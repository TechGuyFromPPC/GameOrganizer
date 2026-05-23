// src/app/book/page.tsx
'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { supabase } from '../../utils/supabase/client';

export default function BookPage() {
  const getLocalYYYYMMDD = (date: Date) => {
    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - (offset * 60 * 1000));
    return localDate.toISOString().split('T')[0];
  };

  const [currentCalendarDate, setCurrentCalendarDate] = useState(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string>(getLocalYYYYMMDD(new Date()));
  const [selectedTimes, setSelectedTimes] = useState<string[]>([]);
  const [selectedCourtId, setSelectedCourtId] = useState<number | null>(1);
  const [racketsCount, setRacketsCount] = useState<number>(0);
  const [occupiedSlots, setOccupiedSlots] = useState<string[]>([]);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [lastBooking, setLastBooking] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [guestInfo, setGuestInfo] = useState({ fullName: '', email: '', phone: '' });

  const RATE_PER_HOUR = 400;
  const RATE_PER_RACKET = 100;
  const currentYear = currentCalendarDate.getFullYear();
  const currentMonth = currentCalendarDate.getMonth();
  
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const timeSlots = ['6:00 AM', '7:00 AM', '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM', '7:00 PM', '8:00 PM', '9:00 PM'];
  const courts = [
    { id: 1, name: 'Court 1 (Indoor Pro)' },
    { id: 2, name: 'Court 2 (Indoor Standard)' },
    { id: 3, name: 'Court 3 (Outdoor Showcourt)' },
    { id: 4, name: 'Court 4 (Outdoor North)' },
    { id: 5, name: 'Court 5 (Outdoor South)' },
  ];

  useEffect(() => {
    const fetchUnavailableSlots = async () => {
      if (!selectedCourtId) return;
      const { data, error } = await supabase.from('bookings').select('slots').eq('booking_date', selectedDateStr).eq('court_id', selectedCourtId).not('status', 'eq', 'rejected');
      if (data) setOccupiedSlots(data.flatMap((booking: any) => booking.slots));
    };
    fetchUnavailableSlots();
  }, [selectedDateStr, selectedCourtId, isSuccessModalOpen]);

  const parseSlotTo24Hour = (timeStr: string): number => {
    const [time, modifier] = timeStr.split(' ');
    let [hours] = time.split(':').map(Number);
    if (modifier === 'PM' && hours !== 12) hours += 12;
    if (modifier === 'AM' && hours === 12) hours = 0;
    return hours;
  };

  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) days.push(new Date(currentYear, currentMonth, d));
    return days;
  }, [currentYear, currentMonth]);

  const toggleTimeSlot = (time: string) => {
    setSelectedTimes(prev => prev.includes(time) ? prev.filter(t => t !== time) : [...prev, time]);
  };

  const totalBill = (selectedTimes.length * RATE_PER_HOUR) + (racketsCount * RATE_PER_RACKET);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!receiptPreview) return alert('Please upload your payment receipt image.');
    setIsSubmitting(true);
    const reservationId = `KL-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    const courtName = courts.find(c => c.id === selectedCourtId)?.name || 'Court';
    const { error } = await supabase.from('bookings').insert([{
      id_custom: reservationId, full_name: guestInfo.fullName, email: guestInfo.email, phone: guestInfo.phone,
      court_id: selectedCourtId, booking_date: selectedDateStr, slots: selectedTimes,
      rackets_count: racketsCount, total_price: totalBill, receipt_url: receiptPreview, status: 'pending'
    }]);
    setIsSubmitting(false);
    if (error) { alert(`Error: ${error.message}`); return; }
    setLastBooking({ id: reservationId, fullName: guestInfo.fullName, courtName, date: selectedDateStr, slots: selectedTimes, total: totalBill });
    setIsFormModalOpen(false); setIsSuccessModalOpen(true);
    setSelectedTimes([]); setRacketsCount(0); setReceiptPreview(null); setGuestInfo({ fullName: '', email: '', phone: '' });
  };

  return (
    <div className="min-h-screen bg-[#450a0a] text-red-50 antialiased pb-24">
      <header className="border-b border-red-900 bg-[#7f1d1d]/80 backdrop-blur sticky top-0 z-40 px-6 py-4 flex justify-between items-center">
        <span className="font-black text-lg text-white">🏓 KITCHEN LINE</span>
        <span className="text-[10px] font-black uppercase text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/20">Supabase Connected</span>
      </header>

      <main className="max-w-6xl mx-auto px-4 pt-10 grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-[#7f1d1d]/50 border border-red-900 p-6 rounded-2xl shadow-xl">
            <h2 className="text-xs font-bold uppercase tracking-wider text-red-300 mb-4 flex items-center gap-2">
              <span className="w-5 h-5 rounded bg-amber-500/10 text-amber-400 flex items-center justify-center text-[10px] font-black">1</span> Choose Court
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {courts.map(court => (
                <button key={court.id} type="button" onClick={() => { setSelectedCourtId(court.id); setSelectedTimes([]); }}
                  className={`text-left p-4 rounded-xl border flex justify-between items-center transition-all ${selectedCourtId === court.id ? 'border-amber-500 bg-amber-500/[0.04]' : 'border-red-900/60 bg-[#450a0a]/40'}`}>
                  <span className="font-bold text-sm text-red-50">{court.name}</span>
                  <span className="text-xs font-bold text-amber-400 bg-red-950 px-2 py-1 rounded border border-red-900">₱400/hr</span>
                </button>
              ))}
            </div>
          </section>

          <section className="bg-[#7f1d1d]/50 border border-red-900 p-6 rounded-2xl shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xs font-bold uppercase tracking-wider text-red-300 flex items-center gap-2">
                <span className="w-5 h-5 rounded bg-amber-500/10 text-amber-400 flex items-center justify-center text-[10px] font-black">2</span> Select Date
              </h2>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => setCurrentCalendarDate(new Date(currentYear, currentMonth - 1, 1))} className="px-2.5 py-1 rounded-lg bg-[#450a0a] text-xs font-bold">◀</button>
                <span className="text-xs font-black text-white w-32 text-center bg-[#2d0202]/80 border border-red-900 py-1.5 rounded-xl">{monthNames[currentMonth]} {currentYear}</span>
                <button type="button" onClick={() => setCurrentCalendarDate(new Date(currentYear, currentMonth + 1, 1))} className="px-2.5 py-1 rounded-lg bg-[#450a0a] text-xs font-bold">▶</button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1.5">
              {calendarDays.map((dateObj, idx) => {
                if (!dateObj) return <div key={idx} />;
                const dateString = getLocalYYYYMMDD(dateObj);
                const isSelected = selectedDateStr === dateString;
                const isDateInPast = dateObj < new Date(new Date().setHours(0, 0, 0, 0));
                return (
                  <button key={dateString} type="button" disabled={isDateInPast} onClick={() => { setSelectedDateStr(dateString); setSelectedTimes([]); }}
                    className={`h-11 rounded-xl text-xs font-bold border transition-all ${isDateInPast ? 'bg-red-950/10 text-red-900 opacity-20' : isSelected ? 'bg-amber-500 border-amber-500 text-red-950 font-black' : 'bg-[#450a0a]/40 border-red-900 text-red-200'}`}>
                    {dateObj.getDate()}
                  </button>
                );
              })}
            </div>
          </section>

          <section className="bg-[#7f1d1d]/50 border border-red-900 p-6 rounded-2xl shadow-xl">
            <h2 className="text-xs font-bold uppercase tracking-wider text-red-300 mb-4 flex items-center gap-2">
              <span className="w-5 h-5 rounded bg-amber-500/10 text-amber-400 flex items-center justify-center text-[10px] font-black">3</span> Available Times
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {timeSlots.map(time => {
                const isSelected = selectedTimes.includes(time);
                const isAlreadyBooked = occupiedSlots.includes(time);
                const isHourInPast = selectedDateStr === getLocalYYYYMMDD(new Date()) && (parseSlotTo24Hour(time) <= new Date().getHours());
                return (
                  <button key={time} type="button" disabled={isHourInPast || isAlreadyBooked} onClick={() => toggleTimeSlot(time)}
                    className={`py-3 rounded-xl border text-xs font-bold tracking-wide transition-all ${
                      isAlreadyBooked ? 'bg-red-900/10 border-red-900 text-red-400/50 line-through' :
                      isHourInPast ? 'bg-[#450a0a] border-red-900 text-red-900 opacity-20' :
                      isSelected ? 'border-amber-500/40 bg-amber-500/10 text-amber-400 font-black' : 'border-red-900 bg-[#450a0a]/40 text-red-200'
                    }`}>
                    {time}
                  </button>
                );
              })}
            </div>
          </section>
        </div>

        <div className="lg:col-span-1 lg:sticky lg:top-24">
          <div className="bg-[#7f1d1d]/80 border border-red-900 p-6 rounded-2xl shadow-2xl space-y-6">
            <h3 className="text-xs font-bold uppercase text-red-300 border-b border-red-900 pb-3">Summary</h3>
            <div className="space-y-2 text-xs font-semibold text-red-200">
              <div className="flex justify-between bg-[#450a0a]/40 p-2 rounded-xl"><span>Court</span><span className="text-white">{courts.find(c => c.id === selectedCourtId)?.name.split(' (')[0]}</span></div>
              <div className="flex justify-between bg-[#450a0a]/40 p-2 rounded-xl"><span>Date</span><span className="text-white">{selectedDateStr}</span></div>
            </div>
            <div className="pt-2 flex justify-between items-baseline">
              <span className="text-xs font-bold text-red-300 uppercase">Grand Total:</span>
              <span className="text-3xl font-black text-amber-400">₱{totalBill.toLocaleString()}</span>
            </div>
            <button type="button" disabled={selectedTimes.length === 0} onClick={() => setIsFormModalOpen(true)}
              className="w-full py-4 rounded-xl bg-amber-500 text-red-950 font-black text-xs uppercase tracking-widest disabled:bg-red-900 disabled:text-red-700 shadow-xl">
              Proceed to Payment
            </button>
          </div>
        </div>
      </main>

      {/* Payment Modal */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#2d0202]/90 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#7f1d1d] border border-red-900 w-full max-w-lg rounded-2xl p-6 shadow-2xl space-y-5">
            <h3 className="text-base font-black text-white">Payment Validation</h3>
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <input type="text" required placeholder="Full Name" value={guestInfo.fullName} onChange={e => setGuestInfo({...guestInfo, fullName: e.target.value})} className="w-full bg-[#450a0a] border border-red-900 rounded-xl px-4 py-3 text-xs text-white" />
              <input type="tel" required placeholder="Phone Number" value={guestInfo.phone} onChange={e => setGuestInfo({...guestInfo, phone: e.target.value})} className="w-full bg-[#450a0a] border border-red-900 rounded-xl px-4 py-3 text-xs text-white" />
              <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-red-900 rounded-xl p-4 text-center cursor-pointer bg-[#450a0a]">
                <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) { const r = new FileReader(); r.onloadend = () => setReceiptPreview(r.result as string); r.readAsDataURL(file); }
                }} />
                <span className="text-xs font-bold text-red-300">{receiptPreview ? "📊 Receipt Attached" : "📸 Upload Receipt"}</span>
              </div>
              <button type="submit" disabled={isSubmitting} className="w-full bg-amber-500 py-3 rounded-xl font-black text-xs text-red-950 uppercase">{isSubmitting ? 'Processing...' : 'Confirm'}</button>
            </form>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {isSuccessModalOpen && lastBooking && (
        <div className="fixed inset-0 z-[60] bg-[#2d0202]/95 backdrop-blur flex items-center justify-center p-4">
          <div className="bg-white text-red-950 w-full max-w-sm rounded-3xl p-6 shadow-2xl">
            <h3 className="text-xl font-black">Reservation Confirmed</h3>
            <p className="text-xs mt-2">Key: {lastBooking.id}</p>
            <button onClick={() => setIsSuccessModalOpen(false)} className="mt-6 w-full py-3 bg-amber-500 font-black text-xs uppercase">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}