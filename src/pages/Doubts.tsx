import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { MessageCircle, Send, Plus, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

type FilterType = "all" | "open" | "resolved" | "mine";

const Doubts = () => {
  const { user, role, profile } = useAuth();
  const { language } = useLanguage();
  const [doubts, setDoubts] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [newDoubt, setNewDoubt] = useState({ title: "", description: "", subject_tag: "" });
  const [replyText, setReplyText] = useState<{ [key: string]: string }>({});
  const [replies, setReplies] = useState<{ [key: string]: any[] }>({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("all");
  const [replyProfiles, setReplyProfiles] = useState<Record<string, string>>({});

  const isHi = language === "hi";

  const fetchDoubts = async () => {
    let query = supabase.from("doubts").select("*").order("created_at", { ascending: false });
    if (filter === "open") query = query.eq("status", "open");
    else if (filter === "resolved") query = query.eq("status", "resolved");
    else if (filter === "mine" && user) query = query.eq("user_id", user.id);

    const res = await query;
    setDoubts(res.data || []);
    setLoading(false);
  };

  useEffect(() => { fetchDoubts(); }, [filter]);

  const handleCreateDoubt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const insertData: any = { user_id: user.id, title: newDoubt.title, description: newDoubt.description };
    if (newDoubt.subject_tag) insertData.subject_tag = newDoubt.subject_tag;

    const { error } = await supabase.from("doubts").insert(insertData);
    if (error) toast.error(isHi ? "डाउट पोस्ट नहीं हुआ" : "Failed to post doubt");
    else {
      toast.success(isHi ? "डाउट पोस्ट हो गया!" : "Doubt posted successfully!");
      setNewDoubt({ title: "", description: "", subject_tag: "" });
      setShowForm(false);
      fetchDoubts();
    }
  };

  const fetchReplies = async (doubtId: string) => {
    if (replies[doubtId]) return;
    const res = await supabase.from("doubt_replies").select("*").eq("doubt_id", doubtId).order("created_at");
    const repliesData = res.data || [];
    setReplies((prev) => ({ ...prev, [doubtId]: repliesData }));

    // Fetch profile names for replies
    const userIds = [...new Set(repliesData.map((r: any) => r.user_id))];
    for (const uid of userIds) {
      if (!replyProfiles[uid]) {
        const { data } = await supabase.from("profiles").select("full_name").eq("user_id", uid).single();
        if (data) setReplyProfiles((prev) => ({ ...prev, [uid]: data.full_name }));
      }
    }
  };

  const handleReply = async (doubtId: string) => {
    if (!user || !replyText[doubtId]?.trim()) return;
    const { error } = await supabase.from("doubt_replies").insert({ doubt_id: doubtId, user_id: user.id, content: replyText[doubtId] });
    if (error) toast.error(isHi ? "जवाब नहीं दे पाए" : "Failed to reply");
    else {
      setReplyText((prev) => ({ ...prev, [doubtId]: "" }));
      const res = await supabase.from("doubt_replies").select("*").eq("doubt_id", doubtId).order("created_at");
      setReplies((prev) => ({ ...prev, [doubtId]: res.data || [] }));
      toast.success(isHi ? "जवाब भेजा गया!" : "Reply posted!");

      // Mark as resolved if teacher/admin replies
      if (role === "teacher" || role === "admin") {
        await supabase.from("doubts").update({ status: "resolved" }).eq("id", doubtId);
        fetchDoubts();
      }
    }
  };

  const subjectTags = ["Math", "Science", "English", "Hindi", "Social Studies", "Computer", "GK", "Other"];

  const filters: { key: FilterType; label: string }[] = [
    { key: "all", label: isHi ? "सभी" : "All" },
    { key: "open", label: isHi ? "खुले" : "Open" },
    { key: "resolved", label: isHi ? "हल किए" : "Resolved" },
    ...(role === "student" ? [{ key: "mine" as FilterType, label: isHi ? "मेरे" : "Mine" }] : []),
  ];

  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-6">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-lg sm:text-2xl font-extrabold font-heading text-foreground">
              {isHi ? "डाउट" : "Doubts"}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {isHi ? "डाउट पूछें और हल करें" : "Ask and solve doubts"}
            </p>
          </div>
          {role === "student" && (
            <Button onClick={() => setShowForm(!showForm)} className="gradient-navy text-white border-0 hover:opacity-90 text-xs sm:text-sm h-8 sm:h-9 px-3 shrink-0">
              <Plus className="w-3.5 h-3.5 mr-1" /> {isHi ? "पूछें" : "Ask"}
            </Button>
          )}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => { setFilter(f.key); setLoading(true); }}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                filter === f.key
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {showForm && (
          <form onSubmit={handleCreateDoubt} className="bg-card rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-border space-y-3 sm:space-y-4">
            <Input placeholder={isHi ? "डाउट का शीर्षक" : "Doubt title"} required value={newDoubt.title} onChange={(e) => setNewDoubt({ ...newDoubt, title: e.target.value })} className="text-sm h-9" />
            <Textarea placeholder={isHi ? "अपना डाउट विस्तार से लिखें" : "Describe your doubt in detail"} required value={newDoubt.description} onChange={(e) => setNewDoubt({ ...newDoubt, description: e.target.value })} className="text-sm" />
            <div className="flex flex-wrap gap-1.5">
              {subjectTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setNewDoubt({ ...newDoubt, subject_tag: tag })}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-medium transition-all ${
                    newDoubt.subject_tag === tag
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="gradient-navy text-white border-0 hover:opacity-90 text-xs sm:text-sm h-8 sm:h-9">
                {isHi ? "डाउट पोस्ट करें" : "Post Doubt"}
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="text-xs sm:text-sm h-8 sm:h-9">
                {isHi ? "रद्द करें" : "Cancel"}
              </Button>
            </div>
          </form>
        )}

        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => <Skeleton key={i} className="h-32 rounded-xl" />)}
          </div>
        ) : doubts.length === 0 ? (
          <div className="text-center py-12 sm:py-16 bg-card rounded-xl sm:rounded-2xl border border-border">
            <MessageCircle className="w-10 h-10 sm:w-12 sm:h-12 mx-auto text-muted-foreground mb-3" />
            <h3 className="text-sm sm:text-lg font-bold text-foreground mb-1">
              {isHi ? "कोई डाउट नहीं" : "No Doubts Yet"}
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {isHi ? "अभी कोई डाउट पोस्ट नहीं हुआ" : "No doubts have been posted yet"}
            </p>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {doubts.map((doubt) => (
              <div key={doubt.id} className="bg-card rounded-xl sm:rounded-2xl p-3.5 sm:p-5 border border-border hover:border-primary/20 transition-colors">
                <div className="flex items-start justify-between mb-1.5 sm:mb-2 gap-2">
                  <div className="min-w-0">
                    <h3 className="font-bold text-foreground text-sm sm:text-base line-clamp-2">{doubt.title}</h3>
                    {(doubt as any).subject_tag && (
                      <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-full bg-primary/10 text-primary mt-1 inline-block">
                        {(doubt as any).subject_tag}
                      </span>
                    )}
                  </div>
                  <span className={`text-[10px] sm:text-xs font-medium px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full shrink-0 ${
                    doubt.status === "open" ? "bg-amber-500/10 text-amber-600" : "bg-emerald-500/10 text-emerald-600"
                  }`}>
                    {doubt.status === "open" ? (isHi ? "खुला" : "Open") : (isHi ? "हल किया" : "Resolved")}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3 line-clamp-3">{doubt.description}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground mb-2 sm:mb-3">
                  {new Date(doubt.created_at).toLocaleDateString("en-IN")}
                </p>

                <button onClick={() => fetchReplies(doubt.id)} className="text-xs sm:text-sm text-primary hover:underline mb-2 sm:mb-3">
                  {isHi ? "जवाब देखें" : "View Replies"}
                </button>

                {replies[doubt.id] && (
                  <div className="space-y-2 mt-2 sm:mt-3 pl-3 sm:pl-4 border-l-2 border-primary/20">
                    {replies[doubt.id].map((reply) => (
                      <div key={reply.id} className="bg-muted rounded-lg sm:rounded-xl p-2.5 sm:p-3">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="text-[10px] font-semibold text-primary">
                            {replyProfiles[reply.user_id] || (isHi ? "उपयोगकर्ता" : "User")}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-foreground">{reply.content}</p>
                        <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                          {new Date(reply.created_at).toLocaleDateString("en-IN")}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-2 mt-2.5 sm:mt-3">
                  <Input
                    placeholder={isHi ? "अपना जवाब लिखें..." : "Type your reply..."}
                    value={replyText[doubt.id] || ""}
                    onChange={(e) => setReplyText({ ...replyText, [doubt.id]: e.target.value })}
                    className="flex-1 text-xs sm:text-sm h-8 sm:h-9"
                  />
                  <Button size="icon" onClick={() => handleReply(doubt.id)}
                    className="gradient-navy text-white border-0 hover:opacity-90 w-8 h-8 sm:w-9 sm:h-9 shrink-0">
                    <Send className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Doubts;
