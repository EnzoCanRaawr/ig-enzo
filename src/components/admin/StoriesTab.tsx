import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Upload, Trash2, Clock } from "lucide-react";
import { toast } from "sonner";

type Story = {
  id: string;
  media_url: string;
  media_type: string;
  caption: string | null;
  created_at: string;
  expires_at: string;
};

const StoriesTab = ({
  uploadImage,
}: {
  uploadImage: (file: File, folder: string) => Promise<string | null>;
}) => {
  const [stories, setStories] = useState<Story[]>([]);
  const [caption, setCaption] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [mediaType, setMediaType] = useState("image");
  const [uploading, setUploading] = useState(false);

  const fetchStories = useCallback(async () => {
    const { data } = await supabase
      .from("stories" as any)
      .select("*")
      .order("created_at", { ascending: false });
    setStories((data as unknown as Story[]) || []);
  }, []);

  useEffect(() => {
    fetchStories();
  }, [fetchStories]);

  const handleUpload = async (file: File) => {
    setUploading(true);
    const url = await uploadImage(file, "stories");
    if (url) {
      setMediaUrl(url);
      setMediaType(file.type.startsWith("video") ? "video" : "image");
    }
    setUploading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mediaUrl) {
      toast.error("Upload a photo or video first");
      return;
    }
    const { error } = await supabase
      .from("stories" as any)
      .insert({ media_url: mediaUrl, media_type: mediaType, caption } as any);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Story posted — live for 24 hours");
    setMediaUrl("");
    setCaption("");
    setMediaType("image");
    fetchStories();
  };

  const handleDelete = async (id: string) => {
    await supabase.from("stories" as any).delete().eq("id", id);
    toast.success("Story removed");
    fetchStories();
  };

  const isExpired = (s: Story) => new Date(s.expires_at) < new Date();

  return (
    <div className="space-y-10">
      <form onSubmit={handleSubmit} className="space-y-5 border border-white/10 p-6">
        <h3 className="text-xs uppercase tracking-[0.2em] text-white/40">New Story</h3>

        <div className="flex items-center gap-4">
          {mediaUrl &&
            (mediaType === "video" ? (
              <video src={mediaUrl} className="w-16 h-16 object-cover" muted />
            ) : (
              <img src={mediaUrl} alt="Story preview" className="w-16 h-16 object-cover" />
            ))}
          <label className="flex items-center gap-2 border border-white/20 px-4 py-3 text-sm text-white/60 cursor-pointer hover:border-white/40 transition-colors">
            <Upload className="w-4 h-4" />
            {uploading ? "Uploading..." : "Upload photo or video"}
            <input
              type="file"
              accept="image/*,video/*"
              onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
              className="hidden"
            />
          </label>
        </div>

        <input
          type="text"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Caption (optional)"
          className="w-full bg-transparent border border-white/20 px-4 py-3 text-sm text-white focus:border-white/50 outline-none"
        />

        <button
          type="submit"
          className="border border-white/40 px-8 py-3 text-sm tracking-[0.2em] uppercase hover:bg-white/10 transition-colors"
        >
          Post Story
        </button>
      </form>

      <div className="space-y-3">
        {stories.map((s) => (
          <div key={s.id} className="flex items-center gap-4 border border-white/10 p-3">
            {s.media_type === "video" ? (
              <video src={s.media_url} className="w-14 h-14 object-cover" muted />
            ) : (
              <img src={s.media_url} alt={s.caption || "Story"} className="w-14 h-14 object-cover" />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white truncate">{s.caption || "Untitled story"}</p>
              <p className="text-xs text-white/40 flex items-center gap-1.5 mt-1">
                <Clock className="w-3 h-3" />
                {isExpired(s) ? "Expired" : `Expires ${new Date(s.expires_at).toLocaleString()}`}
              </p>
            </div>
            <button
              onClick={() => handleDelete(s.id)}
              className="text-white/30 hover:text-red-400 transition-colors"
              aria-label="Delete story"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
        {stories.length === 0 && (
          <p className="text-white/30 text-sm text-center py-10 border border-white/10">No stories yet.</p>
        )}
      </div>
    </div>
  );
};

export default StoriesTab;
