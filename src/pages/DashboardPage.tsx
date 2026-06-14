import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
	Heart,
	Plus,
	Globe,
	EyeOff,
	ExternalLink,
	Copy,
	LogOut,
	Loader2,
	Calendar,
	Sparkles,
	LayoutDashboard,
	AlertCircle,
	Pencil,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import supabase from "../utils/supabase";

interface WeddingSummary {
	id: string;
	slug: string;
	bride_name: string;
	groom_name: string;
	date: string;
	is_published: boolean;
	created_at: string;
}

export default function DashboardPage() {
	const { user, logout } = useAuth();
	const navigate = useNavigate();
	const [weddings, setWeddings] = useState<WeddingSummary[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [togglingId, setTogglingId] = useState<string | null>(null);
	const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

	const fetchWeddings = async () => {
		if (!user) return;
		try {
			const { data, error: dbError } = await supabase
				.from("weddings")
				.select(
					"id, slug, bride_name, groom_name, date, is_published, created_at",
				)
				.eq("user_id", user.id)
				.order("created_at", { ascending: false });

			if (dbError) throw new Error(dbError.message);
			setWeddings(data ?? []);
		} catch (err: any) {
			setError(err.message);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchWeddings();
	}, [user]);

	const handleTogglePublish = async (id: string, currentStatus: boolean) => {
		setTogglingId(id);
		try {
			const { error: dbError } = await supabase
				.from("weddings")
				.update({ is_published: !currentStatus })
				.eq("id", id);

			if (dbError) throw new Error(dbError.message);
			setWeddings((prev) =>
				prev.map((w) =>
					w.id === id ? { ...w, is_published: !currentStatus } : w,
				),
			);
		} catch (err: any) {
			alert(err.message);
		} finally {
			setTogglingId(null);
		}
	};

	const copyLink = (slug: string) => {
		navigator.clipboard.writeText(`${window.location.origin}/w/${slug}`);
		setCopiedSlug(slug);
		setTimeout(() => setCopiedSlug(null), 2000);
	};

	const handleLogout = async () => {
		await logout();
		navigate("/");
	};

	return (
		<div className="min-h-screen bg-[#0f0c1a] text-white">
			{/* Ambient blobs */}
			<div className="fixed top-0 left-0 w-[500px] h-[500px] bg-purple-700/20 rounded-full blur-3xl pointer-events-none -translate-x-1/2 -translate-y-1/2" />
			<div className="fixed bottom-0 right-0 w-[500px] h-[500px] bg-rose-700/15 rounded-full blur-3xl pointer-events-none translate-x-1/2 translate-y-1/2" />

			{/* Navbar */}
			<header className="relative z-10 border-b border-white/10 bg-white/5 backdrop-blur-xl">
				<div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
					<Link to="/" className="flex items-center gap-2">
						<div className="w-9 h-9 bg-linear-to-br from-rose-400 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
							<Heart className="w-4 h-4 text-white fill-white" />
						</div>
						<span className="font-bold text-xl tracking-tight">
							Sprovodadžija
						</span>
					</Link>

					<div className="flex items-center gap-4">
						<div className="hidden sm:flex items-center gap-2 text-sm text-white/50">
							<LayoutDashboard className="w-4 h-4" />
							<span>{user?.email}</span>
						</div>
						<Link
							to="/create"
							id="dashboard-create-btn"
							className="flex items-center gap-2 px-4 py-2 bg-linear-to-r from-rose-500 to-purple-600 text-white text-sm font-bold rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-rose-500/20"
						>
							<Plus className="w-4 h-4" /> Nova pozivnica
						</Link>
						<button
							onClick={handleLogout}
							id="dashboard-logout"
							className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 text-white/60 text-sm font-medium rounded-xl hover:bg-white/10 transition-colors"
						>
							<LogOut className="w-4 h-4" />
							<span className="hidden sm:inline">Odjavi se</span>
						</button>
					</div>
				</div>
			</header>

			{/* Main */}
			<main className="relative z-10 max-w-6xl mx-auto px-6 py-12">
				{/* Header */}
				<motion.div
					initial={{ y: 16, opacity: 0 }}
					animate={{ y: 0, opacity: 1 }}
					className="mb-10"
				>
					<div className="flex items-center gap-2 mb-2">
						<Sparkles className="w-5 h-5 text-rose-400" />
						<span className="text-rose-400 text-sm font-semibold uppercase tracking-wider">
							Moje pozivnice
						</span>
					</div>
					<h1 className="text-4xl font-bold mb-2">Kontrolna tabla</h1>
					<p className="text-white/50">
						Upravljajte stranicama za venčanja, kontrolišite vidljivost i delite linkove.
					</p>
				</motion.div>

				{/* Content */}
				{isLoading ? (
					<div className="flex flex-col items-center justify-center py-32 gap-4 text-white/40">
						<Loader2 className="w-8 h-8 animate-spin" />
						<span>Učitavanje stranica…</span>
					</div>
				) : error ? (
					<div className="flex items-center gap-3 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400">
						<AlertCircle className="w-5 h-5 shrink-0" />
						{error}
					</div>
				) : weddings.length === 0 ? (
					<motion.div
						initial={{ opacity: 0, scale: 0.97 }}
						animate={{ opacity: 1, scale: 1 }}
						className="flex flex-col items-center justify-center py-32 text-center"
					>
						<div className="w-20 h-20 bg-white/5 border border-white/10 rounded-3xl flex items-center justify-center mb-6">
							<Heart className="w-10 h-10 text-white/20" />
						</div>
						<h2 className="text-2xl font-bold mb-3">Još uvek nema pozivnica</h2>
						<p className="text-white/40 mb-8 max-w-sm">
							Još uvek niste kreirali nijednu stranicu za venčanje. 
							Počnite da pravite prelepu pozivnicu za vaš poseban dan.
						</p>
						<Link
							to="/create"
							className="flex items-center gap-2 px-6 py-3 bg-linear-to-r from-rose-500 to-purple-600 text-white font-bold rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-rose-500/20"
						>
							<Plus className="w-5 h-5" /> Napravite prvu pozivnicu
						</Link>
					</motion.div>
				) : (
					<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
						<AnimatePresence>
							{weddings.map((w, i) => (
								<motion.div
									key={w.id}
									initial={{ y: 20, opacity: 0 }}
									animate={{ y: 0, opacity: 1 }}
									transition={{ delay: i * 0.06 }}
									className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/8 hover:border-white/20 transition-all"
								>
									{/* Status badge */}
									<div className="flex items-start justify-between mb-4">
										<span
											className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${
												w.is_published
													? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
													: "bg-white/5 text-white/40 border border-white/10"
											}`}
										>
											{w.is_published ? (
												<>
													<Globe className="w-3 h-3" /> Objavljeno
												</>
											) : (
												<>
													<EyeOff className="w-3 h-3" /> Offline
												</>
											)}
										</span>

										<a
											href={`/w/${w.slug}`}
											target="_blank"
											rel="noopener noreferrer"
											className="p-1.5 text-white/30 hover:text-white/80 transition-colors"
											title="Open page"
										>
											<ExternalLink className="w-4 h-4" />
										</a>
									</div>

									{/* Names */}
									<h3 className="text-lg font-bold mb-1">
										{w.bride_name} <span className="text-rose-400">&</span>{" "}
										{w.groom_name}
									</h3>

									{/* Slug */}
									<p className="text-white/40 text-xs font-mono mb-1 truncate">
										/w/{w.slug}
									</p>

									{/* Date */}
									{w.date && (
										<div className="flex items-center gap-1.5 text-white/40 text-xs mb-5">
											<Calendar className="w-3 h-3" />
											{new Date(w.date).toLocaleDateString("en-US", {
												day: "numeric",
												month: "long",
												year: "numeric",
											})}
										</div>
									)}

									{/* Actions */}
									<div className="flex items-center gap-2">
										{/* Edit button */}
										<button
											id={`edit-${w.id}`}
											onClick={() => navigate(`/edit/${w.id}`)}
											className="p-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-all"
											title="Modifikuj pozivnicu"
										>
											<Pencil className="w-4 h-4" />
										</button>

										{/* Publish toggle */}
										<button
											id={`toggle-publish-${w.id}`}
											onClick={() => handleTogglePublish(w.id, w.is_published)}
											disabled={togglingId === w.id}
											className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all ${
												w.is_published
													? "bg-white/5 border border-white/10 text-white/60 hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-400"
													: "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20"
											} disabled:opacity-50`}
										>
											{togglingId === w.id ? (
												<Loader2 className="w-3 h-3 animate-spin" />
											) : w.is_published ? (
												<>
													<EyeOff className="w-3 h-3" /> Odjavi
												</>
											) : (
												<>
													<Globe className="w-3 h-3" /> Objavi
												</>
											)}
										</button>

										{/* Copy link */}
										<button
											id={`copy-link-${w.id}`}
											onClick={() => copyLink(w.slug)}
											className="p-2 bg-white/5 border border-white/10 text-white/40 hover:text-white/80 hover:bg-white/10 rounded-lg transition-all"
											title="Copy link"
										>
											{copiedSlug === w.slug ? (
												<span className="text-emerald-400 text-xs font-bold px-1">
													✓
												</span>
											) : (
												<Copy className="w-4 h-4" />
											)}
										</button>
									</div>
								</motion.div>
							))}
						</AnimatePresence>

						{/* Add new card */}
						<motion.div
							initial={{ y: 20, opacity: 0 }}
							animate={{ y: 0, opacity: 1 }}
							transition={{ delay: weddings.length * 0.06 }}
						>
							<Link
								to="/create"
								className="flex flex-col items-center justify-center h-full min-h-[200px] border-2 border-dashed border-white/10 rounded-2xl text-white/30 hover:border-rose-500/40 hover:text-rose-400/70 hover:bg-rose-500/5 transition-all group"
							>
								<Plus className="w-8 h-8 mb-3 group-hover:scale-110 transition-transform" />
								<span className="text-sm font-semibold">Nova pozivnica</span>
							</Link>
						</motion.div>
					</div>
				)}
			</main>
		</div>
	);
}
