import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';

// ─── Google Font injection (Playfair Display + DM Sans) ───────────────────────
// Drop this once in your index.html <head> instead if you prefer:
//   <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet" />
// We inject it here so the component is self-contained.
if (typeof document !== 'undefined' && !document.getElementById('testimonial-fonts')) {
  const link = document.createElement('link');
  link.id = 'testimonial-fonts';
  link.rel = 'stylesheet';
  link.href =
    'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap';
  document.head.appendChild(link);
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface Testimonial {
  id: number;
  quote: string;
  highlight: string; // the fragment shown large
  name: string;
  role: string;          // e.g. "Bride"
  partner: string;       // which MSME vendor they used
  weddingDate: string;
  avatar: string;
  rating: number;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const testimonials: Testimonial[] = [
  {
    id: 1,
    quote:
      'Nismo ni znali da pozivnica za svadbu može da izgleda ovako moderno. Gosti su mislili da smo angažovali nekog vrhunskog IT stručnjaka poput Petra Škrbića, a zapravo smo sve napravili za 15 minuta.',
    highlight: 'napravili za 15 minuta.',
    name: 'Milica Jovanović',
    role: 'Mlada',
    partner: 'Digitalna svadbena pozivnica',
    weddingDate: 'May 2026',
    avatar: 'https://picsum.photos/seed/avatar-milica/200/200',
    rating: 5,
  },
  {
    id: 2,
    quote:
      'RSVP je bio spas. Nismo više morali da jurimo goste po Viber grupi i pitamo “dolaziš li?”. Sve se automatski pratilo, kao da imamo svog malog organizatora svadbe u telefonu.',
    highlight: 'malog organizatora svadbe u telefonu.',
    name: 'Jelena Petrović',
    role: 'Mlada',
    partner: 'Digitalna svadbena pozivnica',
    weddingDate: 'April 2026',
    avatar: 'https://picsum.photos/seed/avatar-jelena/200/200',
    rating: 5,
  },
  {
    id: 3,
    quote:
      'Najjači momenat je bio kad smo poslali link i baba ga je otvorila bez pomoći, i čak poslala RSVP sama. To je bio trenutak kada smo znali da je ',
    highlight: 'platforma savršena',
    name: 'Ana i Marko',
    role: 'Par',
    partner: 'Digitalna svadbena pozivnica',
    weddingDate: 'March 2026',
    avatar: 'https://picsum.photos/seed/avatar-ana-marko/200/200',
    rating: 5,
  },
  {
    id: 4,
    quote:
      'Pozivnica izgleda kao mini web sajt: slika, priča, lokacija, sve. Gosti su čak mislili da imamo posebnu ',
    highlight: 'aplikaciju za svadbu',
    name: 'Katarina Nikolić',
    role: 'Mlada',
    partner: 'Digitalna svadbena pozivnica',
    weddingDate: 'February 2026',
    avatar: 'https://picsum.photos/seed/avatar-katarina/200/200',
    rating: 5,
  },
  {
    id: 5,
    quote:
      'Najveća pobeda: više nema Excel liste gostiju i ručnog brojanja. RSVP se sam ažurira i mi samo gledamo broj potvrđenih dolazaka kao da je Netflix statistika.',
    highlight: ' Dođe mi da se odmah razvedem i ponovo udam!',
    name: 'Marija Stojanović',
    role: 'Mlada',
    partner: 'Digitalna svadbena pozivnica',
    weddingDate: 'Januar 2026',
    avatar: 'https://picsum.photos/seed/avatar-marija/200/200',
    rating: 5,
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function wrap(i: number, len: number) {
  return ((i % len) + len) % len;
}

function getSlotProps(slot: number) {
  // slot: -2, -1, 0, 1, 2  (0 = active)
  const abs = Math.abs(slot);
  if (abs === 0) return { x: '0%', scale: 1,    opacity: 1,    zIndex: 10, blur: 0   };
  if (abs === 1) return { x: slot < 0 ? '-72%' : '72%', scale: 0.82, opacity: 0.55, zIndex: 5,  blur: 1   };
  return              { x: slot < 0 ? '-115%' : '115%', scale: 0.68, opacity: 0.22, zIndex: 1,  blur: 2   };
}

// ─── Star Rating ─────────────────────────────────────────────────────────────

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`w-3.5 h-3.5 ${i < rating ? 'fill-amber-400 text-amber-400' : 'text-neutral-300'}`}
        />
      ))}
    </div>
  );
}

