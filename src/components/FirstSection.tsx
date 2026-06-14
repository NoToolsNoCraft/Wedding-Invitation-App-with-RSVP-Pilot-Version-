import React from "react";
import { motion } from "motion/react";
import { CheckCircle, Flower2, Camera, Star, MapPin, Award } from "lucide-react";

// ─── Data ────────────────────────────────────────────────────────────────────

const services = [
	{
		icon: <Flower2 className="w-6 h-6" />,
		label: "Dekoracije",
		desc: "Uredite pozivnice po sopstvenom ukusu.",
		color: "bg-rose-50 text-rose-600",
		accent: "#f43f5e",
	},
	{
		icon: <CheckCircle className="w-6 h-6" />,
		label: "Pametni RSVP Sistem",
		desc: "Omogućite gostima da potvrde dolazak jednim klikom. Pratite broj gostiju, odgovore i organizaciju svadbe bez poziva, Excel tabela i haosa po Viber grupama.",
		color: "bg-emerald-50 text-emerald-600",
		accent: "#10b981",
	},
	{
		icon: <Camera className="w-6 h-6" />,
		label: "Slika",
		desc: "Obogatite digitalnu pozivnicu sopstvenom slikom.",
		color: "bg-sky-50 text-sky-600",
		accent: "#0ea5e9",
	},
];

