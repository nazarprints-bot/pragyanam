import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Bell, Check, CheckCheck, Trash2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string | null;
  is_read: boolean | null;
  created_at: string;
  user_id: string;
}

const Notifications = () => {
  const { user, role } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");

  // Send notification form (admin/teacher only)
  const [sendOpen, setSendOpen] = useState(false);
  const [sendTitle, setSendTitle] = useState("");
  const [sendMessage, setSendMessage] = useState("");
  const [sendTarget, setSendTarget] = useState<"all_students" | "all_teachers" | "everyone">("all_students");
  const [sending, setSending] = useState(false);

  const fetchNotifications = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setNotifications(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchNotifications();

    if (!user) return;
    const channel = supabase
      .channel("notifications-page")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` },
        (payload) => {
          setNotifications((prev) => [payload.new as Notification, ...prev]);
          toast.info((payload.new as Notification).title);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const markAsRead = async (id: string) => {
    await supabase.from("notifications").update({ is_read: true }).eq("id", id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
  };

  const markAllRead = async () => {
    if (!user) return;
    await supabase.from("notifications").update({ is_read: true }).eq("user_id", user.id).eq("is_read", false);
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    toast.success("All notifications marked as read");
  };

  const handleSendNotification = async () => {
    if (!sendTitle.trim() || !sendMessage.trim()) {
      toast.error("Title and message are required");
      return;
    }
    setSending(true);
    try {
      // Get target users
      let targetRoles: ("admin" | "teacher" | "student")[] = [];
      if (sendTarget === "all_students") targetRoles = ["student"];
      else if (sendTarget === "all_teachers") targetRoles = ["teacher"];
      else targetRoles = ["student", "teacher", "admin"];

      const { data: targetUsers } = await supabase
        .from("user_roles")
        .select("user_id")
        .in("role", targetRoles);

      if (!targetUsers || targetUsers.length === 0) {
        toast.error("No users found for this target");
        setSending(false);
        return;
      }

      const notifs = targetUsers.map((u) => ({
        user_id: u.user_id,
        title: sendTitle,
        message: sendMessage,
        type: "alert" as string,
      }));

      // Insert in batches of 100
      for (let i = 0; i < notifs.length; i += 100) {
        const batch = notifs.slice(i, i + 100);
        const { error } = await supabase.from("notifications").insert(batch);
        if (error) throw error;
      }

      toast.success(`Notification sent to ${targetUsers.length} users!`);
      setSendTitle("");
      setSendMessage("");
      setSendOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to send");
    } finally {
      setSending(false);
    }
  };

  const typeIcon = (type: string | null) => {
    switch (type) {
      case "approval": return "✅";
      case "welcome": return "👋";
      case "test": return "📝";
      case "course": return "📚";
      case "alert": return "⚠️";
      default: return "🔔";
    }
  };

  const filtered = notifications.filter((n) => {
    if (filter === "unread") return !n.is_read;
    if (filter === "read") return n.is_read;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-lg sm:text-2xl font-extrabold font-heading text-foreground flex items-center gap-2">
              <Bell className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              Notifications / सूचनाएं
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}` : "All caught up!"}
            </p>
          </div>
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <Button variant="outline" size="sm" onClick={markAllRead} className="h-8 text-xs">
                <CheckCheck className="w-3.5 h-3.5 mr-1" /> Mark all read
              </Button>
            )}
            {(role === "admin" || role === "teacher") && (
              <Button size="sm" onClick={() => setSendOpen(!sendOpen)} className="h-8 text-xs bg-primary text-primary-foreground">
                <Send className="w-3.5 h-3.5 mr-1" /> Send Notification
              </Button>
            )}
          </div>
        </div>

        {/* Send Notification Form */}
        {sendOpen && (role === "admin" || role === "teacher") && (
          <div className="bg-card border border-border rounded-xl p-4 space-y-3 animate-slide-up">
            <h3 className="text-sm font-bold text-foreground">Send Notification / सूचना भेजें</h3>
            <Input
              placeholder="Notification title..."
              value={sendTitle}
              onChange={(e) => setSendTitle(e.target.value)}
              className="h-9 text-[13px]"
            />
            <Textarea
              placeholder="Write your message..."
              value={sendMessage}
              onChange={(e) => setSendMessage(e.target.value)}
              rows={3}
              className="text-[13px] resize-none"
            />
            <div className="flex items-center gap-3">
              <Select value={sendTarget} onValueChange={(v) => setSendTarget(v as any)}>
                <SelectTrigger className="h-9 text-[13px] w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all_students">All Students</SelectItem>
                  {role === "admin" && <SelectItem value="all_teachers">All Teachers</SelectItem>}
                  {role === "admin" && <SelectItem value="everyone">Everyone</SelectItem>}
                </SelectContent>
              </Select>
              <Button
                size="sm"
                onClick={handleSendNotification}
                disabled={sending}
                className="h-9 px-4 text-[13px] bg-primary text-primary-foreground"
              >
                {sending ? "Sending..." : "Send"}
              </Button>
            </div>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex gap-1 bg-muted rounded-lg p-1 w-fit">
          {(["all", "unread", "read"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                filter === f ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
              }`}
            >
              {f === "all" ? "All" : f === "unread" ? `Unread (${unreadCount})` : "Read"}
            </button>
          ))}
        </div>

        {/* Notification List */}
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin w-7 h-7 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-card rounded-xl border border-border p-10 text-center">
            <Bell className="w-10 h-10 mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-sm font-medium text-muted-foreground">
              {filter === "unread" ? "No unread notifications" : filter === "read" ? "No read notifications" : "No notifications yet"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">अभी कोई सूचना नहीं</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((n) => (
              <div
                key={n.id}
                className={`bg-card rounded-xl border border-border p-4 flex gap-3 transition-colors ${
                  !n.is_read ? "border-l-2 border-l-primary" : ""
                }`}
              >
                <span className="text-xl shrink-0 mt-0.5">{typeIcon(n.type)}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-[13px] font-semibold ${!n.is_read ? "text-foreground" : "text-muted-foreground"}`}>
                      {n.title}
                    </p>
                    <span className="text-[10px] text-muted-foreground/60 shrink-0 mt-0.5">
                      {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-[12px] text-muted-foreground mt-1">{n.message}</p>
                  {!n.is_read && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => markAsRead(n.id)}
                      className="h-6 px-2 text-[10px] text-primary mt-2"
                    >
                      <Check className="w-3 h-3 mr-1" /> Mark as read
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Notifications;
