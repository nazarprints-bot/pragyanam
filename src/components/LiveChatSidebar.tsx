import { useEffect, useRef, useState } from "react";
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

const LiveChatSidebar = ({ classId, isTeacher }: LiveChatSidebarProps) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [userName, setUserName] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Fetch user profile name
  useEffect(() => {
    if (!user) return;
    const fetchName = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("user_id", user.id)
        .single();
      setUserName(data?.full_name || "User");
    };
    fetchName();
  }, [user]);

  // Fetch existing messages
  useEffect(() => {
    const fetchMessages = async () => {
      const { data } = await (supabase as any)
        .from("live_chat_messages")
        .select("*")
        .eq("class_id", classId)
        .order("created_at", { ascending: true });
      if (data) setMessages(data as ChatMessage[]);
    };
    fetchMessages();
  }, [classId]);

  // Realtime subscription
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
          setMessages((prev) => [...prev, payload.new as ChatMessage]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [classId]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;
    setSending(true);

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
  };

  return (
    <div className="flex flex-col h-full bg-card">
      {/* YouTube-style chat header */}
      <div className="px-4 py-2.5 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-4 h-4 text-gold" />
          <span className="font-semibold text-sm text-foreground">{t("chat.liveChat")}</span>
        </div>
        <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full font-medium">
          {messages.length} messages
        </span>
      </div>

      {/* Messages — YouTube live chat style */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <MessageCircle className="w-8 h-8 mb-2 opacity-30" />
            <p className="text-xs">{t("chat.noMessages")}</p>
          </div>
        )}
        {messages.map((msg) => {
          const isMine = msg.user_id === user?.id;
          return (
            <div key={msg.id} className="flex items-start gap-2 py-1 px-1 rounded hover:bg-muted/50 transition-colors">
              {/* Avatar circle */}
              <div className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-white ${
                isMine ? "bg-primary" : isTeacher ? "bg-gold" : "bg-muted-foreground/60"
              }`}>
                {msg.user_name?.charAt(0)?.toUpperCase() || "?"}
              </div>
              <div className="min-w-0 flex-1">
                <span className={`text-[11px] font-semibold mr-1.5 ${
                  isMine ? "text-primary" : "text-muted-foreground"
                }`}>
                  {isMine ? t("chat.you") : msg.user_name}
                </span>
                <span className="text-sm text-foreground break-words">{msg.message}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Input — YouTube style bottom bar */}
      <form onSubmit={handleSend} className="p-2 border-t border-border flex gap-2 items-center">
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder={t("chat.typeMessage")}
          className="flex-1 h-9 text-sm rounded-full bg-muted border-0 px-4 focus-visible:ring-1"
          maxLength={500}
          disabled={sending}
        />
        <Button
          type="submit"
          size="icon"
          disabled={sending || !newMessage.trim()}
          className="h-9 w-9 rounded-full bg-gold hover:bg-gold/90 text-white flex-shrink-0"
        >
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
};

export default LiveChatSidebar;
