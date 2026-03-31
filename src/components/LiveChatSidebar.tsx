import { useEffect, useRef, useState, useCallback, memo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Send, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface ChatMessage {
  id: string;
  class_id: string;
  user_id: string;
  user_name: string;
  message: string;
  created_at: string;
}

interface LiveChatSidebarProps {
  classId: string;
  isTeacher?: boolean;
}

// Throttle: 1 message per 3 seconds per user
const THROTTLE_MS = 3000;
// Keep only last 200 messages in memory for performance
const MAX_MESSAGES = 200;

const ChatMessage = memo(({ msg, isMine, isTeacher, youLabel }: {
  msg: ChatMessage;
  isMine: boolean;
  isTeacher?: boolean;
  youLabel: string;
}) => (
  <div className="flex items-start gap-2 py-1 px-1 rounded hover:bg-muted/50 transition-colors">
    <div className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-white ${
      isMine ? "bg-primary" : isTeacher ? "bg-gold" : "bg-muted-foreground/60"
    }`}>
      {msg.user_name?.charAt(0)?.toUpperCase() || "?"}
    </div>
    <div className="min-w-0 flex-1">
      <span className={`text-[11px] font-semibold mr-1.5 ${
        isMine ? "text-primary" : "text-muted-foreground"
      }`}>
        {isMine ? youLabel : msg.user_name}
      </span>
      <span className="text-sm text-foreground break-words">{msg.message}</span>
    </div>
  </div>
));

ChatMessage.displayName = "ChatMessage";

const LiveChatSidebar = ({ classId, isTeacher }: LiveChatSidebarProps) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [userName, setUserName] = useState("");
  const [cooldown, setCooldown] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastSentRef = useRef(0);
  const isAutoScrollRef = useRef(true);

  // Track if user is scrolled to bottom for auto-scroll
  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    isAutoScrollRef.current = scrollHeight - scrollTop - clientHeight < 50;
  }, []);

  // Fetch user profile name
  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("full_name")
      .eq("user_id", user.id)
      .single()
      .then(({ data }) => setUserName(data?.full_name || "User"));
  }, [user]);

  // Fetch last 200 messages only
  useEffect(() => {
    const fetchMessages = async () => {
      const { data } = await (supabase as any)
        .from("live_chat_messages")
        .select("*")
        .eq("class_id", classId)
        .order("created_at", { ascending: false })
        .limit(MAX_MESSAGES);
      if (data) setMessages((data as ChatMessage[]).reverse());
    };
    fetchMessages();
  }, [classId]);

  // Realtime subscription — trim to MAX_MESSAGES
  useEffect(() => {
    const channel = supabase
      .channel(`chat-${classId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "live_chat_messages",
          filter: `class_id=eq.${classId}`,
        },
        (payload) => {
          setMessages((prev) => {
            const updated = [...prev, payload.new as ChatMessage];
            return updated.length > MAX_MESSAGES
              ? updated.slice(updated.length - MAX_MESSAGES)
              : updated;
          });
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [classId]);

  // Auto-scroll only if user is at bottom
  useEffect(() => {
    if (scrollRef.current && isAutoScrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    // Throttle check
    const now = Date.now();
    if (now - lastSentRef.current < THROTTLE_MS) {
      setCooldown(true);
      setTimeout(() => setCooldown(false), THROTTLE_MS - (now - lastSentRef.current));
      toast.error("Thoda ruko, 3 sec mein next message bhejo");
      return;
    }

    setSending(true);
    lastSentRef.current = Date.now();

    const { error } = await (supabase as any).from("live_chat_messages").insert({
      class_id: classId,
      user_id: user.id,
      user_name: userName || "User",
      message: newMessage.trim(),
    });

    if (error) {
      toast.error("Message failed");
    } else {
      setNewMessage("");
    }
    setSending(false);
  }, [newMessage, user, classId, userName]);

  return (
    <div className="flex flex-col h-full bg-card">
      {/* Header */}
      <div className="px-4 py-2.5 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-4 h-4 text-gold" />
          <span className="font-semibold text-sm text-foreground">{t("chat.liveChat")}</span>
        </div>
        <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full font-medium">
          {messages.length} messages
        </span>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-3 py-2 space-y-1"
      >
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <MessageCircle className="w-8 h-8 mb-2 opacity-30" />
            <p className="text-xs">{t("chat.noMessages")}</p>
          </div>
        )}
        {messages.map((msg) => (
          <ChatMessage
            key={msg.id}
            msg={msg}
            isMine={msg.user_id === user?.id}
            isTeacher={isTeacher}
            youLabel={t("chat.you")}
          />
        ))}
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-2 border-t border-border flex gap-2 items-center">
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder={cooldown ? "Wait 3s..." : t("chat.typeMessage")}
          className="flex-1 h-9 text-sm rounded-full bg-muted border-0 px-4 focus-visible:ring-1"
          maxLength={500}
          disabled={sending || cooldown}
        />
        <Button
          type="submit"
          size="icon"
          disabled={sending || cooldown || !newMessage.trim()}
          className="h-9 w-9 rounded-full bg-gold hover:bg-gold/90 text-white flex-shrink-0"
        >
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
};

export default LiveChatSidebar;
