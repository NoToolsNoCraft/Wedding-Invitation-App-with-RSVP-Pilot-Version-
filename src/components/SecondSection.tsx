import React, { useState, useEffect, useCallback, useRef } from "react";
import {
	motion,
	AnimatePresence,
	useMotionValue,
	useTransform,
} from "motion/react";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Slide {
	id: number;
	src: string;
	partner: string;
	location: string;
	category: string;
	caption: string;
}

// ─── Data ─────────────────────────────────────────────────────────────────────
// Replace src values with real Supabase Storage URLs or your MSME image URLs.

const slides: Slide[] = [
	{
		id: 1,
		src: "https://picsum.photos/seed/wedding-decor-1/1600/900",
		partner: "AuliaDekorin Dekorasi",
		location: "Denpasar, Bali",
		category: "Venue Decoration",
		caption:
			"Lush floral archways hand-crafted for an open-air garden ceremony.",
	},
	{
		id: 2,
		src: "https://picsum.photos/seed/bridal-makeup-1/1600/900",
		partner: "AuliaDekorin MUA",
		location: "Denpasar, Bali",
		category: "Bridal Makeup",
		caption:
			"Timeless soft-glam bridal look that photographs beautifully in any light.",
	},
	{
		id: 3,
		src: "https://picsum.photos/seed/wedding-table/1600/900",
		partner: "AuliaDekorin Undangan Digital",
		location: "Denpasar, Bali",
		category: "Web Development",
		caption:
			"Elevated table settings — candles, pampas grass, and bespoke centrepieces.",
	},
	{
		id: 4,
		src: "https://picsum.photos/seed/bride-portrait/1600/900",
		partner: "AuliaDekorin Dekorasi",
		location: "Denpasar, Bali",
		category: "Photography",
		caption:
			"Golden-hour portraits that tell the story of your most important day.",
	},
	{
		id: 5,
		src: "https://picsum.photos/seed/wedding-flowers/1600/900",
		partner: "AuliaDekorin Dekorasi",
		location: "Denpasar, Bali",
		category: "Floral Design",
		caption:
			"Seasonal bouquets and aisle florals sourced from local Balinese growers.",
	},
	{
		id: 6,
		src: "https://picsum.photos/seed/bridal-look-2/1600/900",
		partner: "AuliaDekorin MUA",
		location: "Denpasar, Bali",
		category: "Hair & Makeup",
		caption:
			"Full hair and makeup sessions — from first trial to the big morning.",
	},
];

// ─── Constants ────────────────────────────────────────────────────────────────

const AUTOPLAY_INTERVAL = 5000;
const DRAG_THRESHOLD = 60; // px — minimum drag distance to trigger a slide change

// ─── Helpers ─────────────────────────────────────────────────────────────────

