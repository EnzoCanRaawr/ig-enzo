import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Camera, Briefcase, User, Upload, Trash2, Plus, LogOut, GripVertical, LayoutDashboard, Eye, EyeOff, MessageSquare, Heart, Reply, Image, Settings, Video } from "lucide-react";
import { toast } from "sonner";

type VisualPhoto = {
  id: string;
  title: string;
  description: string;
  image_url: string;
  display_order: number;
  is_enabled: boolean;
  comments_enabled: boolean;
};

type WorksProject = {
  id: string;
  title: string;
  description: string;
  tags: string[];
  link: string;
  display_order: number;
  image_url: string | null;
  category: string;
};

const PROJECT_CATEGORIES = ["project", "hackathon", "experiment", "client"] as const;

type AboutContent = {
  id: string;
  bio_paragraphs: string[];
  skills: { title: string; skills: string[] }[];
  profile_image_url: string;
  email: string;
  tagline: string;
};

type Comment = {
  id: string;
  photo_id: string;
  author_name: string;
  content: string;
  created_at: string;
  admin_reply: string | null;
  admin_reply_at: string | null;
};

const Admin = () => {
  const [session, setSession] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSignup, setIsSignup] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "visual" | "works" | "about" | "settings">("overview");
  const [siteSettings, setSiteSettings] = useState<{ id: string; hero_bg_type: string; hero_bg_url: string | null } | null>(null);

  const [photos, setPhotos] = useState<VisualPhoto[]>([]);
  const [projects, setProjects] = useState<WorksProject[]>([]);
  const [aboutData, setAboutData] = useState<AboutContent | null>(null);
  const [commentCounts, setCommentCounts] = useState<Record<string, number>>({});
  const [reactionCounts, setReactionCounts] = useState<Record<string, number>>({});
  const [allComments, setAllComments] = useState<Comment[]>([]);
  const [uploading, setUploading] = useState(false);

  const checkAdmin = useCallback(async (userId: string) => {
    const { data } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });
    return !!data;
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        checkAdmin(session.user.id).then(setIsAdmin);
      } else {
        setIsAdmin(false);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) checkAdmin(session.user.id).then(setIsAdmin);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [checkAdmin]);

  const fetchData = useCallback(async () => {
    const [photosRes, projectsRes, aboutRes, commentsRes, reactionsRes, settingsRes] = await Promise.all([
      supabase.from("visual_photos").select("*").order("display_order"),
      supabase.from("works_projects").select("*").order("display_order"),
      supabase.from("about_content").select("*").limit(1).single(),
      supabase.from("photo_comments").select("*").order("created_at", { ascending: true }),
      supabase.from("photo_reactions").select("photo_id"),
      supabase.from("site_settings").select("*").limit(1).single(),
    ]);
    if (photosRes.data) setPhotos(photosRes.data as unknown as VisualPhoto[]);
    if (projectsRes.data) setProjects(projectsRes.data as unknown as WorksProject[]);
    if (aboutRes.data) setAboutData(aboutRes.data as unknown as AboutContent);
    if (commentsRes.data) setAllComments(commentsRes.data as unknown as Comment[]);
    if (settingsRes.data) setSiteSettings(settingsRes.data as any);

    const cc: Record<string, number> = {};
    (commentsRes.data || []).forEach((c: any) => { cc[c.photo_id] = (cc[c.photo_id] || 0) + 1; });
    setCommentCounts(cc);

    const rc: Record<string, number> = {};
    (reactionsRes.data || []).forEach((r: any) => { rc[r.photo_id] = (rc[r.photo_id] || 0) + 1; });
    setReactionCounts(rc);
  }, []);

  useEffect(() => {
    if (isAdmin) fetchData();
  }, [isAdmin, fetchData]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (isSignup) {
      const { error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin } });
      if (error) setError(error.message);
      else toast.success("Account created!");
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setIsAdmin(false);
  };

  const uploadImage = async (file: File, folder: string): Promise<string | null> => {
    const ext = file.name.split(".").pop();
    const path = `${folder}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("portfolio-media").upload(path, file);
    if (error) { toast.error("Upload failed: " + error.message); return null; }
    const { data } = supabase.storage.from("portfolio-media").getPublicUrl(path);
    return data.publicUrl;
  };

  const handleAddPhoto = async (file: File, title: string, description: string) => {
    setUploading(true);
    const url = await uploadImage(file, "visual");
    if (url) {
      await supabase.from("visual_photos").insert({ title, description, image_url: url, display_order: photos.length } as any);
      toast.success("Photo added");
      fetchData();
    }
    setUploading(false);
  };

  const handleDeletePhoto = async (id: string, imageUrl: string) => {
    const path = imageUrl.split("/portfolio-media/")[1];
    if (path) await supabase.storage.from("portfolio-media").remove([path]);
    await supabase.from("visual_photos").delete().eq("id", id);
    toast.success("Photo deleted");
    fetchData();
  };

  const handleTogglePhoto = async (id: string, field: "is_enabled" | "comments_enabled", value: boolean) => {
    await supabase.from("visual_photos").update({ [field]: value } as any).eq("id", id);
    toast.success("Updated");
    fetchData();
  };

  const handleReplyComment = async (commentId: string, reply: string) => {
    await supabase.from("photo_comments").update({ admin_reply: reply, admin_reply_at: new Date().toISOString() } as any).eq("id", commentId);
    toast.success("Reply sent");
    fetchData();
  };

  const handleAddProject = async (project: Omit<WorksProject, "id" | "display_order">) => {
    await supabase.from("works_projects").insert({ ...project, display_order: projects.length } as any);
    toast.success("Project added");
    fetchData();
  };

  const handleDeleteProject = async (id: string) => {
    await supabase.from("works_projects").delete().eq("id", id);
    toast.success("Project deleted");
    fetchData();
  };

  const handleUpdateProject = async (id: string, updates: Partial<WorksProject>) => {
    await supabase.from("works_projects").update(updates as any).eq("id", id);
    toast.success("Project updated");
    fetchData();
  };

  const handleSaveAbout = async (data: Omit<AboutContent, "id">) => {
    if (aboutData?.id) {
      await supabase.from("about_content").update(data as any).eq("id", aboutData.id);
    } else {
      await supabase.from("about_content").insert(data as any);
    }
    toast.success("About content saved");
    fetchData();
  };

  if (loading) {
    return (
      <section className="min-h-screen bg-neutral-950 text-white flex items-center justify-center">
        <p className="text-white/50 text-sm">Loading...</p>
      </section>
    );
  }

  if (!session || !isAdmin) {
    return (
      <section className="min-h-screen bg-neutral-950 text-white flex items-center justify-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-sm px-8">
          <h2 className="text-2xl font-display font-bold mb-8 tracking-wide">Admin</h2>
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="text-xs text-white/40 uppercase tracking-[0.2em] block mb-2">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent border border-white/20 px-4 py-3 text-sm text-white focus:border-white/50 outline-none transition-colors" />
            </div>
            <div>
              <label className="text-xs text-white/40 uppercase tracking-[0.2em] block mb-2">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent border border-white/20 px-4 py-3 text-sm text-white focus:border-white/50 outline-none transition-colors" />
            </div>
            {error && <p className="text-red-400 text-xs">{error}</p>}
            {session && !isAdmin && <p className="text-red-400 text-xs">Access denied. Admin role required.</p>}
            <button type="submit" className="w-full border border-white/40 py-3 text-sm tracking-[0.2em] uppercase hover:bg-white/10 transition-colors">
              {isSignup ? "Sign Up" : "Login"}
            </button>
            <button type="button" onClick={() => { setIsSignup(!isSignup); setError(""); }}
              className="w-full text-xs text-white/40 py-2 hover:text-white/60 transition-colors">
              {isSignup ? "Already have an account? Login" : "Need an account? Sign Up"}
            </button>
          </form>
        </motion.div>
      </section>
    );
  }

  const totalComments = Object.values(commentCounts).reduce((a, b) => a + b, 0);
  const totalReactions = Object.values(reactionCounts).reduce((a, b) => a + b, 0);
  const enabledPhotos = photos.filter((p) => p.is_enabled).length;

  return (
    <section className="min-h-screen bg-neutral-950 text-white pt-24 pb-16">
      <div className="max-w-5xl mx-auto px-8 md:px-12">
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-2xl font-display font-bold tracking-wide">Dashboard</h2>
          <button onClick={handleLogout} className="flex items-center gap-2 text-xs text-white/40 border border-white/20 px-4 py-2 hover:text-white/70 hover:border-white/40 transition-colors uppercase tracking-[0.2em]">
            <LogOut className="w-3 h-3" /> Logout
          </button>
        </div>

        <div className="flex gap-1 mb-10 border-b border-white/10 overflow-x-auto">
          {[
            { key: "overview" as const, label: "Overview", icon: LayoutDashboard },
            { key: "visual" as const, label: "Visual", icon: Camera },
            { key: "works" as const, label: "Works", icon: Briefcase },
            { key: "about" as const, label: "About", icon: User },
            { key: "settings" as const, label: "Settings", icon: Settings },
          ].map((tab) => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-5 py-3 text-xs tracking-[0.15em] uppercase transition-colors border-b-2 -mb-[1px] whitespace-nowrap ${
                activeTab === tab.key ? "text-white border-white" : "text-white/40 border-transparent hover:text-white/60"
              }`}>
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "overview" && (
          <OverviewTab
            photos={photos} projects={projects} aboutData={aboutData}
            totalComments={totalComments} totalReactions={totalReactions} enabledPhotos={enabledPhotos}
          />
        )}
        {activeTab === "visual" && (
          <VisualTab photos={photos} onAdd={handleAddPhoto} onDelete={handleDeletePhoto}
            onToggle={handleTogglePhoto} uploading={uploading}
            commentCounts={commentCounts} reactionCounts={reactionCounts}
            allComments={allComments} onReply={handleReplyComment} />
        )}
        {activeTab === "works" && <WorksTab projects={projects} onAdd={handleAddProject} onDelete={handleDeleteProject} onUpdate={handleUpdateProject} uploadImage={uploadImage} />}
        {activeTab === "about" && <AboutTab data={aboutData} onSave={handleSaveAbout} uploadImage={uploadImage} />}
        {activeTab === "settings" && <SettingsTab settings={siteSettings} uploadImage={uploadImage} onSaved={fetchData} />}
      </div>
    </section>
  );
};

