import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { MessageCircle, Send, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const Doubts = () => {
  const { user, role } = useAuth();
  const [doubts, setDoubts] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [newDoubt, setNewDoubt] = useState({ title: "", description: "" });
  const [replyText, setReplyText] = useState<{ [key: string]: string }>({});
  const [replies, setReplies] = useState<{ [key: string]: any[] }>({});
  const [loading, setLoading] = useState(true);

  const fetchDoubts = async () => {
    const res = await supabase.from("doubts").select("*").order("created_at", { ascending: false });
    setDoubts(res.data || []);
    setLoading(false);
  };

  useEffect(() => { fetchDoubts(); }, []);

  const handleCreateDoubt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const { error } = await supabase.from("doubts").insert({ user_id: user.id, title: newDoubt.title, description: newDoubt.description });
    if (error) toast.error("Failed to post doubt");
    else { toast.success("Doubt posted successfully!"); setNewDoubt({ title: "", description: "" }); setShowForm(false); fetchDoubts(); }
  };

  const fetchReplies = async (doubtId: string) => {
    if (replies[doubtId]) return;
    const res = await supabase.from("doubt_replies").select("*").eq("doubt_id", doubtId).order("created_at");
    setReplies((prev) => ({ ...prev, [doubtId]: res.data || [] }));
  };

  const handleReply = async (doubtId: string) => {
    if (!user || !replyText[doubtId]?.trim()) return;
    const { error } = await supabase.from("doubt_replies").insert({ doubt_id: doubtId, user_id: user.id, content: replyText[doubtId] });
    if (error) toast.error("Failed to reply");
    else {
      setReplyText((prev) => ({ ...prev, [doubtId]: "" }));
      const res = await supabase.from("doubt_replies").select("*").eq("doubt_id", doubtId).order("created_at");
      setReplies((prev) => ({ ...prev, [doubtId]: res.data || [] }));
      toast.success("Reply posted!");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-6">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-lg sm:text-2xl font-extrabold font-heading text-foreground">Doubts</h1>
            <p className="text-xs sm:text-sm text-muted-foreground">Ask and solve doubts</p>
          </div>
          {role === "student" && (
            <Button onClick={() => setShowForm(!showForm)} className="gradient-navy text-white border-0 hover:opacity-90 text-xs sm:text-sm h-8 sm:h-9 px-3 shrink-0">
              <Plus className="w-3.5 h-3.5 mr-1" /> Ask
            </Button>
          )}
        </div>

        {showForm && (
          <form onSubmit={handleCreateDoubt} className="bg-card rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-border space-y-3 sm:space-y-4">
            <Input placeholder="Doubt title" required value={newDoubt.title} onChange={(e) => setNewDoubt({ ...newDoubt, title: e.target.value })} className="text-sm h-9" />
            <Textarea placeholder="Describe your doubt in detail" required value={newDoubt.description} onChange={(e) => setNewDoubt({ ...newDoubt, description: e.target.value })} className="text-sm" />
            <div className="flex gap-2">
              <Button type="submit" className="gradient-navy text-white border-0 hover:opacity-90 text-xs sm:text-sm h-8 sm:h-9">Post Doubt</Button>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="text-xs sm:text-sm h-8 sm:h-9">Cancel</Button>
            </div>
          </form>
        )}

        {loading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin w-7 h-7 border-4 border-gold border-t-transparent rounded-full" />
          </div>
        ) : doubts.length === 0 ? (
          <div className="text-center py-12 sm:py-16 bg-card rounded-xl sm:rounded-2xl border border-border">
            <MessageCircle className="w-10 h-10 sm:w-12 sm:h-12 mx-auto text-muted-foreground mb-3" />
            <h3 className="text-sm sm:text-lg font-bold text-foreground mb-1">No Doubts Yet</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">No doubts have been posted yet</p>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {doubts.map((doubt) => (
              <div key={doubt.id} className="bg-card rounded-xl sm:rounded-2xl p-3.5 sm:p-5 border border-border hover:border-gold/20 transition-colors">
                <div className="flex items-start justify-between mb-1.5 sm:mb-2 gap-2">
                  <h3 className="font-bold text-foreground text-sm sm:text-base line-clamp-2">{doubt.title}</h3>
                  <span className={`text-[10px] sm:text-xs font-medium px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full shrink-0 ${
                    doubt.status === "open" ? "bg-gold/10 text-gold-warm" : "bg-emerald/10 text-emerald"
                  }`}>
                    {doubt.status}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3 line-clamp-3">{doubt.description}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground mb-2 sm:mb-3">
                  {new Date(doubt.created_at).toLocaleDateString("en-IN")}
                </p>

                <button onClick={() => fetchReplies(doubt.id)} className="text-xs sm:text-sm text-gold-warm hover:underline mb-2 sm:mb-3">
                  View Replies
                </button>

                {replies[doubt.id] && (
                  <div className="space-y-2 mt-2 sm:mt-3 pl-3 sm:pl-4 border-l-2 border-gold/20">
                    {replies[doubt.id].map((reply) => (
                      <div key={reply.id} className="bg-muted rounded-lg sm:rounded-xl p-2.5 sm:p-3">
                        <p className="text-xs sm:text-sm text-foreground">{reply.content}</p>
                        <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                          {new Date(reply.created_at).toLocaleDateString("en-IN")}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-2 mt-2.5 sm:mt-3">
                  <Input placeholder="Type your reply..." value={replyText[doubt.id] || ""}
                    onChange={(e) => setReplyText({ ...replyText, [doubt.id]: e.target.value })}
                    className="flex-1 text-xs sm:text-sm h-8 sm:h-9" />
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
