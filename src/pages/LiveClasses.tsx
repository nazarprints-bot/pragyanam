import { useEffect, useState, useRef, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import LiveChatSidebar from "@/components/LiveChatSidebar";
import { Video, Plus, Calendar, Clock, Users, Play, X, Loader2, Trash2, Image, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const MAX_STUDENTS_PER_CLASS = 75;

const LiveClasses = () => {
  const { user, role, profile } = useAuth();
  const [classes, setClasses] = useState<any[]>([]);
  const [teacherProfiles, setTeacherProfiles] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [activeRoom, setActiveRoom] = useState<string | null>(null);
  const [activeClassId, setActiveClassId] = useState<string | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
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
      // Fetch teacher profiles for all unique teacher_ids
      const teacherIds = [...new Set((data || []).map((c: any) => c.teacher_id))];
      if (teacherIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, full_name, avatar_url")
          .in("user_id", teacherIds);
        if (profiles) {
          const map: Record<string, any> = {};
          profiles.forEach((p: any) => { map[p.user_id] = p; });
          setTeacherProfiles(map);
        }
      }
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

  const uploadThumbnail = async (file: File): Promise<string | null> => {
    const ext = file.name.split(".").pop();
    const path = `live-class-thumbnails/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("course-thumbnails").upload(path, file);
    if (error) { toast.error("Thumbnail upload failed"); return null; }
    const { data } = supabase.storage.from("course-thumbnails").getPublicUrl(path);
    return data.publicUrl;
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setCreating(true);

    if (!form.scheduled_at || Number.isNaN(new Date(form.scheduled_at).getTime())) {
      toast.error("Please select a valid date & time");
      setCreating(false);
      return;
    }

    let thumbnailUrl: string | null = null;
    if (thumbnailFile) {
      thumbnailUrl = await uploadThumbnail(thumbnailFile);
    }

    const { error } = await supabase.from("live_classes").insert({
      title: form.title,
      title_hi: form.title_hi,
      description: form.description || null,
      teacher_id: user.id,
      scheduled_at: new Date(form.scheduled_at).toISOString(),
      duration_minutes: form.duration_minutes,
      status: "scheduled",
      thumbnail_url: thumbnailUrl,
      max_students: MAX_STUDENTS_PER_CLASS,
    } as any);

    if (error) {
      toast.error("Failed to schedule class: " + error.message);
    } else {
      toast.success("Live class scheduled!");
      setShowForm(false);
      setForm({ title: "", title_hi: "", description: "", scheduled_at: "", duration_minutes: 60 });
      setThumbnailFile(null);
      await fetchClasses();
    }
    setCreating(false);
  };

  const handleStartClass = async (classItem: any) => {
    const { error } = await supabase
      .from("live_classes")
      .update({ status: "live" } as any)
      .eq("id", classItem.id)
      .eq("teacher_id", user?.id || "");
    if (error) { toast.error("Failed to start class: " + error.message); return; }
    toast.success("Class started");
    await fetchClasses();
    setActiveRoom(classItem.room_id);
    setActiveClassId(classItem.id);
  };

  const handleJoinClass = async (classItem: any) => {
    // Check student limit
    if (!isTeacherOrAdmin && classItem.current_students >= (classItem.max_students || MAX_STUDENTS_PER_CLASS)) {
      toast.error(`Class is full (${classItem.max_students || MAX_STUDENTS_PER_CLASS} students max)`);
      return;
    }
    // Increment student count for non-teachers
    if (!isTeacherOrAdmin) {
      await supabase.from("live_classes")
        .update({ current_students: (classItem.current_students || 0) + 1 } as any)
        .eq("id", classItem.id);
    }
    setActiveRoom(classItem.room_id);
    setActiveClassId(classItem.id);
  };

  const handleLeaveClass = async () => {
    // Decrement student count
    if (!isTeacherOrAdmin && activeClassId) {
      const activeClass = classes.find((c) => c.id === activeClassId);
      if (activeClass) {
        await supabase.from("live_classes")
          .update({ current_students: Math.max(0, (activeClass.current_students || 1) - 1) } as any)
          .eq("id", activeClassId);
      }
    }
    destroyJitsi();
    setActiveRoom(null);
    setActiveClassId(null);
  };

  const handleEndClass = async (classItem: any) => {
    const { error } = await supabase.from("live_classes").delete()
      .eq("id", classItem.id).eq("teacher_id", user?.id || "");
    if (error) { toast.error("Failed to end class: " + error.message); return; }
    destroyJitsi();
    setActiveRoom(null);
    setActiveClassId(null);
    await fetchClasses();
    toast.success("Class ended & removed");
  };

  const handleDeleteClass = async (classItem: any) => {
    const { error } = await supabase.from("live_classes").delete()
      .eq("id", classItem.id).eq("teacher_id", user?.id || "");
    if (error) { toast.error("Failed to delete class: " + error.message); return; }
    toast.success("Class cancelled");
    await fetchClasses();
  };

  const isTeacherOrAdmin = role === "teacher" || role === "admin";
  const upcomingClasses = classes.filter((c) => c.status === "scheduled");
  const liveClasses = classes.filter((c) => c.status === "live");

  // Jitsi External API
  const jitsiContainerRef = useRef<HTMLDivElement>(null);
  const jitsiApiRef = useRef<any>(null);

  const destroyJitsi = useCallback(() => {
    if (jitsiApiRef.current) {
      jitsiApiRef.current.dispose();
      jitsiApiRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!activeRoom || !activeClassId || !jitsiContainerRef.current) return;
    const loadAndInit = () => {
      destroyJitsi();
      const roomName = `pragyanam-live-${activeClassId}`;
      const displayName = profile?.full_name || user?.email || "User";
      const options: any = {
        roomName,
        parentNode: jitsiContainerRef.current,
        width: "100%",
        height: "100%",
        userInfo: { displayName },
        configOverwrite: {
          prejoinConfig: { enabled: false },
          startWithAudioMuted: !isTeacherOrAdmin,
          startWithVideoMuted: !isTeacherOrAdmin,
          enableLobby: false, enableLobbyChat: false, hideLobbyButton: true,
          requireDisplayName: false, enableWelcomePage: false, disableDeepLinking: true,
          disableModeratorIndicator: !isTeacherOrAdmin,
          hideConferenceSubject: true,
          hideConferenceTimer: !isTeacherOrAdmin,
          notifications: isTeacherOrAdmin ? undefined : [],
          toolbarButtons: isTeacherOrAdmin ? undefined : [],
          disableRemoteMute: !isTeacherOrAdmin,
          remoteVideoMenu: { disabled: !isTeacherOrAdmin },
        },
        interfaceConfigOverwrite: {
          SHOW_JITSI_WATERMARK: false, SHOW_WATERMARK_FOR_GUESTS: false,
          TOOLBAR_ALWAYS_VISIBLE: isTeacherOrAdmin,
          DISABLE_JOIN_LEAVE_NOTIFICATIONS: !isTeacherOrAdmin,
          FILM_STRIP_MAX_HEIGHT: isTeacherOrAdmin ? undefined : 0,
          HIDE_INVITE_MORE_HEADER: true,
        },
      };
      jitsiApiRef.current = new (window as any).JitsiMeetExternalAPI("meet.jit.si", options);
    };
    if ((window as any).JitsiMeetExternalAPI) {
      loadAndInit();
    } else {
      const script = document.createElement("script");
      script.src = "https://meet.jit.si/external_api.js";
      script.async = true;
      script.onload = loadAndInit;
      document.head.appendChild(script);
    }
    return () => destroyJitsi();
  }, [activeRoom, activeClassId, isTeacherOrAdmin, profile, user, destroyJitsi]);

  // ═══════════════ ACTIVE CLASS VIEW ═══════════════
  if (activeRoom && activeClassId) {
    const activeClass = classes.find((c) => c.id === activeClassId);
    const teacher = teacherProfiles[activeClass?.teacher_id];
    return (
      <DashboardLayout>
        <div className="flex flex-col h-[calc(100vh-64px)]">
          <div className="flex flex-col lg:flex-row flex-1 min-h-0">
            <div className="flex-1 flex flex-col min-w-0">
              <div ref={jitsiContainerRef} className="relative w-full bg-black"
                style={{ aspectRatio: "16/9", maxHeight: "calc(100vh - 180px)" }} />
              {/* Info bar */}
              <div className="px-4 py-3 bg-card border-b border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75" />
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-destructive" />
                      </span>
                      <span className="text-xs font-bold text-destructive uppercase tracking-wide">Live</span>
                    </div>
                    <h1 className="text-base lg:text-lg font-bold text-foreground truncate">
                      {activeClass?.title || "Live Class"}
                    </h1>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {activeClass?.current_students != null && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Users className="w-3 h-3" /> {activeClass.current_students}/{activeClass.max_students || 75}
                      </span>
                    )}
                    {isTeacherOrAdmin && activeClass?.teacher_id === user?.id && (
                      <Button variant="destructive" size="sm" onClick={() => handleEndClass(activeClass)} className="text-xs">
                        <X className="w-3 h-3 mr-1" /> End
                      </Button>
                    )}
                    <Button variant="outline" size="sm" onClick={handleLeaveClass} className="text-xs">Leave</Button>
                  </div>
                </div>
                {/* Teacher info */}
                {teacher && (
                  <div className="flex items-center gap-2 mt-2">
                    <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-[11px] font-bold text-white overflow-hidden">
                      {teacher.avatar_url ? (
                        <img src={teacher.avatar_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        teacher.full_name?.charAt(0)?.toUpperCase() || "T"
                      )}
                    </div>
                    <span className="text-sm font-medium text-foreground">{teacher.full_name}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="h-[320px] lg:h-auto lg:w-[340px] xl:w-[380px] lg:min-w-[300px] flex-shrink-0 border-l border-border">
              <LiveChatSidebar classId={activeClassId} isTeacher={isTeacherOrAdmin} />
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // ═══════════════ CLASS LISTING ═══════════════
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold font-heading text-foreground flex items-center gap-2">
              <Video className="w-6 h-6 text-navy dark:text-gold" /> Live Classes
            </h1>
            <p className="text-sm text-muted-foreground">
              {isTeacherOrAdmin ? "Schedule and manage live classes" : "Join live classes with your teachers"}
            </p>
          </div>
          {isTeacherOrAdmin && (
            <Button onClick={() => setShowForm(!showForm)} className="gradient-navy text-white border-0 hover:opacity-90 font-bold">
              <Plus className="w-4 h-4 mr-1" /> Schedule Class
            </Button>
          )}
        </div>

        {/* Create Form */}
        {showForm && isTeacherOrAdmin && (
          <div className="bg-card rounded-2xl p-6 border border-border">
            <h2 className="text-lg font-bold font-heading text-foreground mb-4">Schedule New Live Class</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Title</Label>
                  <Input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Math Revision" className="mt-1" />
                </div>
                <div>
                  <Label>Subtitle (Optional)</Label>
                  <Input value={form.title_hi} onChange={(e) => setForm({ ...form, title_hi: e.target.value })} placeholder="Optional subtitle" className="mt-1" />
                </div>
              </div>
              <div>
                <Label>Description (Optional)</Label>
                <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="What will be covered" className="mt-1" />
              </div>
              {/* Thumbnail upload */}
              <div>
                <Label>Thumbnail (Optional)</Label>
                <div className="mt-1 flex items-center gap-3">
                  <label className="flex items-center gap-2 px-4 py-2 bg-muted rounded-lg cursor-pointer hover:bg-muted/80 transition-colors text-sm">
                    <Image className="w-4 h-4" />
                    {thumbnailFile ? thumbnailFile.name : "Choose image"}
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)} />
                  </label>
                  {thumbnailFile && (
                    <img src={URL.createObjectURL(thumbnailFile)} alt="Preview" className="w-16 h-10 object-cover rounded" />
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Date & Time</Label>
                  <Input type="datetime-local" required value={form.scheduled_at} onChange={(e) => setForm({ ...form, scheduled_at: e.target.value })} className="mt-1" />
                </div>
                <div>
                  <Label>Duration (minutes)</Label>
                  <Input type="number" min={15} max={180} value={form.duration_minutes} onChange={(e) => setForm({ ...form, duration_minutes: Number(e.target.value) })} className="mt-1" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Users className="w-3 h-3" /> Max {MAX_STUDENTS_PER_CLASS} students per class
              </p>
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
            {/* Live Now */}
            {liveClasses.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-destructive" />
                  </span>
                  Live Now
                </h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {liveClasses.map((c) => {
                    const teacher = teacherProfiles[c.teacher_id];
                    const isFull = (c.current_students || 0) >= (c.max_students || MAX_STUDENTS_PER_CLASS);
                    return (
                      <div key={c.id}
                        className={`group bg-card rounded-xl overflow-hidden border shadow-lg hover:shadow-xl transition-all ${isFull && !isTeacherOrAdmin ? "opacity-60 border-border" : "border-destructive/20 hover:border-destructive/40 cursor-pointer"}`}
                        onClick={() => !(isTeacherOrAdmin && c.teacher_id === user?.id) && !isFull && handleJoinClass(c)}
                      >
                        {/* Thumbnail */}
                        <div className="relative aspect-video bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center overflow-hidden">
                          {c.thumbnail_url ? (
                            <img src={c.thumbnail_url} alt={c.title} className="w-full h-full object-cover" />
                          ) : (
                            <Video className="w-12 h-12 text-muted-foreground/20" />
                          )}
                          <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-destructive text-white text-[10px] font-bold px-2 py-1 rounded">
                            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" /> LIVE
                          </div>
                          <div className="absolute bottom-3 right-3 flex items-center gap-2">
                            <span className="bg-black/70 text-white text-[10px] px-2 py-0.5 rounded flex items-center gap-1">
                              <Users className="w-3 h-3" /> {c.current_students || 0}/{c.max_students || 75}
                            </span>
                            <span className="bg-black/70 text-white text-[10px] px-2 py-0.5 rounded">{c.duration_minutes} min</span>
                          </div>
                          {!isFull && (
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
                              <Play className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity fill-white" />
                            </div>
                          )}
                        </div>
                        <div className="p-3">
                          <h3 className="font-semibold text-foreground text-sm truncate">{c.title}</h3>
                          {/* Teacher info */}
                          {teacher && (
                            <div className="flex items-center gap-2 mt-1.5">
                              <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-[9px] font-bold text-primary overflow-hidden">
                                {teacher.avatar_url ? (
                                  <img src={teacher.avatar_url} alt="" className="w-full h-full object-cover" />
                                ) : teacher.full_name?.charAt(0)?.toUpperCase() || "T"}
                              </div>
                              <span className="text-xs text-muted-foreground">{teacher.full_name}</span>
                            </div>
                          )}
                          {isTeacherOrAdmin && c.teacher_id === user?.id ? (
                            <div className="flex gap-2 mt-2">
                              <Button onClick={(e) => { e.stopPropagation(); handleJoinClass(c); }} className="flex-1 bg-destructive hover:bg-destructive/90 text-white" size="sm">
                                <Play className="w-3 h-3 mr-1" /> Go Live
                              </Button>
                              <Button variant="outline" onClick={(e) => { e.stopPropagation(); handleEndClass(c); }} size="sm">End</Button>
                            </div>
                          ) : isFull ? (
                            <p className="text-xs text-destructive mt-1 font-medium">Class is full</p>
                          ) : (
                            <p className="text-xs text-muted-foreground mt-1">Tap to join</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
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
                  {upcomingClasses.map((c) => {
                    const teacher = teacherProfiles[c.teacher_id];
                    return (
                      <div key={c.id} className="bg-card rounded-xl overflow-hidden border border-border hover:shadow-card hover:border-gold/20 transition-all">
                        {/* Thumbnail */}
                        <div className="relative aspect-video bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center overflow-hidden">
                          {c.thumbnail_url ? (
                            <img src={c.thumbnail_url} alt={c.title} className="w-full h-full object-cover" />
                          ) : (
                            <Video className="w-10 h-10 text-muted-foreground/20" />
                          )}
                          <div className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] px-2 py-0.5 rounded">
                            {c.duration_minutes} min
                          </div>
                        </div>
                        <div className="p-3">
                          <h3 className="font-semibold text-foreground text-sm">{c.title}</h3>
                          {c.description && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{c.description}</p>}
                          {teacher && (
                            <div className="flex items-center gap-2 mt-1.5">
                              <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-[9px] font-bold text-primary overflow-hidden">
                                {teacher.avatar_url ? (
                                  <img src={teacher.avatar_url} alt="" className="w-full h-full object-cover" />
                                ) : teacher.full_name?.charAt(0)?.toUpperCase() || "T"}
                              </div>
                              <span className="text-xs text-muted-foreground">{teacher.full_name}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-3 text-[11px] text-muted-foreground mt-2">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(c.scheduled_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(c.scheduled_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3" /> Max {c.max_students || 75}
                            </span>
                          </div>
                          {isTeacherOrAdmin && c.teacher_id === user?.id && (
                            <div className="flex gap-2 mt-3">
                              <Button onClick={() => handleStartClass(c)} className="flex-1 gradient-navy text-white border-0 hover:opacity-90" size="sm">
                                <Play className="w-3 h-3 mr-1" /> Start
                              </Button>
                              <Button variant="destructive" size="sm" onClick={() => handleDeleteClass(c)}>
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default LiveClasses;
