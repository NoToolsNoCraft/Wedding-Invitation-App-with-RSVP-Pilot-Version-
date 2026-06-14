import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import {
	Heart,
	Calendar,
	Music,
	Clock,
	ChevronRight,
	Sparkles,
} from "lucide-react";
import FirstSection from "../components/FirstSection";
import SecondSection from "../components/SecondSection";
import ThirdSection from "../components/ThirdSection";

export default function LandingPage() {
	const navigate = useNavigate();

	return (
		<div className="min-h-screen bg-white">
			{/* Navbar */}
			<nav className="p-6 flex justify-between items-center max-w-7xl mx-auto">
				<div className="flex items-center gap-2">
					<div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-white font-bold text-xl">
						<img src="/favicon.svg" alt="" />
					</div>
					<span className="font-bold text-2xl tracking-tighter">
						Sprovodadžija
					</span>
				</div>
				{/* <div className="hidden md:flex items-center gap-8 text-sm font-medium text-neutral-500">
					<a href="#" className="hover:text-black transition-colors">
						Fitur
					</a>
					<a href="#" className="hover:text-black transition-colors">
						Tema
					</a>
					<a href="#" className="hover:text-black transition-colors">
						Harga
					</a>
				</div> */}
				<button
					onClick={() => navigate("/dashboard")}
					className="px-6 py-2.5 bg-black text-white rounded-full font-bold text-sm hover:bg-neutral-800 transition-all"
				>
					Započni
				</button>
			</nav>

			{/* Hero Section */}
			<section className="pt-20 pb-32 px-6">
				<div className="max-w-5xl mx-auto text-center">
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.8 }}
					>
						<div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neutral-100 text-neutral-600 text-sm font-medium mb-8">
							<Sparkles className="w-4 h-4 text-amber-500" />
							<span>Hajde da napravimo prelepe pozivnice za venčanje!</span>
						</div>
						<h1 className="text-6xl md:text-8xl font-bold tracking-tighter mb-8 leading-[0.9]">
							Ispričajte svoju ljubavnu priču,
							<br />
							<span className="text-neutral-300 italic font-serif">
								ovde!
							</span>
						</h1>
						<p className="text-xl text-neutral-500 max-w-2xl mx-auto mb-12 leading-relaxed">
							Brzo i jednostavno napravite digitalnu pozivnicu za venčanje iz snova. Podelite svoju ljubavnu priču, 
							prikupljajte potvrde dolaska i odbrojavajte do vašeg posebnog dana.
						</p>
						<div className="flex flex-col sm:flex-row items-center justify-center gap-4">
							<button
								onClick={() => navigate("/create")}
								className="w-full sm:w-auto px-10 py-5 bg-black text-white rounded-full font-bold text-lg flex items-center justify-center gap-2 hover:scale-105 transition-transform shadow-xl"
							>
								Napravite pozivnicu za venčanje <ChevronRight className="w-5 h-5" />
							</button>
							<button className="w-full sm:w-auto px-10 py-5 border border-neutral-200 rounded-full font-bold text-lg hover:bg-neutral-50 transition-colors">
								Pogledajte primere
							</button>
						</div>
					</motion.div>
				</div>
			</section>

			<FirstSection />
			<SecondSection />
			<ThirdSection />

			{/* Features Grid */}
			<section className="py-32 bg-neutral-50">
				<div className="max-w-7xl mx-auto px-6">
					<div className="text-center mb-20">
						<h2 className="text-4xl font-bold tracking-tight mb-4">
							Sve što vam je potrebno
						</h2>
						<p className="text-neutral-500">
							Dizajnirano da vaše planiranje venčanja učini malo magičnijim.
						</p>
					</div>

					<div className="grid md:grid-cols-3 gap-8">
						{[
							{
								icon: <Heart className="w-8 h-8 text-rose-500" />,
								title: "Ljubavna priča",
								desc: "Ispričajte priču o tome kako ste se upoznali i o svom ljubavnom putovanju uz prelepu tipografiju.",
							},
							{
								icon: <Calendar className="w-8 h-8 text-blue-500" />,
								title: "RSVP",
								desc: "Lako prikupljajte i upravljajte povratnim informacijama gostiju u realnom vremenu.",
							},
							{
								icon: <Clock className="w-8 h-8 text-emerald-500" />,
								title: "Odbrojavanje",
								desc: "Pojačajte uzbuđenje uz odbrojavanje uživo do ceremonije venčanja.",
							},
							{
								icon: <Music className="w-8 h-8 text-purple-500" />,
								title: "Muzika u pozadini",
								desc: "Pustite svoje omiljene romantične pesme da biste ispunili posebnu atmosferu na vaš srećan dan.",
							},
							{
								icon: <Sparkles className="w-8 h-8 text-amber-500" />,
								title: "Prilagođena tema",
								desc: "Izaberite elegantnu temu koja odgovara stilu vašeg venčanja iz snova.",
							},
							{
								icon: <ChevronRight className="w-8 h-8 text-neutral-400" />,
								title: "Jedinstven URL",
								desc: "Nabavite poseban link koji možete podeliti sa pozvanim gostima.",
							},
						].map((feature, i) => (
							<motion.div
								key={i}
								initial={{ opacity: 0, y: 20 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true }}
								transition={{ delay: i * 0.1 }}
								className="p-8 bg-white rounded-3xl border border-neutral-100 shadow-sm hover:shadow-md transition-shadow"
							>
								<div className="mb-6">{feature.icon}</div>
								<h3 className="text-xl font-bold mb-3">{feature.title}</h3>
								<p className="text-neutral-500 leading-relaxed">
									{feature.desc}
								</p>
							</motion.div>
						))}
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className="py-32 px-6">
				<div className="max-w-5xl mx-auto bg-black rounded-[3rem] p-12 md:p-24 text-center text-white relative overflow-hidden">
					<div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
						<img
							src="https://picsum.photos/seed/wedding-bg/1920/1080?blur=10"
							className="w-full h-full object-cover"
							referrerPolicy="no-referrer"
						/>
					</div>
					<div className="relative z-10">
						<h2 className="text-4xl md:text-6xl font-bold mb-8 tracking-tighter">
							Spremni da počnete?
						</h2>
						<p className="text-xl text-neutral-400 mb-12 max-w-xl mx-auto">
							Pridružite se hiljadama parova koji koriste 
							našu platformu da podele svoj veliki dan.
						</p>
						<button
							onClick={() => navigate("/dashboard")}
							className="px-12 py-6 bg-white text-black rounded-full font-bold text-xl hover:scale-105 transition-transform shadow-2xl"
						>
							Započni
						</button>
					</div>
				</div>
			</section>

			{/* Footer */}
			<footer className="py-20 border-t border-neutral-100 px-6">
				<div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
					<div className="flex items-center gap-2">
						<div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white font-bold">
							E
						</div>
						<span className="font-bold text-xl tracking-tighter">
							Petar Škrbić
						</span>
					</div>
					<p className="text-neutral-400 text-sm">
						© 2026 Petar Škrbić. Sva prava zadržana.
					</p>
					{/* <div className="flex gap-8 text-sm font-medium text-neutral-400">
						<a href="#" className="hover:text-black transition-colors">
							Privasi
						</a>
						<a href="#" className="hover:text-black transition-colors">
							Ketentuan
						</a>
						<a href="#" className="hover:text-black transition-colors">
							Kontak
						</a>
					</div> */}
				</div>
			</footer>
		</div>
	);
}