// ─── Testimonial Card ─────────────────────────────────────────────────────────

function TestimonialCard({
  t,
  isActive,
}: {
  t: Testimonial;
  isActive: boolean;
}) {
  // Split the quote so we can bold the highlight fragment
  const parts = t.quote.split(t.highlight);

  return (
    <div
      className="relative w-full h-full rounded-[2rem] overflow-hidden select-none"
      style={{
        background: isActive ? '#0a0a0a' : '#1a1a1a',
        boxShadow: isActive
          ? '0 32px 80px -12px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.06)'
          : '0 8px 32px -4px rgba(0,0,0,0.3)',
        transition: 'background 0.5s, box-shadow 0.5s',
      }}
    >
      {/* Subtle grain overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundSize: '128px',
        }}
      />

      {/* Decorative large quote mark — geometric anchor */}
      <div
        className="absolute -top-4 -left-2 leading-none pointer-events-none"
        style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 'clamp(9rem, 18vw, 14rem)',
          color: isActive ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.025)',
          lineHeight: 1,
          transition: 'color 0.5s',
          userSelect: 'none',
        }}
        aria-hidden
      >
        &#8220;
      </div>

      {/* Card body */}
      <div className="relative z-10 flex flex-col justify-between h-full p-8 md:p-10">

        {/* Top: vendor tag + rating */}
        <div className="flex items-start justify-between">
          <span
            className="px-3 py-1 rounded-full text-[10px] font-semibold tracking-[0.18em] uppercase border"
            style={{
              color: 'rgba(255,255,255,0.5)',
              borderColor: 'rgba(255,255,255,0.1)',
              background: 'rgba(255,255,255,0.04)',
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {t.partner}
          </span>
          <StarRating rating={t.rating} />
        </div>

        {/* Middle: quote */}
        <div className="my-6 flex-1 flex flex-col justify-center">
          <p
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 'clamp(1rem, 2.2vw, 1.25rem)',
              lineHeight: 1.7,
              color: 'rgba(255,255,255,0.65)',
              fontWeight: 400,
            }}
          >
            {parts[0]}
            <em
              style={{
                fontStyle: 'italic',
                color: '#ffffff',
                fontWeight: 700,
              }}
            >
              {t.highlight}
            </em>
            {parts[1]}
          </p>
        </div>

        {/* Bottom: person */}
        <div className="flex items-center gap-4 pt-6" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          {/* Avatar */}
          <div className="relative shrink-0">
            <img
              src={t.avatar}
              alt={t.name}
              className="w-11 h-11 rounded-full object-cover"
              referrerPolicy="no-referrer"
              draggable={false}
            />
            {/* Thin ring */}
            <div className="absolute inset-0 rounded-full" style={{ boxShadow: '0 0 0 2px rgba(255,255,255,0.15)' }} />
          </div>

          {/* Name + meta */}
          <div className="flex-1 min-w-0">
            <p
              className="font-semibold truncate"
              style={{ color: '#fff', fontFamily: "'DM Sans', sans-serif", fontSize: '0.9rem' }}
            >
              {t.name}
            </p>
            <p
              className="truncate"
              style={{ color: 'rgba(255,255,255,0.35)', fontFamily: "'DM Sans', sans-serif", fontSize: '0.75rem', fontWeight: 300 }}
            >
              {t.role} &nbsp;·&nbsp; {t.weddingDate}
            </p>
          </div>

          {/* Right-aligned wedding icon flourish */}
          <span style={{ color: 'rgba(255,255,255,0.12)', fontSize: '1.5rem', lineHeight: 1 }} aria-hidden>
            ♡
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function TestimonialsSlider() {
  const [current, setCurrent] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const DRAG_THRESHOLD = 60;
  const total = testimonials.length;

  const go = useCallback(
    (dir: 1 | -1) => {
      if (isAnimating) return;
      setIsAnimating(true);
      setCurrent(prev => wrap(prev + dir, total));
      setTimeout(() => setIsAnimating(false), 520);
    },
    [isAnimating, total]
  );

  const goTo = useCallback(
    (index: number) => {
      if (isAnimating || index === current) return;
      setIsAnimating(true);
      setCurrent(index);
      setTimeout(() => setIsAnimating(false), 520);
    },
    [isAnimating, current]
  );

  // Keyboard nav
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') go(1);
      if (e.key === 'ArrowLeft') go(-1);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [go]);

  // Slots: render 5 cards — indices relative to current
  const slots = [-2, -1, 0, 1, 2];

  return (
    <section className="py-28 px-6 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto">

        {/* ── Header ── */}
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <div className="flex items-center justify-center gap-3 mb-5">
            <span className="h-px w-10 bg-neutral-300" />
            <span className="text-xs font-semibold tracking-[0.2em] uppercase text-neutral-400">
              Bračni parovi o nama
            </span>
            <span className="h-px w-10 bg-neutral-300" />
          </div>
          <h2
            className="tracking-tighter leading-[0.95] mb-4"
            style={{ fontSize: 'clamp(2.4rem, 6vw, 4.5rem)', fontFamily: "'Playfair Display', serif", fontWeight: 700 }}
          >
            Priče koje nas pomeraju
          </h2>
          <p
            className="text-neutral-400 max-w-md mx-auto"
            style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300, lineHeight: 1.7 }}
          >
            Iskrene reči od pravih parova koji su unapredili svoj najvažniji dan u svojim životima uz našu uslugu.
          </p>
        </motion.div>

        {/* ── Carousel Stage ── */}
        <div
          className="relative mx-auto"
          style={{ height: 'clamp(340px, 44vw, 480px)', maxWidth: '880px' }}
        >
          {slots.map(slot => {
            const index = wrap(current + slot, total);
            const t = testimonials[index];
            const props = getSlotProps(slot);
            const isActive = slot === 0;

            return (
              <motion.div
                key={slot}
                className="absolute inset-0"
                animate={{
                  x: props.x,
                  scale: props.scale,
                  opacity: props.opacity,
                  zIndex: props.zIndex,
                  filter: `blur(${props.blur}px)`,
                }}
                transition={{
                  type: 'spring',
                  stiffness: 280,
                  damping: 30,
                  mass: 0.8,
                }}
                // style={{ originX: 0.5, originY: 0.5 }}
                drag={isActive ? 'x' : false}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.08}
                onDrag={(_, info) => { /* drag offset tracked internally by motion */ }}
                onDragEnd={(_, info) => {
                  if (info.offset.x < -DRAG_THRESHOLD) go(1);
                  else if (info.offset.x > DRAG_THRESHOLD) go(-1);
                }}
                onClick={() => {
                  if (!isActive && Math.abs(slot) === 1) goTo(index);
                }}
                whileTap={isActive ? { cursor: 'grabbing' } : {}}
                style={{
                  cursor: isActive ? 'grab' : slot !== 0 && Math.abs(slot) === 1 ? 'pointer' : 'default',
                  originX: 0.5,
                  originY: 0.5,
                }}
              >
                <TestimonialCard t={t} isActive={isActive} />
              </motion.div>
            );
          })}
        </div>

        {/* ── Controls ── */}
        <div className="flex flex-col items-center gap-8 mt-16">

          {/* Arrow buttons */}
          <div className="flex items-center gap-4">
            <motion.button
              onClick={() => go(-1)}
              aria-label="Previous testimonial"
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.92 }}
              className="w-12 h-12 rounded-full border border-neutral-200 bg-white shadow-sm hover:border-neutral-400 hover:shadow-md flex items-center justify-center text-neutral-700 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </motion.button>

            {/* Dot indicators */}
            <div className="flex items-center gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  aria-label={`Go to testimonial ${i + 1}`}
                  className="transition-all duration-400"
                  style={{
                    width: i === current ? '1.75rem' : '0.5rem',
                    height: '0.5rem',
                    borderRadius: '9999px',
                    background: i === current ? '#0a0a0a' : '#d4d4d4',
                    transition: 'width 0.4s cubic-bezier(0.22,1,0.36,1), background 0.3s',
                  }}
                />
              ))}
            </div>

            <motion.button
              onClick={() => go(1)}
              aria-label="Next testimonial"
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.92 }}
              className="w-12 h-12 rounded-full border border-neutral-200 bg-white shadow-sm hover:border-neutral-400 hover:shadow-md flex items-center justify-center text-neutral-700 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </motion.button>
          </div>

          {/* Aggregate rating strip */}
          <motion.div
            className="flex items-center gap-3 px-6 py-3 rounded-full border border-neutral-100 bg-neutral-50"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <span
              className="text-sm font-semibold text-neutral-800"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              5.0
            </span>
            <span className="text-neutral-300 text-sm">·</span>
            <span
              className="text-sm text-neutral-500"
              style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300 }}
            >
              Na osnovu 50 proverenih Google recenzija
            </span>
          </motion.div>
        </div>

      </div>
    </section>
  );
}