import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useParams, Link as RouterLink } from "react-router-dom";
import { Wedding, THEMES, MUSIC_TRACKS } from "../types";
import WeddingPageView from "../components/WeddingPageView";
import { motion, AnimatePresence } from "motion/react";
import {
	ChevronRight,
	ChevronLeft,
	Send,
	Eye,
	Edit3,
	CheckCircle,
	Copy,
	Upload,
	Link,
	Loader2,
	X,
	LayoutDashboard,
	Save,
} from "lucide-react";
import { uploadHeroImage } from "../utils/uploadImage";
import { useAuth } from "../context/AuthContext";
import supabase from "../utils/supabase";
import { nanoid } from "nanoid";

export default function CreatePage() {
	const navigate = useNavigate();
	const { id: editId } = useParams<{ id?: string }>();
	const isEditMode = Boolean(editId);
	const { user } = useAuth();
	const [step, setStep] = useState(1);
	const [isPublishing, setIsPublishing] = useState(false);
	const [isSaved, setIsSaved] = useState(false);
	const [savedSlug, setSavedSlug] = useState<string | null>(null);
	const [publishError, setPublishError] = useState<string | null>(null);
	const [showPreview, setShowPreview] = useState(false);
	const [heroInputMode, setHeroInputMode] = useState<"upload" | "url">(
		"upload",
	);
	const [isUploadingHero, setIsUploadingHero] = useState(false);
	const [uploadError, setUploadError] = useState<string | null>(null);
	const [customSlug, setCustomSlug] = useState("");
	const [isLoadingEdit, setIsLoadingEdit] = useState(isEditMode);
	const [loadError, setLoadError] = useState<string | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const previewPanelRef = useRef<HTMLDivElement>(null);
	const [phoneScale, setPhoneScale] = useState(1);

	// Auto-scale the phone preview to fit the right panel
	useEffect(() => {
		const panel = previewPanelRef.current;
		if (!panel) return;
		const PHONE_W = 390 + 24; // phone width + border
		const PADDING = 64; // px-8 * 2
		const computeScale = () => {
			const available = panel.clientWidth - PADDING;
			setPhoneScale(Math.min(1, available / PHONE_W));
		};
		computeScale();
		const ro = new ResizeObserver(computeScale);
		ro.observe(panel);
		return () => ro.disconnect();
	}, []);

	// Load existing wedding data in edit mode
	useEffect(() => {
		if (!isEditMode || !editId || !user) return;
		const loadWedding = async () => {
			try {
				const { data, error: dbError } = await supabase
					.from("weddings")
					.select("*")
					.eq("id", editId)
					.eq("user_id", user.id)
					.single();
				if (dbError) throw new Error(dbError.message);
				if (!data) throw new Error("Wedding not found.");
				setFormData({
					brideName: data.bride_name ?? "",
					groomName: data.groom_name ?? "",
					date: data.date ?? "",
					time: data.time ?? "",
					venueName: data.venue_name ?? "",
					venueAddress: data.venue_address ?? "",
					venueMapsUrl: data.venue_maps_url ?? "",
					tagline: data.tagline ?? "",
					loveStory: data.love_story ?? "",
					theme: data.theme ?? "pastel",
					fontStyle: data.font_style ?? "serif",
					musicId: data.music_id ?? "romantic-piano",
					showCountdown: data.show_countdown ?? true,
					rsvpDeadline: data.rsvp_deadline ?? "",
					heroImage: data.hero_image ?? "",
					id: data.id,
					slug: data.slug,
					user_id: data.user_id,
					is_published: data.is_published,
				});
				setSavedSlug(data.slug);
			} catch (err: any) {
				setLoadError(err.message);
			} finally {
				setIsLoadingEdit(false);
			}
		};
		loadWedding();
	}, [isEditMode, editId, user]);

	const handleFileUpload = async (file: File) => {
		if (!file.type.startsWith("image/")) {
			setUploadError("Please select a valid image file.");
			return;
		}
		setIsUploadingHero(true);
		setUploadError(null);
		try {
			const publicUrl = await uploadHeroImage(file);
			setFormData((prev) => ({ ...prev, heroImage: publicUrl }));
		} catch (err: any) {
			setUploadError(err.message || "Failed to upload image.");
		} finally {
			setIsUploadingHero(false);
		}
	};

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault();
		const file = e.dataTransfer.files?.[0];
		if (file) handleFileUpload(file);
	};

	const [formData, setFormData] = useState<Wedding>({
		brideName: "",
		groomName: "",
		date: "",
		time: "",
		venueName: "",
		venueAddress: "",
		venueMapsUrl: "",
		tagline: "",
		loveStory: "",
		theme: "pastel",
		fontStyle: "serif",
		musicId: "romantic-piano",
		showCountdown: true,
		rsvpDeadline: "",
		heroImage: "",
	});

	const handlePublish = async () => {
		if (!user) return;
		setIsPublishing(true);
		setPublishError(null);
		try {
			if (isEditMode && editId) {
				// --- UPDATE existing record ---
				const { error: dbError } = await supabase
					.from("weddings")
					.update({
						bride_name: formData.brideName,
						groom_name: formData.groomName,
						date: formData.date,
						time: formData.time,
						venue_name: formData.venueName,
						venue_address: formData.venueAddress,
						venue_maps_url: formData.venueMapsUrl,
						tagline: formData.tagline,
						love_story: formData.loveStory,
						theme: formData.theme,
						font_style: formData.fontStyle,
						music_id: formData.musicId,
						show_countdown: formData.showCountdown,
						rsvp_deadline: formData.rsvpDeadline,
						hero_image: formData.heroImage,
					})
					.eq("id", editId)
					.eq("user_id", user.id);
				if (dbError) throw new Error(dbError.message);
				setIsSaved(true);
			} else {
				// --- INSERT new record ---
				let slug: string;
				if (customSlug.trim()) {
					slug = customSlug
						.trim()
						.toLowerCase()
						.replace(/\s+/g, "-")
						.replace(/[^a-z0-9-]/g, "");
					if (!slug) {
						setPublishError("Invalid custom slug.");
						return;
					}
					// Check uniqueness
					const { data: existing } = await supabase
						.from("weddings")
						.select("id")
						.eq("slug", slug)
						.maybeSingle();
					if (existing) {
						setPublishError(
							"This URL slug is already taken. Please choose another.",
						);
						return;
					}
				} else {
					slug =
						`${formData.brideName.toLowerCase()}-and-${formData.groomName.toLowerCase()}-${nanoid(6)}`.replace(
							/\s+/g,
							"-",
						);
				}

				const { error: dbError } = await supabase.from("weddings").insert({
					slug,
					user_id: user.id,
					is_published: true,
					bride_name: formData.brideName,
					groom_name: formData.groomName,
					date: formData.date,
					time: formData.time,
					venue_name: formData.venueName,
					venue_address: formData.venueAddress,
					venue_maps_url: formData.venueMapsUrl,
					tagline: formData.tagline,
					love_story: formData.loveStory,
					theme: formData.theme,
					font_style: formData.fontStyle,
					music_id: formData.musicId,
					show_countdown: formData.showCountdown,
					rsvp_deadline: formData.rsvpDeadline,
					hero_image: formData.heroImage,
				});

				if (dbError) throw new Error(dbError.message);
				setSavedSlug(slug);
				setIsSaved(true);
			}
		} catch (error: any) {
			console.error(error);
			setPublishError(error.message || "Failed to save wedding page.");
		} finally {
			setIsPublishing(false);
		}
	};

	const copyToClipboard = () => {
		const url = `${window.location.origin}/w/${savedSlug}`;
		navigator.clipboard.writeText(url);
		alert("Link copied to clipboard!");
	};

	// Loading spinner while fetching existing data in edit mode
	if (isLoadingEdit) {
		return (
			<div className="min-h-screen bg-neutral-50 flex items-center justify-center">
				<div className="flex flex-col items-center gap-4 text-neutral-400">
					<Loader2 className="w-10 h-10 animate-spin" />
					<span className="font-medium">Loading wedding data…</span>
				</div>
			</div>
		);
	}

	// Hard error loading the wedding to edit
	if (loadError) {
		return (
			<div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
				<div className="bg-white p-8 rounded-3xl shadow-2xl max-w-md w-full text-center">
					<p className="text-red-500 font-medium mb-4">{loadError}</p>
					<button
						onClick={() => navigate("/dashboard")}
						className="px-6 py-3 bg-black text-white rounded-full font-bold"
					>
						Back to Dashboard
					</button>
				</div>
			</div>
		);
	}

	if (isSaved) {
		return (
			<div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
				<motion.div
					initial={{ scale: 0.9, opacity: 0 }}
					animate={{ scale: 1, opacity: 1 }}
					className="bg-white p-8 md:p-12 rounded-3xl shadow-2xl max-w-lg w-full text-center"
				>
					<CheckCircle className="w-20 h-20 text-emerald-500 mx-auto mb-6" />
					<h1 className="text-3xl font-bold mb-4">
						{isEditMode ? "Izmene sačuvane!" : "Vaša stranica je objavljena!"}
					</h1>
					<p className="text-neutral-600 mb-8">
						{isEditMode
							? "Vaša stranica je uspešno ažurirana."
							: "Čestitamo! Vaša personalizovana pozivnica za venčanje je spremna da je podelite sa svojim voljenima."}
					</p>

					<div className="bg-neutral-100 p-4 rounded-xl flex items-center justify-between mb-8">
						<span className="text-sm font-mono truncate mr-4">
							{window.location.origin}/w/{savedSlug}
						</span>
						<button
							onClick={copyToClipboard}
							className="p-2 hover:bg-neutral-200 rounded-lg transition-colors"
						>
							<Copy className="w-5 h-5" />
						</button>
					</div>

					<div className="flex flex-col gap-4">
						<button
							onClick={() => navigate(`/w/${savedSlug}`)}
							className="w-full py-4 bg-black text-white rounded-full font-bold hover:bg-neutral-800 transition-colors"
						>
							Pogledaj stranicu
						</button>
						<button
							onClick={() => navigate("/dashboard")}
							className="w-full py-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-full font-bold hover:bg-emerald-100 transition-colors flex items-center justify-center gap-2"
						>
							<LayoutDashboard className="w-5 h-5" /> Vrati se na kontrolnu tablu
						</button>
						<button
							onClick={() => navigate("/")}
							className="w-full py-4 border border-neutral-200 rounded-full font-bold hover:bg-neutral-50 transition-colors"
						>
							Nazad na glavnu stranicu
						</button>
					</div>
				</motion.div>
			</div>
		);
	}

	return (
		<div className="h-screen bg-white flex flex-col md:flex-row overflow-hidden">
			{/* Form Side — independently scrollable */}
			<div
				className={`flex-1 flex flex-col h-screen overflow-y-auto bg-white ${showPreview ? "hidden md:flex" : "flex"}`}
			>
				<header className="p-6 border-b flex justify-between items-center sticky top-0 bg-white z-10">
					<div className="flex items-center gap-2">
						<div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white font-bold">
							E
						</div>
						<span className="font-bold text-xl tracking-tight">
							Sprovodadžija
						</span>
						{isEditMode && (
							<span className="ml-2 text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 border border-blue-100">
								Uređivanje
							</span>
						)}
					</div>
					<div className="flex items-center gap-4">
						<button
							onClick={() => setShowPreview(true)}
							className="md:hidden flex items-center gap-2 text-sm font-medium px-4 py-2 bg-neutral-100 rounded-full"
						>
							<Eye className="w-4 h-4" /> Preview
						</button>
						<div className="text-sm font-medium text-neutral-400">
							Korak {step} od 4
						</div>
					</div>
				</header>

				<main className="flex-1 p-6 md:p-12 max-w-2xl mx-auto w-full">
					<AnimatePresence mode="wait">
						{step === 1 && (
							<motion.div
								key="step1"
								initial={{ x: 20, opacity: 0 }}
								animate={{ x: 0, opacity: 1 }}
								exit={{ x: -20, opacity: 0 }}
								className="space-y-8"
							>
								<div>
									<h2 className="text-3xl font-bold mb-2">Osnovne informacije</h2>
									<p className="text-neutral-500">
										Hajde da počnemo sa osnovnim postavkama vašeg velikog dana.
									</p>
								</div>

								<div className="grid grid-cols-2 gap-6">
									<div className="space-y-2">
										<label className="text-sm font-bold uppercase tracking-wider text-neutral-400">
											Ime mlade
										</label>
										<input
											type="text"
											placeholder="Davorjanka"
											className="w-full p-4 bg-neutral-50 rounded-xl border border-neutral-100 focus:ring-2 focus:ring-black outline-none transition-all"
											value={formData.brideName}
											onChange={(e) =>
												setFormData({ ...formData, brideName: e.target.value })
											}
										/>
									</div>
									<div className="space-y-2">
										<label className="text-sm font-bold uppercase tracking-wider text-neutral-400">
											Ime mladoženje
										</label>
										<input
											type="text"
											placeholder="Čubrilo"
											className="w-full p-4 bg-neutral-50 rounded-xl border border-neutral-100 focus:ring-2 focus:ring-black outline-none transition-all"
											value={formData.groomName}
											onChange={(e) =>
												setFormData({ ...formData, groomName: e.target.value })
											}
										/>
									</div>
								</div>

								<div className="grid grid-cols-2 gap-6">
									<div className="space-y-2">
										<label className="text-sm font-bold uppercase tracking-wider text-neutral-400">
											Datum
										</label>
										<input
											type="date"
											className="w-full p-4 bg-neutral-50 rounded-xl border border-neutral-100 focus:ring-2 focus:ring-black outline-none transition-all"
											value={formData.date}
											onChange={(e) =>
												setFormData({ ...formData, date: e.target.value })
											}
										/>
									</div>
									<div className="space-y-2">
										<label className="text-sm font-bold uppercase tracking-wider text-neutral-400">
											Vreme
										</label>
										<input
											type="time"
											className="w-full p-4 bg-neutral-50 rounded-xl border border-neutral-100 focus:ring-2 focus:ring-black outline-none transition-all"
											value={formData.time}
											onChange={(e) =>
												setFormData({ ...formData, time: e.target.value })
											}
										/>
									</div>
								</div>

								<div className="space-y-4">
									<div className="space-y-2">
										<label className="text-sm font-bold uppercase tracking-wider text-neutral-400">
											Naziv lokala
										</label>
										<input
											type="text"
											placeholder="Restoran 27"
											className="w-full p-4 bg-neutral-50 rounded-xl border border-neutral-100 focus:ring-2 focus:ring-black outline-none transition-all"
											value={formData.venueName}
											onChange={(e) =>
												setFormData({ ...formData, venueName: e.target.value })
											}
										/>
									</div>
									<div className="space-y-2">
										<label className="text-sm font-bold uppercase tracking-wider text-neutral-400">
											Adresa Lokala
										</label>
										<input
											type="text"
											placeholder="Istarska 27, Senjak, Beograd"
											className="w-full p-4 bg-neutral-50 rounded-xl border border-neutral-100 focus:ring-2 focus:ring-black outline-none transition-all"
											value={formData.venueAddress}
											onChange={(e) =>
												setFormData({
													...formData,
													venueAddress: e.target.value,
												})
											}
										/>
									</div>
									<div className="space-y-2">
										<label className="text-sm font-bold uppercase tracking-wider text-neutral-400">
											URL Google Mape (Opciono)
										</label>
										<input
											type="url"
											placeholder="https://maps.google.com/..."
											className="w-full p-4 bg-neutral-50 rounded-xl border border-neutral-100 focus:ring-2 focus:ring-black outline-none transition-all"
											value={formData.venueMapsUrl}
											onChange={(e) =>
												setFormData({
													...formData,
													venueMapsUrl: e.target.value,
												})
											}
										/>
									</div>
								</div>
							</motion.div>
						)}

						{step === 2 && (
							<motion.div
								key="step2"
								initial={{ x: 20, opacity: 0 }}
								animate={{ x: 0, opacity: 1 }}
								exit={{ x: -20, opacity: 0 }}
								className="space-y-8"
							>
								<div>
									<h2 className="text-3xl font-bold mb-2">Naša ljubavna priča</h2>
									<p className="text-neutral-500">
										Podelite magiju kako ste se oboje upoznali i zaljubili.
									</p>
								</div>

								<div className="space-y-6">
									<div className="space-y-2">
										<label className="text-sm font-bold uppercase tracking-wider text-neutral-400">
											Slogan / Podnaslov
										</label>
										<input
											type="text"
											placeholder="Putovanje od hiljadu milja počinje jednim korakom..."
											className="w-full p-4 bg-neutral-50 rounded-xl border border-neutral-100 focus:ring-2 focus:ring-black outline-none transition-all"
											value={formData.tagline}
											onChange={(e) =>
												setFormData({ ...formData, tagline: e.target.value })
											}
										/>
									</div>
									<div className="space-y-2">
										<label className="text-sm font-bold uppercase tracking-wider text-neutral-400">
											Naša Priča
										</label>
										<textarea
											rows={6}
											placeholder="Sve je počelo kada smo..."
											className="w-full p-4 bg-neutral-50 rounded-xl border border-neutral-100 focus:ring-2 focus:ring-black outline-none transition-all resize-none"
											value={formData.loveStory}
											onChange={(e) =>
												setFormData({ ...formData, loveStory: e.target.value })
											}
										/>
									</div>
									<div className="space-y-3">
										<label className="text-sm font-bold uppercase tracking-wider text-neutral-400">
											Naslovna slika
										</label>

										<div className="flex gap-2">
											<button
												type="button"
												onClick={() => setHeroInputMode("upload")}
												className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${heroInputMode === "upload" ? "bg-black text-white" : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200"}`}
											>
												<Upload className="w-4 h-4" /> Dodaj sliku
											</button>
											<button
												type="button"
												onClick={() => setHeroInputMode("url")}
												className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${heroInputMode === "url" ? "bg-black text-white" : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200"}`}
											>
												<Link className="w-4 h-4" /> URL slike
											</button>
										</div>

										{heroInputMode === "upload" && (
											<div className="space-y-3">
												<div
													onDragOver={(e) => e.preventDefault()}
													onDrop={handleDrop}
													onClick={() => fileInputRef.current?.click()}
													className={`relative flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed rounded-xl cursor-pointer transition-all ${isUploadingHero ? "border-neutral-300 bg-neutral-50" : "border-neutral-200 hover:border-black hover:bg-neutral-50"}`}
												>
													{isUploadingHero ? (
														<>
															<Loader2 className="w-8 h-8 text-neutral-400 animate-spin" />
															<span className="text-sm text-neutral-500">
																Dodavanje...
															</span>
														</>
													) : (
														<>
															<Upload className="w-8 h-8 text-neutral-400" />
															<div className="text-center">
																<span className="text-sm font-medium text-neutral-700">
																	Klikni da dodaš sliku
																</span>
																<span className="text-sm text-neutral-400">
																	{" "}
																	Ili povuci sliku ovde
																</span>
															</div>
															<span className="text-xs text-neutral-400">
																PNG, JPG, WebP formati do 10MB
															</span>
														</>
													)}
													<input
														ref={fileInputRef}
														type="file"
														accept="image/*"
														className="hidden"
														onChange={(e) => {
															const file = e.target.files?.[0];
															if (file) handleFileUpload(file);
															e.target.value = "";
														}}
													/>
												</div>
												{uploadError && (
													<p className="text-xs text-red-500">{uploadError}</p>
												)}
											</div>
										)}

										{heroInputMode === "url" && (
											<input
												type="url"
												placeholder="https://images.unsplash.com/..."
												className="w-full p-4 bg-neutral-50 rounded-xl border border-neutral-100 focus:ring-2 focus:ring-black outline-none transition-all"
												value={formData.heroImage}
												onChange={(e) =>
													setFormData({
														...formData,
														heroImage: e.target.value,
													})
												}
											/>
										)}

										{formData.heroImage && (
											<div className="relative rounded-xl overflow-hidden border border-neutral-200">
												<img
													src={formData.heroImage}
													alt="Hero preview"
													className="w-full h-40 object-cover"
												/>
												<button
													type="button"
													onClick={() =>
														setFormData({ ...formData, heroImage: "" })
													}
													className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 rounded-full text-white transition-colors"
												>
													<X className="w-4 h-4" />
												</button>
											</div>
										)}

										<p className="text-xs text-neutral-400">
											Savet: Za najbolji izgled koristite visokokvalitetnu fotografiju pejzaža.
										</p>
									</div>
								</div>
							</motion.div>
						)}

						{step === 3 && (
							<motion.div
								key="step3"
								initial={{ x: 20, opacity: 0 }}
								animate={{ x: 0, opacity: 1 }}
								exit={{ x: -20, opacity: 0 }}
								className="space-y-8"
							>
								<div>
									<h2 className="text-3xl font-bold mb-2">Design & Music</h2>
									<p className="text-neutral-500">
										Podesite raspoloženje i estetiku za stranicu vašeg venčanja.
									</p>
								</div>

								<div className="space-y-8">
									<div className="space-y-4">
										<label className="text-sm font-bold uppercase tracking-wider text-neutral-400">
											Izaberite temu
										</label>
										<div className="grid grid-cols-2 gap-4">
											{(Object.keys(THEMES) as Array<keyof typeof THEMES>).map(
												(t) => (
													<button
														key={t}
														onClick={() =>
															setFormData({ ...formData, theme: t })
														}
														className={`p-4 rounded-2xl border-2 text-left transition-all ${formData.theme === t ? "border-black bg-neutral-50" : "border-neutral-100 hover:border-neutral-200"}`}
													>
														<div
															className={`w-full h-12 rounded-lg mb-3 ${THEMES[t].bg} border border-black/5`}
														/>
														<span className="font-bold capitalize">
															{t.replace("-", " ")}
														</span>
													</button>
												),
											)}
										</div>
									</div>

									<div className="space-y-4">
										<label className="text-sm font-bold uppercase tracking-wider text-neutral-400">
											Stil slova
										</label>
										<div className="flex gap-4">
											{["serif", "script", "sans"].map((f) => (
												<button
													key={f}
													onClick={() =>
														setFormData({ ...formData, fontStyle: f as any })
													}
													className={`flex-1 py-3 rounded-xl border-2 transition-all ${formData.fontStyle === f ? "border-black bg-neutral-50" : "border-neutral-100 hover:border-neutral-200"}`}
												>
													<span
														className={`capitalize ${f === "serif" ? "font-serif" : f === "script" ? "font-script" : "font-sans"}`}
													>
														{f}
													</span>
												</button>
											))}
										</div>
									</div>

									<div className="space-y-2">
										<label className="text-sm font-bold uppercase tracking-wider text-neutral-400">
											Muzika u pozadini
										</label>
										<select
											className="w-full p-4 bg-neutral-50 rounded-xl border border-neutral-100 focus:ring-2 focus:ring-black outline-none transition-all"
											value={formData.musicId}
											onChange={(e) =>
												setFormData({ ...formData, musicId: e.target.value })
											}
										>
											<option value="">No Music</option>
											{MUSIC_TRACKS.map((track) => (
												<option key={track.id} value={track.id}>
													{track.name}
												</option>
											))}
										</select>
									</div>
								</div>
							</motion.div>
						)}

						{step === 4 && (
							<motion.div
								key="step4"
								initial={{ x: 20, opacity: 0 }}
								animate={{ x: 0, opacity: 1 }}
								exit={{ x: -20, opacity: 0 }}
								className="space-y-8"
							>
								<div>
									<h2 className="text-3xl font-bold mb-2">Final Touches</h2>
									<p className="text-neutral-500">
										Skoro ste gotovi! Konfigurišite poslednje detalje za svoje goste.
									</p>
								</div>

								<div className="space-y-8">
									<div className="flex items-center justify-between p-4 bg-neutral-50 rounded-2xl">
										<div>
											<h4 className="font-bold">Odbrojavanje</h4>
											<p className="text-sm text-neutral-500">
												Prikažite odbrojavanje uživo do dana vašeg venčanja.
											</p>
										</div>
										<button
											onClick={() =>
												setFormData({
													...formData,
													showCountdown: !formData.showCountdown,
												})
											}
											className={`w-14 h-8 rounded-full transition-colors relative ${formData.showCountdown ? "bg-black" : "bg-neutral-200"}`}
										>
											<div
												className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${formData.showCountdown ? "left-7" : "left-1"}`}
											/>
										</button>
									</div>

									<div className="space-y-2">
										<label className="text-sm font-bold uppercase tracking-wider text-neutral-400">
											Rok za potvrdu dolaska
										</label>
										<input
											type="date"
											className="w-full p-4 bg-neutral-50 rounded-xl border border-neutral-100 focus:ring-2 focus:ring-black outline-none transition-all"
											value={formData.rsvpDeadline}
											onChange={(e) =>
												setFormData({
													...formData,
													rsvpDeadline: e.target.value,
												})
											}
										/>
									</div>

									{!isEditMode && (
										<div className="space-y-2">
											<label className="text-sm font-bold uppercase tracking-wider text-neutral-400">
												URL po vašoj želji{" "}
												<span className="normal-case text-neutral-300">
													(opciono)
												</span>
											</label>
											<div className="flex items-center bg-neutral-50 border border-neutral-100 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-black transition-all">
												<span className="pl-4 pr-2 text-sm text-neutral-400 whitespace-nowrap select-none">
													{window.location.host}/w/
												</span>
												<input
													id="custom-slug-input"
													type="text"
													placeholder={`${formData.brideName.toLowerCase() || "bride"}-and-${formData.groomName.toLowerCase() || "groom"}`}
													className="flex-1 py-4 pr-4 bg-transparent outline-none text-sm font-mono"
													value={customSlug}
													onChange={(e) =>
														setCustomSlug(
															e.target.value
																.toLowerCase()
																.replace(/[^a-z0-9-]/g, ""),
														)
													}
												/>
											</div>
											<p className="text-xs text-neutral-400">
												Ostavite prazno za automatsko generisanje. Samo mala slova, brojevi i crtice.
											</p>
										</div>
									)}
									{isEditMode && savedSlug && (
										<div className="space-y-2">
											<label className="text-sm font-bold uppercase tracking-wider text-neutral-400">
												URL Vaše stranice
											</label>
											<div className="flex items-center bg-neutral-50 border border-neutral-100 rounded-xl px-4 py-3">
												<span className="text-sm font-mono text-neutral-500 truncate">
													{window.location.host}/w/{savedSlug}
												</span>
											</div>
											<p className="text-xs text-neutral-400">
												URL se ne može promeniti nakon kreiranja stranice!
											</p>
										</div>
									)}

									{publishError && (
										<div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm">
											<span className="mt-0.5">⚠️</span>
											<span>{publishError}</span>
										</div>
									)}
								</div>
							</motion.div>
						)}
					</AnimatePresence>
				</main>

				<footer className="p-6 border-t bg-white sticky bottom-0 z-10">
					<div className="flex justify-between max-w-2xl mx-auto w-full">
						<button
							disabled={step === 1}
							onClick={() => setStep((s) => s - 1)}
							className="flex items-center gap-2 px-6 py-3 rounded-full font-bold disabled:opacity-30 hover:bg-neutral-100 transition-colors"
						>
							<ChevronLeft className="w-5 h-5" /> Nazad
						</button>

						{step < 4 ? (
							<button
								onClick={() => setStep((s) => s + 1)}
								className="flex items-center gap-2 px-8 py-3 bg-black text-white rounded-full font-bold hover:bg-neutral-800 transition-colors"
							>
								Sledeća strana <ChevronRight className="w-5 h-5" />
							</button>
						) : (
							<button
								onClick={handlePublish}
								disabled={isPublishing}
								className="flex items-center gap-2 px-8 py-3 bg-emerald-600 text-white rounded-full font-bold hover:bg-emerald-700 transition-colors disabled:opacity-50"
							>
								{isPublishing ? (
									isEditMode ? (
										"Čuvanje..."
									) : (
										"Objavljivanje..."
									)
								) : isEditMode ? (
									<>
										<Save className="w-5 h-5" /> Sačuvaj izmene
									</>
								) : (
									<>
										Objavi stranicu <Send className="w-5 h-5" />
									</>
								)}
							</button>
						)}
					</div>
				</footer>
			</div>

			{/* Preview Side */}
			<div
				ref={previewPanelRef}
				className={`flex-1 bg-neutral-100 relative h-screen overflow-y-auto flex-col ${showPreview ? "flex" : "hidden md:flex"}`}
			>
				<button
					onClick={() => setShowPreview(false)}
					className="md:hidden absolute top-6 left-6 z-50 p-3 bg-white rounded-full shadow-lg"
				>
					<Edit3 className="w-6 h-6" />
				</button>

				{/* Centering wrapper — gives the scaled phone its layout space */}
				<div className="w-full min-h-full flex items-start justify-center py-10 px-8">
					{/* Outer box reserves the scaled space so the panel scrolls correctly */}
					<div
						style={{
							width: 390 * phoneScale,
							height: 780 * phoneScale,
							flexShrink: 0,
						}}
					>
						{/* Phone shell — rendered at full 390×780, then scaled down */}
						<div
							className="relative shadow-2xl rounded-[2.8rem]"
							style={{
								width: 390,
								height: 780,
								border: "12px solid #111827",
								background: "#111827",
								transform: `scale(${phoneScale})`,
								transformOrigin: "top left",
							}}
						>
							{/* Notch */}
							<div
								className="absolute top-0 left-1/2 -translate-x-1/2 z-10 bg-[#111827] rounded-b-2xl"
								style={{ width: 100, height: 28 }}
							/>
							{/* Scrollable screen content */}
							<div
								className="w-full h-full rounded-4xl overflow-y-auto overflow-x-hidden"
								style={{ background: "#fff" }}
							>
								<WeddingPageView wedding={formData} isPreview />
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
