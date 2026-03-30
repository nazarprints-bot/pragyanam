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
    const { error } = await supabase.from("doubts").insert({
      user_id: user.id,
      title: newDoubt.title,
      description: newDoubt.description,
    });
    if (error) {
      toast.error("Failed to post doubt");
    } else {
      toast.success("Doubt posted! / डाउट पोस्ट हो गया!");
      setNewDoubt({ title: "", description: "" });
      setShowForm(false);
      fetchDoubts();
    }
  };

  const fetchReplies = async (doubtId: string) => {
    if (replies[doubtId]) return;
    const res = await supabase.from("doubt_replies").select("*").eq("doubt_id", doubtId).order("created_at");
    setReplies((prev) => ({ ...prev, [doubtId]: res.data || [] }));
  };

  const handleReply = async (doubtId: string) => {
    if (!user || !replyText[doubtId]?.trim()) return;
    const { error } = await supabase.from("doubt_replies").insert({
      doubt_id: doubtId,
      user_id: user.id,
      content: replyText[doubtId],
    });
    if (error) {
      toast.error("Failed to reply");
    } else {
      setReplyText((prev) => ({ ...prev, [doubtId]: "" }));
      const res = await supabase.from("doubt_replies").select("*").eq("doubt_id", doubtId).order("created_at");
      setReplies((prev) => ({ ...prev, [doubtId]: res.data || [] }));
      toast.success("Reply posted! / उत्तर पोस्ट हो गया!");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold font-heading text-foreground">
              Doubts / डाउट
            </h1>
            <p className="text-sm text-muted-foreground">Ask and solve doubts / डाउट पूछें और हल करें</p>
          </div>
          {role === "student" && (
            <Button onClick={() => setShowForm(!showForm)} className="gradient-navy text-white border-0 hover:opacity-90">
              <Plus className="w-4 h-4 mr-1" /> Ask Doubt
            </Button>
          )}
        </div>

        {showForm && (
          <form onSubmit={handleCreateDoubt} className="bg-card rounded-2xl p-6 border border-border space-y-4">
            <Input
              placeholder="Doubt title / डाउट का शीर्षक"
              required
              value={newDoubt.title}
              onChange={(e) => setNewDoubt({ ...newDoubt, title: e.target.value })}
            />
            <Textarea
              placeholder="Describe your doubt in detail / अपना डाउट विस्तार से बताएं"
              required
              value={newDoubt.description}
              onChange={(e) => setNewDoubt({ ...newDoubt, description: e.target.value })}
            />
            <div className="flex gap-2">
              <Button type="submit" className="gradient-navy text-white border-0 hover:opacity-90">Post Doubt</Button>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </form>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-gold border-t-transparent rounded-full" />
          </div>
        ) : doubts.length === 0 ? (
          <div className="text-center py-16 bg-card rounded-2xl border border-border">
            <MessageCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-bold text-foreground mb-1">No Doubts Yet</h3>
            <p className="text-sm text-muted-foreground">अभी कोई डाउट नहीं है</p>
          </div>
        ) : (
          <div className="space-y-4">
            {doubts.map((doubt) => (
              <div key={doubt.id} className="bg-card rounded-2xl p-5 border border-border hover:border-gold/20 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold text-foreground">{doubt.title}</h3>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                    doubt.status === "open" ? "bg-gold/10 text-gold-warm" : "bg-emerald/10 text-emerald"
                  }`}>
                    {doubt.status}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{doubt.description}</p>
                <p className="text-xs text-muted-foreground mb-3">
                  {new Date(doubt.created_at).toLocaleDateString("hi-IN")}
                </p>

                <button
                  onClick={() => fetchReplies(doubt.id)}
                  className="text-sm text-gold-warm hover:underline mb-3"
                >
                  View Replies / उत्तर देखें
                </button>

                {replies[doubt.id] && (
                  <div className="space-y-2 mt-3 pl-4 border-l-2 border-gold/20">
                    {replies[doubt.id].map((reply) => (
                      <div key={reply.id} className="bg-muted rounded-xl p-3">
                        <p className="text-sm text-foreground">{reply.content}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(reply.created_at).toLocaleDateString("hi-IN")}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-2 mt-3">
                  <Input
                    placeholder="Type reply... / उत्तर लिखें..."
                    value={replyText[doubt.id] || ""}
                    onChange={(e) => setReplyText({ ...replyText, [doubt.id]: e.target.value })}
                    className="flex-1"
                  />
                  <Button
                    size="icon"
                    onClick={() => handleReply(doubt.id)}
                    className="gradient-navy text-white border-0 hover:opacity-90"
                  >
                    <Send className="w-4 h-4" />
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