const partners = [
	{
		name: "AuliaDekorin Dekorasi",
		location: "Denpasar, Bali",
		specialty: "Wedding Decoration",
		rating: 4.9,
		reviews: 138,
		tag: "Top Rated",
		img: "https://picsum.photos/seed/msme-dekor/400/300",
	},
	{
		name: "AuliaDekorin MUA",
		location: "Denpasar, Bali",
		specialty: "Bridal Makeup",
		rating: 5.0,
		reviews: 214,
		tag: "Fan Favourite",
		img: "https://picsum.photos/seed/msme-beauty/400/300",
	},
	{
		name: "AuliaDekorin Undangan Digital",
		location: "Denpasar, Bali",
		specialty: "Web Development",
		rating: 5.0,
		reviews: 102,
		tag: "Top Rated",
		img: "https://picsum.photos/seed/msme-photo/400/300",
	},
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function MSMESection() {
	return (
		<section className="py-32 px-6 overflow-hidden bg-white">
			<div className="max-w-7xl mx-auto">
				{/* ── Header ── */}
				<motion.div
					className="mb-24"
					initial={{ opacity: 0, y: 24 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.7 }}
				>
					{/* eyebrow */}
					<div className="flex items-center gap-3 mb-6">
						<span className="h-px w-12 bg-neutral-300" />
						<span className="text-xs font-semibold tracking-[0.2em] uppercase text-neutral-400">
							Dostupne usluge
						</span>
					</div>

					<div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
						<h2 className="text-5xl md:text-6xl font-bold tracking-tighter leading-[0.95] max-w-xl">
							Pripremite venčanje
							<br />
							<em className="font-serif font-normal text-neutral-300 not-italic">
								na pravi način
							</em>
						</h2>
						<p className="text-neutral-500 max-w-sm leading-relaxed md:text-right">
							Usluge uključuju samostalno kreiranje digitalnih pozivnica brzo i lako.
						</p>
					</div>
				</motion.div>

				{/* ── Services Strip ── */}
				<div className="grid md:grid-cols-3 gap-4 mb-24">
					{services.map((s, i) => (
						<motion.div
							key={i}
							className="group relative p-8 rounded-3xl border border-neutral-100 bg-neutral-50 hover:bg-white hover:shadow-lg transition-all duration-300 cursor-default overflow-hidden"
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
							transition={{ delay: i * 0.1, duration: 0.6 }}
						>
							{/* Decorative circle */}
							<div
								className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full opacity-0 group-hover:opacity-5 transition-opacity duration-500"
								style={{ background: s.accent }}
							/>

							<div className={`inline-flex p-3 rounded-2xl ${s.color} mb-6`}>
								{s.icon}
							</div>
							<h3 className="text-lg font-bold mb-2">{s.label}</h3>
							<p className="text-neutral-500 text-sm leading-relaxed">
								{s.desc}
							</p>
						</motion.div>
					))}
				</div>

				{/* ── Partner Cards ── */}
				<div>
					{/* Sub-header */}
					<motion.div
						className="flex items-center justify-between mb-10"
						initial={{ opacity: 0 }}
						whileInView={{ opacity: 1 }}
						viewport={{ once: true }}
					>
						<h3 className="text-2xl font-bold tracking-tight">
							Vendor Yang Tersedia
						</h3>
						<button className="text-sm font-semibold text-neutral-400 hover:text-black transition-colors underline underline-offset-4">
							Lihat Semua Partner
						</button>
					</motion.div>

					<div className="grid md:grid-cols-3 gap-6">
						{partners.map((p, i) => (
							<motion.div
								key={i}
								className="group rounded-3xl overflow-hidden border border-neutral-100 hover:border-neutral-200 hover:shadow-xl transition-all duration-300"
								initial={{ opacity: 0, y: 24 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true }}
								transition={{ delay: i * 0.12, duration: 0.6 }}
							>
								{/* Image */}
								<div className="relative h-52 overflow-hidden bg-neutral-100">
									<img
										src={p.img}
										alt={p.name}
										className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
										referrerPolicy="no-referrer"
									/>
									{/* Tag badge */}
									<span className="absolute top-4 left-4 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-bold text-neutral-700 shadow-sm">
										{p.tag}
									</span>
								</div>

								{/* Body */}
								<div className="p-6 bg-white">
									<div className="flex items-start justify-between mb-1">
										<h4 className="font-bold text-lg tracking-tight">
											{p.name}
										</h4>
										{/* Rating */}
										<div className="flex items-center gap-1 text-amber-500">
											<Star className="w-4 h-4 fill-amber-400 stroke-amber-400" />
											<span className="text-sm font-bold text-neutral-700">
												{p.rating}
											</span>
										</div>
									</div>

									<div className="flex items-center gap-1 text-neutral-400 text-xs mb-3">
										<MapPin className="w-3 h-3" />
										<span>{p.location}</span>
									</div>

									<div className="flex items-center justify-between">
										<span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-100 text-neutral-600 text-xs font-medium">
											<Award className="w-3 h-3" />
											{p.specialty}
										</span>
										<span className="text-xs text-neutral-400">
											{p.reviews} reviews
										</span>
									</div>
								</div>
							</motion.div>
						))}
					</div>
				</div>

				{/* ── UMKM Pride Banner ── */}
				<motion.div
					className="mt-20 p-8 md:p-12 rounded-3xl bg-neutral-50 border border-neutral-100 flex flex-col md:flex-row items-center justify-between gap-6"
					initial={{ opacity: 0, y: 16 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.6 }}
				>
					<div>
						<p className="text-xs font-semibold tracking-widest uppercase text-neutral-400 mb-2">
							Komitmen Kami
						</p>
						<h4 className="text-2xl font-bold tracking-tight mb-2">
							Bangga Mendukung UMKM Indonesia
						</h4>
						<p className="text-neutral-500 text-sm leading-relaxed max-w-md">
							Every booking through Everlasting goes directly to a local
							Indonesian business. We believe the best weddings are built by the
							talented hands in your own community.
						</p>
					</div>
					<div className="flex gap-10 shrink-0">
						{[
							["50+", "Partners"],
							["12", "Cities"],
							["1,200+", "Weddings"],
						].map(([num, label]) => (
							<div key={label} className="text-center">
								<p className="text-3xl font-bold tracking-tighter">{num}</p>
								<p className="text-xs text-neutral-400 font-medium mt-0.5">
									{label}
								</p>
							</div>
						))}
					</div>
				</motion.div>
			</div>
		</section>
	);
}
