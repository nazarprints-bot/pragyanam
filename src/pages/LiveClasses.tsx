import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import LiveChatSidebar from "@/components/LiveChatSidebar";
import { Video, Plus, Calendar, Clock, Users, Play, X, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const LiveClasses = () => {
  const { user, role } = useAuth();
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [activeRoom, setActiveRoom] = useState<string | null>(null);
  const [activeClassId, setActiveClassId] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    title_hi: "",
    description: "",
    scheduled_at: "",
    duration_minutes: 60,
  });

  const fetchClasses = async () => {
    const { data, error } = await supabase
      .from("live_classes")
      .select("*")
      .order("scheduled_at", { ascending: true });

    if (error) {
      toast.error("Failed to load classes: " + error.message);
    } else {
      setClasses(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchClasses();

    const channel = supabase
      .channel("live_classes_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "live_classes" }, () => {
        fetchClasses();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setCreating(true);

    const scheduledAtIso = new Date(form.scheduled_at).toISOString();
    if (!form.scheduled_at || Number.isNaN(new Date(form.scheduled_at).getTime())) {
      toast.error("Please select a valid date & time");
      setCreating(false);
      return;
    }

    const { error } = await supabase.from("live_classes").insert({
      title: form.title,
      title_hi: form.title_hi,
      description: form.description || null,
      teacher_id: user.id,
      scheduled_at: scheduledAtIso,
      duration_minutes: form.duration_minutes,
      status: "scheduled",
    });

    if (error) {
      toast.error("Failed to schedule class: " + error.message);
    } else {
      toast.success("Live class scheduled!");
      setShowForm(false);
      setForm({ title: "", title_hi: "", description: "", scheduled_at: "", duration_minutes: 60 });
      await fetchClasses();
    }
    setCreating(false);
  };

  const handleStartClass = async (classItem: any) => {
    const { error } = await supabase
      .from("live_classes")
      .update({ status: "live" })
      .eq("id", classItem.id)
      .eq("teacher_id", user?.id || "");

    if (error) {
      toast.error("Failed to start class: " + error.message);
      return;
    }

    toast.success("Class started");
    await fetchClasses();
    setActiveRoom(classItem.room_id);
    setActiveClassId(classItem.id);
  };

  const handleJoinClass = (classItem: any) => {
    setActiveRoom(classItem.room_id);
    setActiveClassId(classItem.id);
  };

  const handleEndClass = async (classItem: any) => {
    const { error } = await supabase
      .from("live_classes")
      .delete()
      .eq("id", classItem.id)
      .eq("teacher_id", user?.id || "");

    if (error) {
      toast.error("Failed to end class: " + error.message);
      return;
    }

    setActiveRoom(null);
    setActiveClassId(null);
    await fetchClasses();
    toast.success("Class ended & removed");
  };

  const handleDeleteClass = async (classItem: any) => {
    const { error } = await supabase
      .from("live_classes")
      .delete()
      .eq("id", classItem.id)
      .eq("teacher_id", user?.id || "");

    if (error) {
      toast.error("Failed to delete class: " + error.message);
      return;
    }
    toast.success("Class cancelled & removed");
    await fetchClasses();
  };

  const isTeacherOrAdmin = role === "teacher" || role === "admin";
  const upcomingClasses = classes.filter((c) => c.status === "scheduled");
  const liveClasses = classes.filter((c) => c.status === "live");
  const pastClasses = classes.filter((c) => c.status === "ended");

  // Build Jitsi URL — fix moderator issue + stage mode for students
  const buildJitsiUrl = (roomId: string) => {
    const base = `https://meet.jit.si/pragyanam-${roomId}`;
    const commonConfig = `config.prejoinConfig.enabled=false&config.disableDeepLinking=true&config.enableLobby=false&config.hideLobbyButton=true&config.requireDisplayName=false&config.enableWelcomePage=false`;
    if (isTeacherOrAdmin) {
      return `${base}#${commonConfig}&config.startWithAudioMuted=false&config.startWithVideoMuted=false`;
    }
    // Student: watch-only, no mic/camera, no toolbar, no lobby wait
    return `${base}#${commonConfig}&config.startWithAudioMuted=true&config.startWithVideoMuted=true&config.toolbarButtons=[]&config.disableModeratorIndicator=true&config.hideConferenceSubject=true&config.notifications=[]&config.disableRemoteMute=true&config.remoteVideoMenu.disabled=true&config.hideConferenceTimer=true`;
  };

  if (activeRoom && activeClassId) {
    const activeClass = classes.find((c) => c.id === activeClassId);
    return (
      <DashboardLayout>
        <div className="flex flex-col h-[calc(100vh-64px)]">
          {/* YouTube-style top bar */}
          <div className="flex flex-col lg:flex-row flex-1 min-h-0">
            {/* Video Area — full width on mobile, ~70% on desktop */}
            <div className="flex-1 flex flex-col min-w-0">
              {/* Video */}
              <div className="relative w-full bg-black" style={{ aspectRatio: "16/9", maxHeight: "calc(100vh - 180px)" }}>
                <iframe
                  src={buildJitsiUrl(activeRoom)}
                  allow="camera; microphone; fullscreen; display-capture; autoplay"
                  className="absolute inset-0 w-full h-full"
                  title="Live Class Video"
                />
              </div>

              {/* Video info bar — YouTube style */}
              <div className="px-4 py-3 bg-card border-b border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-destructive"></span>
                      </span>
                      <span className="text-xs font-bold text-destructive uppercase tracking-wide">Live</span>
                    </div>
                    <h1 className="text-base lg:text-lg font-bold text-foreground truncate">
                      {activeClass?.title || "Live Class"}
                    </h1>
                  </div>
                  <div className="flex items-center gap-2">
                    {isTeacherOrAdmin && activeClass?.teacher_id === user?.id && (
                      <Button variant="destructive" size="sm" onClick={() => handleEndClass(activeClass)} className="text-xs">
                        <X className="w-3 h-3 mr-1" /> End Stream
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => { setActiveRoom(null); setActiveClassId(null); }}
                      className="text-xs"
                    >
                      Leave
                    </Button>
                  </div>
                </div>
                {activeClass?.description && (
                  <p className="text-xs text-muted-foreground mt-1">{activeClass.description}</p>
                )}
              </div>
            </div>

            {/* Chat Sidebar — below video on mobile, right side on desktop */}
            <div className="h-[320px] lg:h-auto lg:w-[340px] xl:w-[380px] lg:min-w-[300px] flex-shrink-0 border-l border-border">
              <LiveChatSidebar classId={activeClassId} isTeacher={isTeacherOrAdmin} />
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold font-heading text-foreground flex items-center gap-2">
              <Video className="w-6 h-6 text-navy dark:text-gold" />
              Live Classes
            </h1>
            <p className="text-sm text-muted-foreground">
              {isTeacherOrAdmin
                ? "Schedule and manage live classes"
                : "Join live classes with your teachers"}
            </p>
          </div>
          {isTeacherOrAdmin && (
            <Button onClick={() => setShowForm(!showForm)} className="gradient-navy text-white border-0 hover:opacity-90 font-bold">
              <Plus className="w-4 h-4 mr-1" />
              Schedule Class
            </Button>
          )}
        </div>

        {/* Create Form */}
        {showForm && isTeacherOrAdmin && (
          <div className="bg-card rounded-2xl p-6 border border-border">
            <h2 className="text-lg font-bold font-heading text-foreground mb-4">
              Schedule New Live Class
            </h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Title</Label>
                  <Input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Math Revision Class" className="mt-1" />
                </div>
                <div>
                  <Label>Subtitle (Optional)</Label>
                  <Input value={form.title_hi} onChange={(e) => setForm({ ...form, title_hi: e.target.value })} placeholder="Optional subtitle" className="mt-1" />
                </div>
              </div>
              <div>
                <Label>Description (Optional)</Label>
                <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="What will be covered in this class" className="mt-1" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Date & Time</Label>
                  <Input type="datetime-local" required value={form.scheduled_at} onChange={(e) => setForm({ ...form, scheduled_at: e.target.value })} className="mt-1" />
                </div>
                <div>
                  <Label>Duration (minutes)</Label>
                  <Input type="number" min={15} max={180} value={form.duration_minutes} onChange={(e) => setForm({ ...form, duration_minutes: Number(e.target.value) })} className="mt-1" />
                </div>
              </div>
              <div className="flex gap-3">
                <Button type="submit" disabled={creating} className="gradient-navy text-white border-0 hover:opacity-90 font-bold">
                  {creating ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Calendar className="w-4 h-4 mr-1" />}
                  Schedule
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-gold border-t-transparent rounded-full" />
          </div>
        ) : (
          <>
            {/* Live Now — YouTube thumbnail style */}
            {liveClasses.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-destructive"></span>
                  </span>
                  Live Now
                </h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {liveClasses.map((c) => (
                    <div
                      key={c.id}
                      className="group bg-card rounded-xl overflow-hidden border border-destructive/20 hover:border-destructive/40 shadow-lg hover:shadow-xl transition-all cursor-pointer"
                      onClick={() => !(isTeacherOrAdmin && c.teacher_id === user?.id) && handleJoinClass(c)}
                    >
                      {/* Thumbnail area */}
                      <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 aspect-video flex items-center justify-center">
                        <Video className="w-12 h-12 text-white/20" />
                        <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-destructive text-white text-[10px] font-bold px-2 py-1 rounded">
                          <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                          LIVE
                        </div>
                        <div className="absolute bottom-3 right-3 bg-black/70 text-white text-[10px] px-2 py-0.5 rounded">
                          {c.duration_minutes} min
                        </div>
                        {/* Play overlay on hover */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
                          <Play className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity fill-white" />
                        </div>
                      </div>
                      {/* Info */}
                      <div className="p-3">
                        <h3 className="font-semibold text-foreground text-sm truncate">{c.title}</h3>
                        {isTeacherOrAdmin && c.teacher_id === user?.id ? (
                          <div className="flex gap-2 mt-2">
                            <Button onClick={(e) => { e.stopPropagation(); handleJoinClass(c); }} className="flex-1 bg-destructive hover:bg-destructive/90 text-white" size="sm">
                              <Play className="w-3 h-3 mr-1" /> Go Live
                            </Button>
                            <Button variant="outline" onClick={(e) => { e.stopPropagation(); handleEndClass(c); }} size="sm">
                              End
                            </Button>
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground mt-1">Tap to join live stream</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upcoming */}
            <div className="space-y-3">
              <h2 className="text-lg font-bold text-foreground">📅 Upcoming</h2>
              {upcomingClasses.length === 0 ? (
                <div className="text-center py-12 bg-card rounded-2xl border border-border">
                  <Calendar className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
                  <p className="text-sm text-muted-foreground">No upcoming classes</p>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {upcomingClasses.map((c) => (
                    <div key={c.id} className="bg-card rounded-2xl p-5 border border-border hover:shadow-card hover:border-gold/20 transition-all">
                      <h3 className="font-bold text-foreground mb-2">{c.title}</h3>
                      {c.description && <p className="text-xs text-muted-foreground mb-3">{c.description}</p>}
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(c.scheduled_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(c.scheduled_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                        <span>{c.duration_minutes} min</span>
                      </div>
                      {isTeacherOrAdmin && c.teacher_id === user?.id && (
                        <div className="flex gap-2">
                          <Button onClick={() => handleStartClass(c)} className="flex-1 gradient-navy text-white border-0 hover:opacity-90" size="sm">
                            <Play className="w-3 h-3 mr-1" /> Start Class
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => handleDeleteClass(c)}>
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Past */}
            {pastClasses.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-lg font-bold text-muted-foreground">Past Classes</h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pastClasses.slice(0, 6).map((c) => (
                    <div key={c.id} className="bg-card rounded-2xl p-5 border border-border opacity-70">
                      <h3 className="font-bold text-foreground mb-0.5">{c.title}</h3>
                      <div className="text-xs text-muted-foreground">
                        {new Date(c.scheduled_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} · {c.duration_minutes} min · Ended
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default LiveClasses;