// Overview Tab
const OverviewTab = ({ photos, projects, aboutData, totalComments, totalReactions, enabledPhotos }: {
  photos: VisualPhoto[];
  projects: WorksProject[];
  aboutData: AboutContent | null;
  totalComments: number;
  totalReactions: number;
  enabledPhotos: number;
}) => {
  const stats = [
    { label: "Total Photos", value: photos.length, icon: Camera },
    { label: "Visible Photos", value: enabledPhotos, icon: Eye },
    { label: "Projects", value: projects.length, icon: Briefcase },
    { label: "Comments", value: totalComments, icon: MessageSquare },
    { label: "Reactions", value: totalReactions, icon: Heart },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="border border-white/10 p-5 text-center">
            <stat.icon className="w-5 h-5 text-white/30 mx-auto mb-3" />
            <p className="text-2xl font-display font-bold text-white mb-1">{stat.value}</p>
            <p className="text-[10px] text-white/40 uppercase tracking-[0.2em]">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="border border-white/10 p-6">
        <h3 className="text-xs text-white/40 uppercase tracking-[0.2em] mb-6">Profile Overview</h3>
        <div className="flex items-start gap-6">
          {aboutData?.profile_image_url && (
            <img src={aboutData.profile_image_url} alt="Profile" className="w-20 h-20 object-cover grayscale flex-shrink-0" />
          )}
          <div className="flex-1 min-w-0">
            <h4 className="text-lg font-display font-bold text-white mb-1">Shawn Enzo J. Gimena</h4>
            <p className="text-xs text-white/40 mb-3">{aboutData?.tagline || "Developer. Student. Creator."}</p>
            <p className="text-xs text-white/30">{aboutData?.email || "enzogimena.shawn@gmail.com"}</p>
            {aboutData?.bio_paragraphs?.[0] && (
              <p className="text-sm text-white/50 mt-3 line-clamp-2">{aboutData.bio_paragraphs[0]}</p>
            )}
          </div>
        </div>
      </div>

      {photos.length > 0 && (
        <div>
          <h3 className="text-xs text-white/40 uppercase tracking-[0.2em] mb-4">Recent Photos</h3>
          <div className="grid grid-cols-4 gap-3">
            {photos.slice(0, 4).map((photo) => (
              <div key={photo.id} className="relative aspect-square overflow-hidden border border-white/10">
                <img src={photo.image_url} alt={photo.title} className="w-full h-full object-cover" />
                {!photo.is_enabled && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <EyeOff className="w-4 h-4 text-white/40" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Visual Tab
const VisualTab = ({ photos, onAdd, onDelete, onToggle, uploading, commentCounts, reactionCounts, allComments, onReply }: {
  photos: VisualPhoto[];
  onAdd: (file: File, title: string, description: string) => Promise<void>;
  onDelete: (id: string, imageUrl: string) => Promise<void>;
  onToggle: (id: string, field: "is_enabled" | "comments_enabled", value: boolean) => Promise<void>;
  uploading: boolean;
  commentCounts: Record<string, number>;
  reactionCounts: Record<string, number>;
  allComments: Comment[];
  onReply: (commentId: string, reply: string) => Promise<void>;
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [expandedPhoto, setExpandedPhoto] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return toast.error("Select an image");
    await onAdd(file, title, description);
    setTitle("");
    setDescription("");
    setFile(null);
  };

  const handleReply = async (commentId: string) => {
    if (!replyText.trim()) return;
    await onReply(commentId, replyText.trim());
    setReplyText("");
    setReplyingTo(null);
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="border border-white/10 p-6 mb-8 space-y-4">
        <h3 className="text-xs text-white/40 uppercase tracking-[0.2em] mb-4">Add Photo</h3>
        <input type="text" placeholder="Photo title" value={title} onChange={(e) => setTitle(e.target.value)}
          className="w-full bg-transparent border border-white/20 px-4 py-3 text-sm text-white focus:border-white/50 outline-none" />
        <input type="text" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)}
          className="w-full bg-transparent border border-white/20 px-4 py-3 text-sm text-white focus:border-white/50 outline-none" />
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 border border-white/20 px-4 py-3 text-sm text-white/60 cursor-pointer hover:border-white/40 transition-colors flex-1">
            <Upload className="w-4 h-4" />
            {file ? file.name : "Choose image..."}
            <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} className="hidden" />
          </label>
          <button type="submit" disabled={uploading} className="border border-white/40 px-6 py-3 text-sm tracking-[0.15em] uppercase hover:bg-white/10 transition-colors disabled:opacity-30">
            {uploading ? "Uploading..." : "Add"}
          </button>
        </div>
      </form>

      <div className="space-y-3">
        {photos.map((photo) => {
          const photoComments = allComments.filter(c => c.photo_id === photo.id);
          return (
            <div key={photo.id} className={`border p-4 transition-colors ${photo.is_enabled ? "border-white/10" : "border-white/5 opacity-50"}`}>
              <div className="flex gap-4 items-start">
                <img src={photo.image_url} alt={photo.title} className="w-20 h-20 object-cover flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white font-medium truncate">{photo.title || "Untitled"}</p>
                  <p className="text-xs text-white/40 truncate mt-0.5">{photo.description || "No description"}</p>
                  <div className="flex items-center gap-4 mt-3 flex-wrap">
                    <button
                      onClick={() => onToggle(photo.id, "is_enabled", !photo.is_enabled)}
                      className={`flex items-center gap-1.5 text-[10px] uppercase tracking-wider transition-colors ${photo.is_enabled ? "text-green-400" : "text-white/30"}`}
                    >
                      {photo.is_enabled ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      {photo.is_enabled ? "Visible" : "Hidden"}
                    </button>
                    <button
                      onClick={() => onToggle(photo.id, "comments_enabled", !photo.comments_enabled)}
                      className={`flex items-center gap-1.5 text-[10px] uppercase tracking-wider transition-colors ${photo.comments_enabled ? "text-blue-400" : "text-white/30"}`}
                    >
                      <MessageSquare className="w-3 h-3" />
                      Comments {photo.comments_enabled ? "On" : "Off"}
                    </button>
                    <span className="flex items-center gap-1 text-[10px] text-white/30">
                      <Heart className="w-3 h-3" /> {reactionCounts[photo.id] || 0}
                    </span>
                    <button
                      onClick={() => setExpandedPhoto(expandedPhoto === photo.id ? null : photo.id)}
                      className="flex items-center gap-1 text-[10px] text-white/30 hover:text-white/60 transition-colors"
                    >
                      <MessageSquare className="w-3 h-3" /> {commentCounts[photo.id] || 0} comments
                    </button>
                  </div>
                </div>
                <button onClick={() => onDelete(photo.id, photo.image_url)} className="p-2 text-white/30 hover:text-red-400 transition-colors flex-shrink-0">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Expandable comments section */}
              {expandedPhoto === photo.id && photoComments.length > 0 && (
                <div className="mt-4 border-t border-white/10 pt-4 space-y-3">
                  <h4 className="text-[10px] text-white/40 uppercase tracking-[0.2em]">Comments</h4>
                  {photoComments.map((comment) => (
                    <div key={comment.id} className="border border-white/5 p-3 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-xs">
                            <span className="text-white/60 font-medium">{comment.author_name}</span>
                            <span className="text-white/20 ml-2">{new Date(comment.created_at).toLocaleDateString()}</span>
                          </p>
                          <p className="text-xs text-white/40 mt-1">{comment.content}</p>
                        </div>
                        {!comment.admin_reply && (
                          <button
                            onClick={() => { setReplyingTo(replyingTo === comment.id ? null : comment.id); setReplyText(""); }}
                            className="text-white/30 hover:text-white/60 transition-colors flex-shrink-0 p-1"
                          >
                            <Reply className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      {comment.admin_reply && (
                        <div className="ml-4 pl-3 border-l border-white/10">
                          <p className="text-[10px] text-white/30 mb-1">Admin reply · {comment.admin_reply_at ? new Date(comment.admin_reply_at).toLocaleDateString() : ""}</p>
                          <p className="text-xs text-white/50">{comment.admin_reply}</p>
                        </div>
                      )}

                      {replyingTo === comment.id && (
                        <div className="ml-4 flex gap-2">
                          <input
                            type="text"
                            placeholder="Write a reply..."
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleReply(comment.id)}
                            className="flex-1 bg-transparent border border-white/20 px-3 py-2 text-xs text-white focus:border-white/40 outline-none"
                            autoFocus
                          />
                          <button
                            onClick={() => handleReply(comment.id)}
                            className="border border-white/30 px-3 py-2 text-[10px] uppercase tracking-wider hover:bg-white/10 transition-colors"
                          >
                            Reply
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {photos.length === 0 && (
        <div className="text-center py-16 border border-white/10">
          <Camera className="w-10 h-10 text-white/20 mx-auto mb-4" />
          <p className="text-white/30 text-sm">No photos yet. Upload your first one above.</p>
        </div>
      )}
    </div>
  );
};

// Works Tab
const WorksTab = ({ projects, onAdd, onDelete, onUpdate, uploadImage }: {
  projects: WorksProject[];
  onAdd: (project: Omit<WorksProject, "id" | "display_order">) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onUpdate: (id: string, updates: Partial<WorksProject>) => Promise<void>;
  uploadImage: (file: File, folder: string) => Promise<string | null>;
}) => {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [link, setLink] = useState("");
  const [category, setCategory] = useState<string>("project");
  const [customCategory, setCustomCategory] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return toast.error("Title required");
    setUploading(true);
    let imageUrl: string | null = null;
    if (imageFile) {
      imageUrl = await uploadImage(imageFile, "works");
    }
    const finalCategory = (category === "__custom" ? customCategory.trim() : category) || "project";
    await onAdd({ title, description, tags: tags.split(",").map((t) => t.trim()).filter(Boolean), link, image_url: imageUrl, category: finalCategory });
    setTitle(""); setDescription(""); setTags(""); setLink(""); setImageFile(null); setCategory("project"); setCustomCategory("");
    setShowForm(false);
    setUploading(false);
  };

  const handleProjectImageUpload = async (projectId: string, file: File) => {
    const url = await uploadImage(file, "works");
    if (url) await onUpdate(projectId, { image_url: url } as any);
  };

  return (
    <div>
      <button onClick={() => setShowForm(!showForm)}
        className="flex items-center gap-2 border border-white/30 px-5 py-3 text-xs tracking-[0.15em] uppercase hover:bg-white/10 transition-colors mb-6">
        <Plus className="w-3.5 h-3.5" /> Add Project
      </button>

      {showForm && (
        <form onSubmit={handleSubmit} className="border border-white/10 p-6 mb-8 space-y-4">
          <input type="text" placeholder="Project title" value={title} onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-transparent border border-white/20 px-4 py-3 text-sm text-white focus:border-white/50 outline-none" />
          <input type="text" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-transparent border border-white/20 px-4 py-3 text-sm text-white focus:border-white/50 outline-none" />
          <input type="text" placeholder="Tags (comma separated)" value={tags} onChange={(e) => setTags(e.target.value)}
            className="w-full bg-transparent border border-white/20 px-4 py-3 text-sm text-white focus:border-white/50 outline-none" />
          <div className="flex gap-2">
            <select value={category} onChange={(e) => setCategory(e.target.value)}
              className="flex-1 bg-black border border-white/20 px-4 py-3 text-sm text-white focus:border-white/50 outline-none capitalize">
              {PROJECT_CATEGORIES.map((c) => (
                <option key={c} value={c} className="bg-black">{c}</option>
              ))}
              <option value="__custom" className="bg-black">Custom…</option>
            </select>
            {category === "__custom" && (
              <input type="text" placeholder="Custom category" value={customCategory} onChange={(e) => setCustomCategory(e.target.value)}
                className="flex-1 bg-transparent border border-white/20 px-4 py-3 text-sm text-white focus:border-white/50 outline-none" />
            )}
          </div>
          <input type="url" placeholder="Project URL" value={link} onChange={(e) => setLink(e.target.value)}
            className="w-full bg-transparent border border-white/20 px-4 py-3 text-sm text-white focus:border-white/50 outline-none" />
          <label className="flex items-center gap-2 border border-white/20 px-4 py-3 text-sm text-white/60 cursor-pointer hover:border-white/40 transition-colors">
            <Image className="w-4 h-4" />
            {imageFile ? imageFile.name : "Project image (optional)"}
            <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} className="hidden" />
          </label>
          <div className="flex gap-3">
            <button type="submit" disabled={uploading} className="border border-white/40 px-6 py-3 text-xs tracking-[0.15em] uppercase hover:bg-white/10 transition-colors disabled:opacity-30">
              {uploading ? "Saving..." : "Save"}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="px-6 py-3 text-xs text-white/40 tracking-[0.15em] uppercase hover:text-white/60 transition-colors">Cancel</button>
          </div>
        </form>
      )}

      <div className="space-y-2">
        {projects.map((project, i) => (
          <div key={project.id} className="border border-white/10 p-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <GripVertical className="w-4 h-4 text-white/20 flex-shrink-0" />
              {project.image_url && (
                <img src={project.image_url} alt={project.title} className="w-14 h-14 object-cover flex-shrink-0 border border-white/10" />
              )}
              <div className="min-w-0 flex-1">
                <p className="text-sm text-white font-medium truncate">{String(i + 1).padStart(2, "0")} — {project.title}</p>
                <p className="text-xs text-white/40 truncate">{project.description}</p>
                <div className="flex gap-2 mt-1 items-center flex-wrap">
                  <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 border border-white/20 text-white/60">
                    {project.category || "project"}
                  </span>
                  {project.tags?.map((tag) => (
                    <span key={tag} className="text-[10px] text-white/30 uppercase tracking-wider">{tag}</span>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <select
                value={project.category || "project"}
                onChange={(e) => onUpdate(project.id, { category: e.target.value } as any)}
                className="bg-black border border-white/20 px-2 py-1 text-[10px] uppercase tracking-wider text-white/70 focus:border-white/50 outline-none"
              >
                {PROJECT_CATEGORIES.map((c) => (
                  <option key={c} value={c} className="bg-black">{c}</option>
                ))}
                {project.category && !PROJECT_CATEGORIES.includes(project.category as any) && (
                  <option value={project.category} className="bg-black">{project.category}</option>
                )}
              </select>
              <label className="p-2 text-white/30 hover:text-white/60 transition-colors cursor-pointer">
                <Image className="w-4 h-4" />
                <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && handleProjectImageUpload(project.id, e.target.files[0])} className="hidden" />
              </label>
              <button onClick={() => onDelete(project.id)} className="p-2 text-white/30 hover:text-red-400 transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {projects.length === 0 && (
        <div className="text-center py-16 border border-white/10">
          <Briefcase className="w-10 h-10 text-white/20 mx-auto mb-4" />
          <p className="text-white/30 text-sm">No projects yet.</p>
        </div>
      )}
    </div>
  );
};

// About Tab
const AboutTab = ({ data, onSave, uploadImage }: {
  data: AboutContent | null;
  onSave: (data: Omit<AboutContent, "id">) => Promise<void>;
  uploadImage: (file: File, folder: string) => Promise<string | null>;
}) => {
  const [bio, setBio] = useState("");
  const [emailVal, setEmailVal] = useState("");
  const [tagline, setTagline] = useState("");
  const [skills, setSkills] = useState<{ title: string; skills: string[] }[]>([]);
  const [profileUrl, setProfileUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (data && !initialized) {
      setBio(data.bio_paragraphs?.join("\n\n") || "");
      setEmailVal(data.email || "");
      setTagline(data.tagline || "");
      setSkills(data.skills || []);
      setProfileUrl(data.profile_image_url || "");
      setInitialized(true);
    }
  }, [data, initialized]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave({ bio_paragraphs: bio.split("\n\n").filter(Boolean), email: emailVal, tagline, skills: skills as any, profile_image_url: profileUrl });
  };

  const handleProfileUpload = async (file: File) => {
    setUploading(true);
    const url = await uploadImage(file, "about");
    if (url) setProfileUrl(url);
    setUploading(false);
  };

  const addSkillCategory = () => setSkills([...skills, { title: "", skills: [] }]);

  const updateSkillCategory = (index: number, field: string, value: any) => {
    const updated = [...skills];
    if (field === "title") updated[index].title = value;
    if (field === "skills") updated[index].skills = value.split(",").map((s: string) => s.trim()).filter(Boolean);
    setSkills(updated);
  };

  const removeSkillCategory = (index: number) => setSkills(skills.filter((_, i) => i !== index));

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="text-xs text-white/40 uppercase tracking-[0.2em] block mb-2">Profile Photo</label>
        <div className="flex items-center gap-4">
          {profileUrl && <img src={profileUrl} alt="Profile" className="w-16 h-16 object-cover grayscale" />}
          <label className="flex items-center gap-2 border border-white/20 px-4 py-3 text-sm text-white/60 cursor-pointer hover:border-white/40 transition-colors">
            <Upload className="w-4 h-4" />
            {uploading ? "Uploading..." : "Upload photo"}
            <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && handleProfileUpload(e.target.files[0])} className="hidden" />
          </label>
        </div>
      </div>

      <div>
        <label className="text-xs text-white/40 uppercase tracking-[0.2em] block mb-2">Tagline</label>
        <input type="text" value={tagline} onChange={(e) => setTagline(e.target.value)} placeholder="Developer. Student. Creator."
          className="w-full bg-transparent border border-white/20 px-4 py-3 text-sm text-white focus:border-white/50 outline-none" />
      </div>

      <div>
        <label className="text-xs text-white/40 uppercase tracking-[0.2em] block mb-2">Email</label>
        <input type="email" value={emailVal} onChange={(e) => setEmailVal(e.target.value)}
          className="w-full bg-transparent border border-white/20 px-4 py-3 text-sm text-white focus:border-white/50 outline-none" />
      </div>

      <div>
        <label className="text-xs text-white/40 uppercase tracking-[0.2em] block mb-2">Bio (separate paragraphs with blank line)</label>
        <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={10}
          className="w-full bg-transparent border border-white/20 px-4 py-3 text-sm text-white focus:border-white/50 outline-none resize-none" />
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <label className="text-xs text-white/40 uppercase tracking-[0.2em]">Skill Categories</label>
          <button type="button" onClick={addSkillCategory} className="flex items-center gap-1 text-xs text-white/40 hover:text-white/60 transition-colors">
            <Plus className="w-3 h-3" /> Add Category
          </button>
        </div>
        {skills.map((cat, i) => (
          <div key={i} className="border border-white/10 p-4 mb-3 space-y-3">
            <div className="flex items-center justify-between">
              <input type="text" placeholder="Category title" value={cat.title} onChange={(e) => updateSkillCategory(i, "title", e.target.value)}
                className="bg-transparent border border-white/20 px-3 py-2 text-sm text-white focus:border-white/50 outline-none flex-1 mr-3" />
              <button type="button" onClick={() => removeSkillCategory(i)} className="text-white/30 hover:text-red-400 transition-colors">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
            <input type="text" placeholder="Skills (comma separated)" value={cat.skills.join(", ")} onChange={(e) => updateSkillCategory(i, "skills", e.target.value)}
              className="w-full bg-transparent border border-white/20 px-3 py-2 text-sm text-white focus:border-white/50 outline-none" />
          </div>
        ))}
      </div>

      <button type="submit" className="border border-white/40 px-8 py-3 text-sm tracking-[0.2em] uppercase hover:bg-white/10 transition-colors">
        Save About
      </button>
    </form>
  );
};

// Settings Tab
const SettingsTab = ({ settings, uploadImage, onSaved }: {
  settings: { id: string; hero_bg_type: string; hero_bg_url: string | null } | null;
  uploadImage: (file: File, folder: string) => Promise<string | null>;
  onSaved: () => void;
}) => {
  const [bgType, setBgType] = useState(settings?.hero_bg_type || "image");
  const [bgUrl, setBgUrl] = useState(settings?.hero_bg_url || "");
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    const url = await uploadImage(file, "backgrounds");
    if (url) setBgUrl(url);
    setUploading(false);
  };

  const handleSave = async () => {
    if (!settings?.id) return;
    await supabase.from("site_settings").update({
      hero_bg_type: bgType,
      hero_bg_url: bgUrl || null,
      updated_at: new Date().toISOString(),
    } as any).eq("id", settings.id);
    toast.success("Background settings saved");
    onSaved();
  };

  return (
    <div className="space-y-8">
      <div className="border border-white/10 p-6 space-y-6">
        <h3 className="text-xs text-white/40 uppercase tracking-[0.2em] mb-4">Hero Background</h3>

        <div>
          <label className="text-xs text-white/40 uppercase tracking-[0.2em] block mb-3">Type</label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setBgType("image")}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs tracking-[0.15em] uppercase border transition-colors ${
                bgType === "image" ? "border-white text-white" : "border-white/20 text-white/40 hover:border-white/40"
              }`}
            >
              <Image className="w-3.5 h-3.5" /> Image
            </button>
            <button
              type="button"
              onClick={() => setBgType("video")}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs tracking-[0.15em] uppercase border transition-colors ${
                bgType === "video" ? "border-white text-white" : "border-white/20 text-white/40 hover:border-white/40"
              }`}
            >
              <Video className="w-3.5 h-3.5" /> Video
            </button>
          </div>
        </div>

        <div>
          <label className="text-xs text-white/40 uppercase tracking-[0.2em] block mb-2">
            Upload {bgType === "video" ? "Video" : "Image"}
          </label>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 px-4 py-2.5 border border-white/20 text-xs text-white/50 hover:border-white/40 hover:text-white/70 cursor-pointer transition-colors">
              <Upload className="w-3.5 h-3.5" />
              {uploading ? "Uploading..." : "Choose File"}
              <input
                type="file"
                accept={bgType === "video" ? "video/*" : "image/*"}
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
              />
            </label>
          </div>
        </div>

        <div>
          <label className="text-xs text-white/40 uppercase tracking-[0.2em] block mb-2">Or paste URL</label>
          <input
            type="text"
            value={bgUrl}
            onChange={(e) => setBgUrl(e.target.value)}
            placeholder={bgType === "video" ? "https://example.com/video.mp4" : "https://example.com/image.jpg"}
            className="w-full bg-transparent border border-white/20 px-4 py-3 text-sm text-white focus:border-white/50 outline-none"
          />
        </div>

        {bgUrl && (
          <div>
            <label className="text-xs text-white/40 uppercase tracking-[0.2em] block mb-2">Preview</label>
            {bgType === "video" ? (
              <video src={bgUrl} className="w-full max-w-md aspect-video object-cover border border-white/10" autoPlay muted loop playsInline />
            ) : (
              <img src={bgUrl} alt="Preview" className="w-full max-w-md aspect-video object-cover border border-white/10" />
            )}
          </div>
        )}

        <button
          type="button"
          onClick={handleSave}
          className="border border-white/40 px-8 py-3 text-sm tracking-[0.2em] uppercase hover:bg-white/10 transition-colors"
        >
          Save Background
        </button>
      </div>
    </div>
  );
};

export default Admin;
