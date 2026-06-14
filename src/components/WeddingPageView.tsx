import React, { useState } from 'react';
import { Wedding, THEMES } from '../types';
import CountdownTimer from './CountdownTimer';
import MusicPlayer from './MusicPlayer';
import { MapPin, Calendar, Clock, Heart } from 'lucide-react';
import { motion } from 'motion/react';
import { format } from 'date-fns';

interface WeddingPageViewProps {
  wedding: Wedding;
  isPreview?: boolean;
}

export default function WeddingPageView({ wedding, isPreview = false }: WeddingPageViewProps) {
  const theme = THEMES[wedding.theme] || THEMES.pastel;
  const [rsvpData, setRsvpData] = useState({
    name: '',
    status: 'attending',
    guests: 1,
    message: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleRSVP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isPreview) return alert("Potvrda dolaska je onemogućena u pregledu");
    
    try {
      const res = await fetch('/api/rsvps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weddingId: wedding.id,
          ...rsvpData
        })
      });
      if (res.ok) setIsSubmitted(true);
    } catch (error) {
      console.error(error);
    }
  };

  const fontClass = wedding.fontStyle === 'serif' ? 'font-serif' : wedding.fontStyle === 'script' ? 'font-script' : 'font-sans';

  return (
    <div className={`min-h-screen ${theme.bg} ${theme.text} ${fontClass} selection:bg-neutral-200`}>
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <motion.div 
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5 }}
          className="absolute inset-0 z-0"
        >
          <img 
            src={wedding.heroImage || "https://picsum.photos/seed/wedding/1920/1080"} 
            alt="Wedding Hero"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-black/40" />
        </motion.div>

        <div className="relative z-10 text-center text-white px-4">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <h1 className="text-7xl md:text-10xl mb-4 drop-shadow-lg">
              {wedding.brideName} & {wedding.groomName}
            </h1>
            <p className="text-xl md:text-2xl italic opacity-90 mb-8 font-serif">
              {wedding.tagline || "Venčanje!"}
            </p>
            
            {wedding.showCountdown && wedding.date && (
              <CountdownTimer targetDate={wedding.date} className="mt-12" />
            )}
          </motion.div>
        </div>
      </section>

      {/* Details Section */}
      <section className="py-24 px-4 max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className={`${theme.card} p-12 rounded-3xl border shadow-xl`}
        >
          <h2 className="text-3xl mb-12 flex items-center justify-center gap-3">
            <Calendar className="w-8 h-8" /> Datum i vreme događaja
          </h2>
          
          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-4">
              <div className="flex flex-col items-center">
                <Calendar className="w-6 h-6 mb-2 opacity-60" />
                <p className="text-xl font-medium">
                  {wedding.date ? format(new Date(wedding.date), 'MMMM do, yyyy') : 'Dodajte'}
                </p>
              </div>
              <div className="flex flex-col items-center">
                <Clock className="w-6 h-6 mb-2 opacity-60" />
                <p className="text-xl font-medium">{wedding.time || 'Dodajte'}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex flex-col items-center">
                <MapPin className="w-6 h-6 mb-2 opacity-60" />
                <p className="text-xl font-medium">{wedding.venueName || 'Naziv lokala'}</p>
                <p className="opacity-80">{wedding.venueAddress || 'Adresa lokala'}</p>
                {wedding.venueMapsUrl && (
                  <a 
                    href={wedding.venueMapsUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="mt-4 inline-block underline underline-offset-4 hover:opacity-70 transition-opacity"
                  >
                    Pogledaj na Google mapama
                  </a>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Story Section */}
      {wedding.loveStory && (
        <section className="py-24 px-4 bg-black/5">
          <div className="max-w-3xl mx-auto text-center">
            <Heart className="w-12 h-12 mx-auto mb-8 opacity-20" />
            <h2 className="text-4xl mb-12">Naša ljubavna priča</h2>
            <div className="prose prose-lg mx-auto text-inherit opacity-90 leading-relaxed whitespace-pre-wrap">
              {wedding.loveStory}
            </div>
          </div>
        </section>
      )}

      {/* RSVP Section */}
      <section className="py-24 px-4 max-w-2xl mx-auto">
        <div className={`${theme.card} p-8 md:p-12 rounded-3xl border shadow-xl`}>
          <h2 className="text-3xl text-center mb-8">Potvrda dolaska</h2>
          
          {isSubmitted ? (
            <div className="text-center py-12">
              <Heart className="w-12 h-12 mx-auto mb-4 text-emerald-500" />
              <h3 className="text-2xl mb-2">Hvala vam puno!</h3>
              <p className="opacity-80">Vaš odgovor je prosleđen.</p>
            </div>
          ) : (
            <form onSubmit={handleRSVP} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2 opacity-70 uppercase tracking-widest">Vaše ime (ili imena)</label>
                <input
                  required
                  type="text"
                  className="w-full bg-transparent border-b border-current py-2 focus:outline-none focus:border-opacity-100 border-opacity-30 transition-all"
                  value={rsvpData.name}
                  onChange={e => setRsvpData({...rsvpData, name: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2 opacity-70 uppercase tracking-widest">Dolazak</label>
                  <select
                    className="w-full bg-transparent border-b border-current py-2 focus:outline-none border-opacity-30"
                    value={rsvpData.status}
                    onChange={e => setRsvpData({...rsvpData, status: e.target.value as any})}
                  >
                    <option value="attending">Dolazimo</option>
                    <option value="declined">Ne dolazimo</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 opacity-70 uppercase tracking-widest">Gosti</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    className="w-full bg-transparent border-b border-current py-2 focus:outline-none border-opacity-30"
                    value={rsvpData.guests}
                    onChange={e => setRsvpData({...rsvpData, guests: parseInt(e.target.value)})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 opacity-70 uppercase tracking-widest">Poruka (Opciono)</label>
                <textarea
                  rows={3}
                  className="w-full bg-transparent border-b border-current py-2 focus:outline-none border-opacity-30 resize-none"
                  value={rsvpData.message}
                  onChange={e => setRsvpData({...rsvpData, message: e.target.value})}
                />
              </div>

              <button
                type="submit"
                className={`w-full py-4 rounded-full transition-all font-medium uppercase tracking-widest ${theme.button}`}
              >
                Pošalji odgovor mladencima
              </button>
            </form>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 text-center opacity-80 text-sm">
        <p>Napravljeno uz pomoć Sprovodadžije</p>
      </footer>

      {wedding.musicId && <MusicPlayer musicId={wedding.musicId} />}
    </div>
  );
}