function wrap(index: number, length: number) {
	return ((index % length) + length) % length;
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function ProgressBar({
	duration,
	isPlaying,
	slideKey,
}: {
	duration: number;
	isPlaying: boolean;
	slideKey: number;
}) {
	return (
		<div className="h-0.5 w-full bg-white/20 rounded-full overflow-hidden">
			<motion.div
				key={`${slideKey}-${isPlaying}`}
				className="h-full bg-white rounded-full origin-left"
				initial={{ scaleX: 0 }}
				animate={isPlaying ? { scaleX: 1 } : { scaleX: 0 }}
				transition={
					isPlaying
						? { duration: duration / 1000, ease: "linear" }
						: { duration: 0 }
				}
				style={{ transformOrigin: "left" }}
			/>
		</div>
	);
}

function DotNav({
	count,
	active,
	onSelect,
}: {
	count: number;
	active: number;
	onSelect: (i: number) => void;
}) {
	return (
		<div className="flex items-center gap-2">
			{Array.from({ length: count }).map((_, i) => (
				<button
					key={i}
					onClick={() => onSelect(i)}
					aria-label={`Go to slide ${i + 1}`}
					className="group relative flex items-center justify-center"
				>
					<span
						className={`block rounded-full transition-all duration-500 ${
							i === active
								? "w-6 h-2 bg-white"
								: "w-2 h-2 bg-white/40 group-hover:bg-white/70"
						}`}
					/>
				</button>
			))}
		</div>
	);
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function MSMEGallerySlider() {
	const [current, setCurrent] = useState(0);
	const [direction, setDirection] = useState<1 | -1>(1);
	const [isPlaying, setIsPlaying] = useState(true);
	const [isDragging, setIsDragging] = useState(false);
	const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	// dragProgress tracks drag offset only for arrow opacity hints — not bound to slide x
	const dragProgress = useMotionValue(0);
	const dragX = dragProgress; // alias kept so reset calls still work

	// Derived opacity for the drag-hint arrows
	const leftArrowOpacity = useTransform(dragProgress, [-120, 0], [1, 0.4]);
	const rightArrowOpacity = useTransform(dragProgress, [0, 120], [0.4, 1]);

	const goTo = useCallback((index: number, dir: 1 | -1 = 1) => {
		setDirection(dir);
		setCurrent(wrap(index, slides.length));
	}, []);

	const next = useCallback(() => {
		dragX.set(0);
		goTo(current + 1, 1);
	}, [current, goTo, dragX]);
	const prev = useCallback(() => {
		dragX.set(0);
		goTo(current - 1, -1);
	}, [current, goTo, dragX]);

	// Auto-play
	useEffect(() => {
		if (!isPlaying) return;
		timerRef.current = setTimeout(next, AUTOPLAY_INTERVAL);
		return () => {
			if (timerRef.current) clearTimeout(timerRef.current);
		};
	}, [isPlaying, current, next]);

	// Keyboard navigation
	useEffect(() => {
		const handler = (e: KeyboardEvent) => {
			if (e.key === "ArrowRight") next();
			if (e.key === "ArrowLeft") prev();
			if (e.key === " ") {
				e.preventDefault();
				setIsPlaying((p) => !p);
			}
		};
		window.addEventListener("keydown", handler);
		return () => window.removeEventListener("keydown", handler);
	}, [next, prev]);

	// Slide variants
	const variants = {
		enter: (dir: number) => ({
			x: dir > 0 ? "100%" : "-100%",
			opacity: 0,
			scale: 1.04,
		}),
		center: {
			x: 0,
			opacity: 1,
			scale: 1,
			transition: {
				x: { type: "spring", stiffness: 260, damping: 32 },
				opacity: { duration: 0.4 },
				scale: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
			},
		},
		exit: (dir: number) => ({
			x: dir > 0 ? "-60%" : "60%",
			opacity: 0,
			scale: 0.96,
			transition: {
				x: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
				opacity: { duration: 0.3 },
			},
		}),
	};

	const slide = slides[current];
	

	return (
		<section
			className="relative w-full bg-neutral-950 overflow-hidden"
			style={{ height: "clamp(480px, 72vh, 860px)" }}
			onMouseEnter={() => setIsPlaying(false)}
			onMouseLeave={() => setIsPlaying(true)}
		>
			{/* ── Slides ── */}
			<AnimatePresence initial={false} custom={direction}>
				<motion.div
					key={current}
					custom={direction}
					
					initial="enter"
					animate="center"
					exit="exit"
					className="absolute inset-0 cursor-grab active:cursor-grabbing"
					drag="x"
					dragConstraints={{ left: 0, right: 0 }}
					dragElastic={0.12}
					onDragStart={() => setIsDragging(true)}
					onDrag={(_, info) => dragProgress.set(info.offset.x)}
					onDragEnd={(_, info) => {
						setIsDragging(false);
						dragProgress.set(0);
						if (info.offset.x < -DRAG_THRESHOLD) next();
						else if (info.offset.x > DRAG_THRESHOLD) prev();
					}}
				>
					{/* Image */}
					<img
						src={slide.src}
						alt={slide.caption}
						className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
						draggable={false}
						referrerPolicy="no-referrer"
					/>

					{/* Gradient overlays — bottom vignette + subtle top fade */}
					<div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/30 pointer-events-none" />

					{/* Paralax-ish inner content (slides in from same direction) */}
					<motion.div
						className="absolute bottom-0 left-0 right-0 p-8 md:p-14 pointer-events-none"
						initial={{ y: 28, opacity: 0 }}
						animate={{ y: 0, opacity: 1 }}
						transition={{
							delay: 0.18,
							duration: 0.55,
							ease: [0.22, 1, 0.36, 1],
						}}
					>
						{/* Category pill */}
						<span className="inline-block px-3 py-1 mb-4 rounded-full bg-white/10 backdrop-blur-sm text-white/80 text-xs font-semibold tracking-widest uppercase border border-white/10">
							{slide.category}
						</span>

						{/* Caption */}
						<h3 className="text-white text-2xl md:text-4xl font-bold tracking-tighter leading-tight max-w-2xl mb-3">
							{slide.caption}
						</h3>

						{/* Partner */}
						<p className="text-white/60 text-sm font-medium">
							{slide.partner} &nbsp;·&nbsp; {slide.location}
						</p>
					</motion.div>
				</motion.div>
			</AnimatePresence>

			{/* ── Thumbnail strip (right side, desktop) ── */}
			<div className="hidden lg:flex absolute right-0 top-0 bottom-0 w-28 flex-col justify-center gap-2 p-3 bg-black/30 backdrop-blur-md border-l border-white/5">
				{slides.map((s, i) => (
					<button
						key={s.id}
						onClick={() => goTo(i, i > current ? 1 : -1)}
						className={`relative w-full rounded-xl overflow-hidden transition-all duration-300 ${
							i === current
								? "ring-2 ring-white ring-offset-1 ring-offset-black opacity-100"
								: "opacity-40 hover:opacity-75"
						}`}
						style={{ aspectRatio: "16/10" }}
						aria-label={`Slide ${i + 1}: ${s.partner}`}
					>
						<img
							src={s.src}
							alt=""
							className="w-full h-full object-cover pointer-events-none"
							referrerPolicy="no-referrer"
							draggable={false}
						/>
					</button>
				))}
			</div>

			{/* ── Controls bar ── */}
			<div className="absolute bottom-0 left-0 right-0 lg:right-28">
				{/* Slim progress bar — full width */}
				<div className="px-8 md:px-14 pb-4">
					<ProgressBar
						duration={AUTOPLAY_INTERVAL}
						isPlaying={isPlaying}
						slideKey={current}
					/>
				</div>
			</div>

			{/* ── Top controls row ── */}
			<div className="absolute top-6 left-8 md:left-14 right-8 lg:right-36 flex items-center justify-between">
				{/* Section label */}
				<div className="flex items-center gap-3">
					<span className="h-px w-8 bg-white/30" />
					<span className="text-white/50 text-xs font-semibold tracking-[0.2em] uppercase">
						UMKM Gallery
					</span>
				</div>

				{/* Right: play/pause + arrows */}
				<div className="flex items-center gap-2">
					{/* Play / Pause */}
					<button
						onClick={() => setIsPlaying((p) => !p)}
						aria-label={isPlaying ? "Pause slideshow" : "Play slideshow"}
						className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white transition-colors"
					>
						{isPlaying ? (
							<Pause className="w-3.5 h-3.5" />
						) : (
							<Play className="w-3.5 h-3.5" />
						)}
					</button>

					{/* Prev */}
					<motion.button
						style={{ opacity: leftArrowOpacity }}
						onClick={prev}
						aria-label="Previous slide"
						whileHover={{ scale: 1.08 }}
						whileTap={{ scale: 0.92 }}
						className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white transition-colors"
					>
						<ChevronLeft className="w-4 h-4" />
					</motion.button>

					{/* Next */}
					<motion.button
						style={{ opacity: rightArrowOpacity }}
						onClick={next}
						aria-label="Next slide"
						whileHover={{ scale: 1.08 }}
						whileTap={{ scale: 0.92 }}
						className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white transition-colors"
					>
						<ChevronRight className="w-4 h-4" />
					</motion.button>

					{/* Slide counter */}
					<span className="ml-1 text-white/40 text-xs font-mono tabular-nums">
						{String(current + 1).padStart(2, "0")} /{" "}
						{String(slides.length).padStart(2, "0")}
					</span>
				</div>
			</div>

			{/* ── Dot nav (mobile / non-desktop) ── */}
			<div className="absolute bottom-8 left-1/2 -translate-x-1/2 lg:hidden">
				<DotNav
					count={slides.length}
					active={current}
					onSelect={(i) => goTo(i, i > current ? 1 : -1)}
				/>
			</div>
		</section>
	);
}
