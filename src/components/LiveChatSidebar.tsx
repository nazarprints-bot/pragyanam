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
    <div className="flex flex-col h-full bg-card border-l border-border">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border flex items-center gap-2">
        <MessageCircle className="w-4 h-4 text-primary" />
        <span className="font-bold text-sm text-foreground">{t("chat.liveChat")}</span>
        <span className="ml-auto text-xs text-muted-foreground">{messages.length}</span>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-2 space-y-2">
        {messages.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-8">{t("chat.noMessages")}</p>
        )}
        {messages.map((msg) => {
          const isMine = msg.user_id === user?.id;
          return (
            <div key={msg.id} className={`flex flex-col ${isMine ? "items-end" : "items-start"}`}>
              <span className={`text-[10px] font-semibold mb-0.5 ${isTeacher && !isMine ? "text-primary" : "text-muted-foreground"}`}>
                {isMine ? t("chat.you") : msg.user_name}
              </span>
              <div
                className={`px-3 py-1.5 rounded-2xl text-sm max-w-[85%] break-words ${
                  isMine
                    ? "bg-primary text-primary-foreground rounded-br-md"
                    : "bg-muted text-foreground rounded-bl-md"
                }`}
              >
                {msg.message}
              </div>
            </div>
          );
        })}
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-3 border-t border-border flex gap-2">
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder={t("chat.typeMessage")}
          className="flex-1 h-9 text-sm"
          maxLength={500}
          disabled={sending}
        />
        <Button type="submit" size="sm" disabled={sending || !newMessage.trim()} className="h-9 px-3">
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
};

export default LiveChatSidebar;
