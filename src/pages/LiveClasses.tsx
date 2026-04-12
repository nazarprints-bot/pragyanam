import { useEffect, useState, useRef, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import LiveChatSidebar from "@/components/LiveChatSidebar";
import { Video, Calendar, Clock, Users, Play, X, Trash2, Maximize2, Minimize2, Hand, Mic, MicOff, Camera, CameraOff, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";

const MAX_STUDENTS_PER_CLASS = 100;
let jitsiApiLoader: Promise<void> | null = null;

const ensureJitsiApi = () => {
  if ((window as any).JitsiMeetExternalAPI) return Promise.resolve();
  if (jitsiApiLoader) return jitsiApiLoader;

  jitsiApiLoader = new Promise<void>((resolve, reject) => {
    const existingScript = document.querySelector('script[data-jitsi-external-api="true"]') as HTMLScriptElement | null;

    const handleLoad = () => resolve();
    const handleError = () => {
      jitsiApiLoader = null;
      reject(new Error("Failed to load Jitsi API"));
    };

    if (existingScript) {
      existingScript.addEventListener("load", handleLoad, { once: true });
      existingScript.addEventListener("error", handleError, { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = "https://meet.jit.si/external_api.js";
    script.async = true;
    script.dataset.jitsiExternalApi = "true";
    script.onload = handleLoad;
    script.onerror = handleError;
    document.head.appendChild(script);
  });

  return jitsiApiLoader;
};

// Elapsed timer component
const ElapsedTimer = ({ startTime }: { startTime: string }) => {
  const [elapsed, setElapsed] = useState("");
  useEffect(() => {
    const update = () => {
      const diff = Math.max(0, Math.floor((Date.now() - new Date(startTime).getTime()) / 1000));
      const h = Math.floor(diff / 3600);
      const m = Math.floor((diff % 3600) / 60);
      const s = diff % 60;
      setElapsed(h > 0 ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}` : `${m}:${String(s).padStart(2, "0")}`);
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [startTime]);
  return <span className="font-mono text-xs tabular-nums">{elapsed}</span>;
};

// Countdown to class start
const CountdownTimer = ({ scheduledAt }: { scheduledAt: string }) => {
  const [text, setText] = useState("");
  useEffect(() => {
    const update = () => {
      const diff = Math.max(0, Math.floor((new Date(scheduledAt).getTime() - Date.now()) / 1000));
      if (diff <= 0) { setText("Starting soon"); return; }
      const d = Math.floor(diff / 86400);
      const h = Math.floor((diff % 86400) / 3600);
      const m = Math.floor((diff % 3600) / 60);
      if (d > 0) setText(`${d}d ${h}h`);
      else if (h > 0) setText(`${h}h ${m}m`);
      else setText(`${m}m`);
    };
    update();
    const id = setInterval(update, 30000);
    return () => clearInterval(id);
  }, [scheduledAt]);
  return <span className="text-xs font-semibold text-primary">{text}</span>;
};

// Participant join notification toast
const ParticipantToast = ({ name, action }: { name: string; action: "joined" | "left" }) => (
  <div className="flex items-center gap-2">
    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white ${action === "joined" ? "bg-emerald-500" : "bg-muted-foreground"}`}>
      {name?.charAt(0)?.toUpperCase() || "?"}
    </div>
    <span className="text-sm"><b>{name}</b> {action === "joined" ? "joined" : "left"}</span>
  </div>
);

const LiveClasses = () => {
  const { user, role, profile } = useAuth();
  const isMobile = useIsMobile();
  const [classes, setClasses] = useState<any[]>([]);
  const [teacherProfiles, setTeacherProfiles] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [activeRoom, setActiveRoom] = useState<string | null>(null);
  const [activeClassId, setActiveClassId] = useState<string | null>(null);
  const [showChat, setShowChat] = useState(true);
  const [joiningClassId, setJoiningClassId] = useState<string | null>(null);

  const fetchClasses = async () => {
    const { data, error } = await supabase
      .from("live_classes").select("*").order("scheduled_at", { ascending: true });
    if (error) { toast.error("Failed to load classes: " + error.message); }
    else {
      setClasses(data || []);
      const teacherIds = [...new Set((data || []).map((c: any) => c.teacher_id))];
      if (teacherIds.length > 0) {
        const { data: profiles } = await supabase.from("profiles")
          .select("user_id, full_name, avatar_url").in("user_id", teacherIds);
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
    const channel = supabase.channel("live_classes_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "live_classes" }, () => fetchClasses())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const handleStartClass = async (classItem: any) => {
    const { data, error } = await supabase.from("live_classes")
      .update({
        status: "live",
        current_students: 0,
        updated_at: new Date().toISOString(),
      } as any)
      .eq("id", classItem.id)
      .eq("teacher_id", user?.id || "")
      .select("*")
      .single();
    if (error || !data) { toast.error("Failed to start class: " + (error?.message || "Unknown error")); return; }
    toast.success("🔴 Class is now LIVE!");
    await fetchClasses();
    setActiveRoom(data.room_id);
    setActiveClassId(data.id);
    setShowChat(!isMobile);
  };

  const handleJoinClass = async (classItem: any) => {
    if (joiningClassId) return;
    setJoiningClassId(classItem.id);

    const { data: freshClass, error } = await supabase
      .from("live_classes")
      .select("*")
      .eq("id", classItem.id)
      .single();

    if (error || !freshClass) {
      toast.error("Unable to open class right now.");
      setJoiningClassId(null);
      return;
    }

    if (!isTeacherOrAdmin && freshClass.status !== "live") {
      toast.error("Class has not started yet.");
      setJoiningClassId(null);
      return;
    }

    if (!isTeacherOrAdmin && freshClass.current_students >= (freshClass.max_students || MAX_STUDENTS_PER_CLASS)) {
      toast.error(`Class is full (${freshClass.max_students || MAX_STUDENTS_PER_CLASS} students max)`);
      setJoiningClassId(null);
      return;
    }

    setActiveRoom(freshClass.room_id);
    setActiveClassId(freshClass.id);
    setShowChat(!isMobile);
    setJoiningClassId(null);
  };

  const handleLeaveClass = async () => {
    destroyJitsi();
    setActiveRoom(null);
    setActiveClassId(null);
    setShowChat(!isMobile);
    await fetchClasses();
  };

  const handleEndClass = async (classItem: any) => {
    const { error } = await supabase.from("live_classes").delete()
      .eq("id", classItem.id).eq("teacher_id", user?.id || "");
    if (error) { toast.error("Failed: " + error.message); return; }
    destroyJitsi();
    setActiveRoom(null);
    setActiveClassId(null);
    await fetchClasses();
    toast.success("Class ended & removed");
  };

  const handleDeleteClass = async (classItem: any) => {
    const { error } = await supabase.from("live_classes").delete()
      .eq("id", classItem.id).eq("teacher_id", user?.id || "");
    if (error) { toast.error("Failed: " + error.message); return; }
    toast.success("Class cancelled");
    await fetchClasses();
  };

  const isTeacherOrAdmin = role === "teacher" || role === "admin";
  const upcomingClasses = classes.filter((c) => c.status === "scheduled");
  const liveClasses = classes.filter((c) => c.status === "live");

  // Jitsi External API
  const jitsiContainerRef = useRef<HTMLDivElement>(null);
  const jitsiApiRef = useRef<any>(null);
  const participantSyncRef = useRef<number | null>(null);
  const activeClassRef = useRef<any>(null);

  useEffect(() => {
    activeClassRef.current = classes.find((item) => item.id === activeClassId) || null;
  }, [classes, activeClassId]);

  const destroyJitsi = useCallback(() => {
    if (participantSyncRef.current) {
      window.clearInterval(participantSyncRef.current);
      participantSyncRef.current = null;
    }
    if (jitsiApiRef.current) {
      jitsiApiRef.current.dispose();
      jitsiApiRef.current = null;
    }
  }, []);

  const [jitsiLoading, setJitsiLoading] = useState(false);
  const [jitsiError, setJitsiError] = useState<string | null>(null);

  useEffect(() => {
    if (!activeRoom || !activeClassId) return;
    // Wait for next frame so ref is attached
    const timer = setTimeout(() => {
      if (!jitsiContainerRef.current) {
        console.error("Jitsi container ref not found");
        setJitsiError("Video container not ready. Try leaving and rejoining.");
        return;
      }
      setJitsiLoading(true);
      setJitsiError(null);

      const loadAndInit = () => {
        try {
          destroyJitsi();
          const roomName = activeRoom;
          const displayName = profile?.full_name || user?.email || "User";
          const activeClass = activeClassRef.current;
          const isHost = !!activeClass && !!user && (role === "admin" || activeClass.teacher_id === user.id);
          // Teacher = presenter/broadcaster, Students = viewers (livestream feel)
          const teacherToolbar = [
            'microphone', 'camera', 'toggle-camera', 'desktop', 'fullscreen',
            'fodeviceselection', 'hangup', 'raisehand',
            'tileview', 'settings', 'videoquality', 'recording',
            'participants-pane', 'noisesuppression', 'whiteboard',
          ];
          const studentToolbar = ['fullscreen'];
          const options: any = {
            roomName,
            parentNode: jitsiContainerRef.current,
            width: "100%",
            height: "100%",
            userInfo: { displayName },
            configOverwrite: {
              // Instant join — no lobby, no prejoin
              prejoinConfig: { enabled: false },
              enableLobby: false, enableLobbyChat: false, hideLobbyButton: true,
              requireDisplayName: false, enableWelcomePage: false, disableDeepLinking: true,
              enableClosePage: false,
              enableInsecureRoomNameWarning: false,
              // Disable authentication prompts
              enableAutomaticUrlCopy: false,
              doNotStoreRoom: true,
              disableInviteFunctions: true,
              disableInitialGUM: !isTeacherOrAdmin,
              startSilent: !isTeacherOrAdmin,

              // Teacher = unmuted, Students = muted (livestream style)
              startWithAudioMuted: !isTeacherOrAdmin,
              startWithVideoMuted: !isTeacherOrAdmin,
              // Auto-mute students' video after teacher joins (saves bandwidth)
              startVideoMuted: !isTeacherOrAdmin ? 0 : undefined,
              startAudioMuted: !isTeacherOrAdmin ? 0 : undefined,

              // Students can't unmute themselves — teacher controls
              disableRemoteMute: !isTeacherOrAdmin,
              remoteVideoMenu: { disabled: !isTeacherOrAdmin },
              disableModeratorIndicator: !isTeacherOrAdmin,

              // Hide meeting-like UI for students
              hideConferenceSubject: true,
              hideConferenceTimer: !isTeacherOrAdmin,
              notifications: isTeacherOrAdmin ? undefined : [],
              toolbarButtons: isTeacherOrAdmin ? teacherToolbar : studentToolbar,

              // HIGH QUALITY video — teacher broadcasts in HD
              resolution: 1080,
              constraints: {
                video: {
                  height: { ideal: 1080, max: 1080, min: 480 },
                  width: { ideal: 1920, max: 1920 },
                  frameRate: { ideal: 30, max: 30, min: 24 },
                },
              },
              videoQuality: {
                disabledCodec: '',
                preferredCodec: 'VP9',
                maxBitratesVideo: {
                  low: 300000,
                  standard: 1000000,
                  high: 3500000,
                  ssHigh: 3500000,
                },
              },

              // Performance — focus bandwidth on teacher's video
              enableLayerSuspension: true,
              channelLastN: isTeacherOrAdmin ? 25 : 1, // Students only see teacher
              p2p: { enabled: false },
              maxFullResolutionParticipants: 1,
              adaptiveLastN: true,

              // Audio quality
              disableAudioLevels: !isTeacherOrAdmin,
              enableNoisyMicDetection: isTeacherOrAdmin,
              enableNoAudioDetection: true,
              enableNoiseSuppression: true,
              stereo: false,
              disableAP: false,

              // Filmstrip — students don't need to see other students
              filmstrip: {
                disableStageFilmstrip: !isTeacherOrAdmin,
                maxSnippetHeight: isTeacherOrAdmin ? 120 : 0,
              },

              // Disable self-view for students (they're watching, not presenting)
              disableSelfView: !isTeacherOrAdmin,
              disableSelfViewSettings: !isTeacherOrAdmin,

              // Follow-me: teacher's view controls what students see
              followMe: { enabled: isTeacherOrAdmin },
            },
            interfaceConfigOverwrite: {
              SHOW_JITSI_WATERMARK: false, SHOW_WATERMARK_FOR_GUESTS: false,
              TOOLBAR_ALWAYS_VISIBLE: isTeacherOrAdmin,
              TOOLBAR_TIMEOUT: isTeacherOrAdmin ? 8000 : 3000,
              DISABLE_JOIN_LEAVE_NOTIFICATIONS: !isTeacherOrAdmin,
              // Students see teacher fullscreen — no filmstrip
              FILM_STRIP_MAX_HEIGHT: isTeacherOrAdmin ? 120 : 0,
              VERTICAL_FILMSTRIP: false,
              HIDE_INVITE_MORE_HEADER: true,
              DEFAULT_BACKGROUND: '#000000',
              OPTIMAL_BROWSERS: ['chrome', 'chromium', 'edge', 'safari'],
              VIDEO_QUALITY_LABEL_DISABLED: !isTeacherOrAdmin,
              MOBILE_APP_PROMO: false,
              DISABLE_RINGING: true,
              DEFAULT_REMOTE_DISPLAY_NAME: 'Student',
              GENERATE_ROOMNAMES_ON_WELCOME_PAGE: false,
              RECENT_LIST_ENABLED: false,
              // Hide distracting UI for students
              DISABLE_FOCUS_INDICATOR: true,
              DISABLE_DOMINANT_SPEAKER_INDICATOR: !isTeacherOrAdmin,
              DISABLE_TRANSCRIPTION_SUBTITLES: true,
              DISABLE_VIDEO_BACKGROUND: !isTeacherOrAdmin,
              INITIAL_TOOLBAR_TIMEOUT: isTeacherOrAdmin ? 8000 : 2000,
              SETTINGS_SECTIONS: isTeacherOrAdmin
                ? ['devices', 'language', 'moderator', 'profile', 'calendar', 'notifications']
                : [],
            },
          };
          jitsiApiRef.current = new (window as any).JitsiMeetExternalAPI("meet.jit.si", options);
          setJitsiLoading(false);

          // Track participant count
          const updateCount = async () => {
            const totalParticipants = jitsiApiRef.current?.getNumberOfParticipants?.() || 1;
            const viewerCount = Math.max(0, totalParticipants - 1);

            if (isHost && activeClassId) {
              await supabase.from("live_classes")
                .update({ current_students: viewerCount } as any)
                .eq("id", activeClassId);
            } else {
              await fetchClasses();
            }
          };

          jitsiApiRef.current.addEventListener('videoConferenceJoined', async () => {
            if (!isTeacherOrAdmin) {
              try {
                jitsiApiRef.current?.executeCommand?.('toggleAudio');
              } catch {}
              try {
                jitsiApiRef.current?.executeCommand?.('toggleVideo');
              } catch {}
            }

            await updateCount();
            if (isHost && participantSyncRef.current === null) {
              participantSyncRef.current = window.setInterval(() => {
                updateCount();
              }, 10000);
            }
            console.log("Jitsi: conference joined successfully");
            setJitsiLoading(false);
          });

          jitsiApiRef.current.addEventListener('videoConferenceLeft', async () => {
            if (isHost && activeClassId) {
              supabase.from("live_classes")
                .update({ current_students: 0 } as any)
                .eq("id", activeClassId)
                .then(() => {});
            }
            setJitsiLoading(false);
          });

          jitsiApiRef.current.addEventListener('participantJoined', (e: any) => {
            updateCount();
            if (isTeacherOrAdmin) {
              toast(<ParticipantToast name={e.displayName || "Student"} action="joined" />, { duration: 2000 });
            }
          });
          jitsiApiRef.current.addEventListener('participantLeft', (e: any) => {
            updateCount();
            if (isTeacherOrAdmin) {
              toast(<ParticipantToast name={e.displayName || "Student"} action="left" />, { duration: 2000 });
            }
          });

          if (isTeacherOrAdmin) {
            jitsiApiRef.current.addEventListener('raiseHandUpdated', (e: any) => {
              if (e.handRaised) {
                toast(`✋ ${e.participantId ? 'A student' : 'Someone'} raised their hand!`, { duration: 4000 });
              }
            });
          }

          setTimeout(() => {
            updateCount();
          }, 1500);
        } catch (err: any) {
          console.error("Jitsi init error:", err);
          setJitsiError("Failed to load video. Please try again.");
          setJitsiLoading(false);
        }
      };

      ensureJitsiApi()
        .then(loadAndInit)
        .catch(() => {
          setJitsiError("Failed to load video service. Check your internet connection.");
          setJitsiLoading(false);
        });
    }, 100);

    return () => {
      clearTimeout(timer);
      destroyJitsi();
    };
  }, [activeRoom, activeClassId, isTeacherOrAdmin, profile, user, destroyJitsi, role]);

  // Fullscreen
  const [isFullscreen, setIsFullscreen] = useState(false);
  const videoWrapperRef = useRef<HTMLDivElement>(null);

  const toggleFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        await videoWrapperRef.current?.requestFullscreen();
        try { await (screen.orientation as any)?.lock?.('landscape'); } catch {}
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        try { screen.orientation?.unlock?.(); } catch {}
        setIsFullscreen(false);
      }
    } catch {}
  }, []);

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  // ═══════════════ ACTIVE CLASS VIEW ═══════════════
  if (activeRoom && activeClassId) {
    const activeClass = classes.find((c) => c.id === activeClassId);
    const teacher = teacherProfiles[activeClass?.teacher_id];
    const studentCount = activeClass?.current_students || 0;
    const maxStudents = activeClass?.max_students || 100;
    const fillPercent = Math.min(100, Math.round((studentCount / maxStudents) * 100));

    return (
      <DashboardLayout>
        <div className="-m-3 sm:-m-4 lg:-m-6 flex flex-col h-[calc(100vh-48px)] lg:h-[calc(100vh-64px)] bg-background">
          {/* Top control bar */}
          {!isFullscreen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="px-3 sm:px-4 py-2 bg-card/95 backdrop-blur-md border-b border-border flex items-center justify-between gap-2 z-10"
            >
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                {/* Live indicator */}
                <div className="flex items-center gap-1.5 bg-destructive/10 border border-destructive/20 text-destructive px-2 py-1 rounded-full">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-destructive" />
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider">Live</span>
                </div>
                <h1 className="text-sm sm:text-base font-bold text-foreground truncate max-w-[140px] sm:max-w-none">
                  {activeClass?.title || "Live Class"}
                </h1>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                {/* Elapsed timer */}
                {activeClass?.updated_at && (
                  <div className="hidden sm:flex items-center gap-1 text-muted-foreground bg-muted px-2 py-1 rounded-full">
                    <Clock className="w-3 h-3" />
                    <ElapsedTimer startTime={activeClass.updated_at} />
                  </div>
                )}
                {/* Student count with progress bar */}
                <div className="flex items-center gap-1.5 bg-muted px-2 py-1 rounded-full">
                  <Users className="w-3 h-3 text-muted-foreground" />
                  <span className="text-xs font-medium text-foreground">{studentCount}</span>
                  <span className="text-[10px] text-muted-foreground">/{maxStudents}</span>
                  <div className="hidden sm:block w-12 h-1.5 bg-muted-foreground/20 rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${fillPercent}%` }} />
                  </div>
                </div>
                {/* Toggle chat */}
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShowChat(!showChat)}
                  title={showChat ? "Hide Chat" : "Show Chat"}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                </Button>
                {isTeacherOrAdmin && activeClass?.teacher_id === user?.id && (
                  <Button variant="destructive" size="sm" onClick={() => handleEndClass(activeClass)} className="text-xs h-8 gap-1">
                    <X className="w-3 h-3" /> End
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={handleLeaveClass} className="text-xs h-8">Leave</Button>
              </div>
            </motion.div>
          )}

          <div className="flex flex-col lg:flex-row flex-1 min-h-0 overflow-hidden">
            {/* Video area */}
              <div className="flex-1 flex flex-col min-w-0 min-h-0">
              <div ref={videoWrapperRef} className="relative w-full bg-black flex-1 min-h-[300px] lg:min-h-0">
                <div ref={jitsiContainerRef} className="absolute inset-0 w-full h-full" style={{ minHeight: '280px' }} />
                {/* Loading / Error overlay */}
                {(jitsiLoading || jitsiError) && (
                  <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/80 text-white">
                    {jitsiLoading && !jitsiError && (
                      <>
                        <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full mb-3" />
                        <p className="text-sm">Connecting to class...</p>
                      </>
                    )}
                    {jitsiError && (
                      <>
                        <X className="w-10 h-10 text-destructive mb-3" />
                        <p className="text-sm text-center px-4">{jitsiError}</p>
                        <Button variant="outline" size="sm" className="mt-3" onClick={() => { setJitsiError(null); handleLeaveClass(); }}>
                          Go Back
                        </Button>
                      </>
                    )}
                  </div>
                )}
                {/* Fullscreen toggle */}
                <button onClick={toggleFullscreen}
                  className="absolute top-3 right-3 z-10 bg-black/50 hover:bg-black/70 text-white rounded-lg p-2 transition-all backdrop-blur-sm group"
                >
                  {isFullscreen ? <Minimize2 className="w-5 h-5 group-hover:scale-110 transition-transform" /> : <Maximize2 className="w-5 h-5 group-hover:scale-110 transition-transform" />}
                </button>
                {/* HD badge */}
                <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5">
                  <span className="bg-emerald-500/90 text-white text-[9px] font-bold px-1.5 py-0.5 rounded backdrop-blur-sm">
                    {isTeacherOrAdmin ? 'HD BROADCASTING' : 'HD LIVE'}
                  </span>
                  {activeClass?.updated_at && (
                    <span className="sm:hidden bg-black/50 text-white text-[10px] px-1.5 py-0.5 rounded backdrop-blur-sm flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" />
                      <ElapsedTimer startTime={activeClass.updated_at} />
                    </span>
                  )}
                </div>
              </div>

              {/* Teacher info bar below video */}
              {!isFullscreen && teacher && (
                <div className="px-4 py-2.5 bg-card border-b border-border flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-white overflow-hidden ring-2 ring-primary/20">
                    {teacher.avatar_url ? (
                      <img src={teacher.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : teacher.full_name?.charAt(0)?.toUpperCase() || "T"}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{teacher.full_name}</p>
                    <p className="text-[11px] text-muted-foreground">Teacher</p>
                  </div>
                </div>
              )}
            </div>

            {/* Chat sidebar */}
            <AnimatePresence>
              {showChat && !isFullscreen && (
                <motion.div
                  initial={isMobile ? { y: 24, opacity: 0 } : { width: 0, opacity: 0 }}
                  animate={isMobile ? { y: 0, opacity: 1 } : { width: "auto", opacity: 1 }}
                  exit={isMobile ? { y: 24, opacity: 0 } : { width: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className={isMobile
                    ? "absolute inset-x-0 bottom-0 z-20 h-[46vh] border-t border-border overflow-hidden bg-card shadow-2xl"
                    : "h-[200px] lg:h-auto lg:w-[340px] xl:w-[380px] lg:min-w-[300px] flex-shrink-0 border-t lg:border-t-0 border-l-0 lg:border-l border-border overflow-hidden"
                  }
                >
                  <LiveChatSidebar classId={activeClassId} isTeacher={isTeacherOrAdmin} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // ═══════════════ CLASS LISTING ═══════════════
  return (
    <DashboardLayout>
      <div className="space-y-6 pb-16 lg:pb-0">
        <div>
          <h1 className="text-lg sm:text-2xl font-extrabold font-heading text-foreground flex items-center gap-2">
            <Video className="w-5 h-5 sm:w-6 sm:h-6 text-primary" /> Live Classes
          </h1>
          <p className="text-sm text-muted-foreground">
            {isTeacherOrAdmin ? "Manage and start your live classes" : "Join live interactive classes"}
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        ) : (
          <>
            {/* ────── LIVE NOW ────── */}
            {liveClasses.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-destructive" />
                  </span>
                  <h2 className="text-lg font-bold text-foreground">Live Now</h2>
                  <span className="text-xs bg-destructive/10 text-destructive font-semibold px-2 py-0.5 rounded-full">{liveClasses.length}</span>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  {liveClasses.map((c, i) => {
                    const teacher = teacherProfiles[c.teacher_id];
                    const isFull = (c.current_students || 0) >= (c.max_students || MAX_STUDENTS_PER_CLASS);
                    const isOwner = isTeacherOrAdmin && c.teacher_id === user?.id;
                    return (
                      <motion.div
                        key={c.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className={`group relative bg-card rounded-2xl overflow-hidden border-2 shadow-lg hover:shadow-xl transition-all ${
                          isFull && !isTeacherOrAdmin
                            ? "opacity-60 border-border"
                            : "border-destructive/30 hover:border-destructive/50 cursor-pointer"
                        }`}
                        onClick={() => !isOwner && !isFull && handleJoinClass(c)}
                      >
                        {/* Glow effect */}
                        <div className="absolute inset-0 bg-gradient-to-t from-destructive/5 to-transparent pointer-events-none" />
                        {/* Thumbnail */}
                        <div className="relative aspect-video bg-gradient-to-br from-muted to-muted/30 overflow-hidden">
                          {c.thumbnail_url ? (
                            <img src={c.thumbnail_url} alt={c.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-destructive/10 to-primary/10 flex items-center justify-center">
                              <Video className="w-14 h-14 text-muted-foreground/15" />
                            </div>
                          )}
                          {/* Overlays */}
                          <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-destructive text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg">
                            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" /> LIVE
                          </div>
                          <div className="absolute top-3 right-3 bg-emerald-500/90 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">HD</div>
                          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                            <span className="bg-black/70 backdrop-blur-sm text-white text-[10px] px-2 py-1 rounded-lg flex items-center gap-1.5">
                              <Users className="w-3 h-3" /> {c.current_students || 0}/{c.max_students || 100}
                            </span>
                            <span className="bg-black/70 backdrop-blur-sm text-white text-[10px] px-2 py-1 rounded-lg flex items-center gap-1">
                              <Clock className="w-3 h-3" /> {c.duration_minutes}min
                            </span>
                          </div>
                          {/* Play hover */}
                          {!isFull && !isOwner && (
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
                              <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100">
                                <Play className="w-8 h-8 text-white fill-white ml-1" />
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="p-4 relative">
                          <h3 className="font-bold text-foreground text-base truncate">{c.title}</h3>
                          {c.description && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{c.description}</p>}
                          {teacher && (
                            <div className="flex items-center gap-2 mt-2.5">
                              <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary overflow-hidden ring-1 ring-primary/10">
                                {teacher.avatar_url ? (
                                  <img src={teacher.avatar_url} alt="" className="w-full h-full object-cover" />
                                ) : teacher.full_name?.charAt(0)?.toUpperCase() || "T"}
                              </div>
                              <span className="text-xs font-medium text-muted-foreground">{teacher.full_name}</span>
                            </div>
                          )}
                          {isOwner ? (
                            <div className="flex gap-2 mt-3">
                               <Button onClick={(e) => { e.stopPropagation(); handleJoinClass(c); }}
                                 className="flex-1 bg-destructive hover:bg-destructive/90 text-white" size="sm">
                                 <Monitor className="w-3.5 h-3.5 mr-1" /> Open Studio
                              </Button>
                              <Button variant="outline" onClick={(e) => { e.stopPropagation(); handleEndClass(c); }} size="sm">
                                <X className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          ) : isFull ? (
                            <p className="text-xs text-destructive mt-2 font-semibold">Class is full</p>
                          ) : (
                             <p className="text-[11px] text-primary mt-2 font-medium">{joiningClassId === c.id ? "Joining class..." : "Tap to join class →"}</p>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ────── UPCOMING ────── */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4.5 h-4.5 text-primary" />
                <h2 className="text-lg font-bold text-foreground">Upcoming Classes</h2>
                {upcomingClasses.length > 0 && (
                  <span className="text-xs bg-primary/10 text-primary font-semibold px-2 py-0.5 rounded-full">{upcomingClasses.length}</span>
                )}
              </div>
              {upcomingClasses.length === 0 ? (
                <div className="text-center py-10 sm:py-16 bg-card rounded-2xl border border-border">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto rounded-xl sm:rounded-2xl bg-muted flex items-center justify-center mb-3 sm:mb-4">
                    <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-foreground mb-1">No Upcoming Classes</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground px-4">
                    {isTeacherOrAdmin ? "Schedule a class from your course page" : "Check back later for new classes"}
                  </p>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {upcomingClasses.map((c, i) => {
                    const teacher = teacherProfiles[c.teacher_id];
                    const isOwner = isTeacherOrAdmin && c.teacher_id === user?.id;
                    const scheduledDate = new Date(c.scheduled_at);
                    const isToday = new Date().toDateString() === scheduledDate.toDateString();
                    return (
                      <motion.div
                        key={c.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.08 }}
                        className="bg-card rounded-2xl overflow-hidden border border-border hover:shadow-lg hover:border-primary/30 transition-all group"
                      >
                        {/* Thumbnail */}
                        <div className="relative aspect-video bg-gradient-to-br from-muted to-muted/30 overflow-hidden">
                          {c.thumbnail_url ? (
                            <img src={c.thumbnail_url} alt={c.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-primary/5 to-primary/10 flex items-center justify-center">
                              <Video className="w-10 h-10 text-muted-foreground/15" />
                            </div>
                          )}
                          {/* Date badge */}
                          <div className={`absolute top-3 left-3 text-[10px] font-bold px-2 py-1 rounded-lg backdrop-blur-sm ${
                            isToday ? "bg-primary text-primary-foreground" : "bg-black/60 text-white"
                          }`}>
                            {isToday ? "TODAY" : scheduledDate.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                          </div>
                          {/* Countdown */}
                          <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-white text-[10px] px-2 py-1 rounded-lg">
                            <CountdownTimer scheduledAt={c.scheduled_at} />
                          </div>
                          <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded backdrop-blur-sm">
                            {c.duration_minutes}min
                          </div>
                        </div>
                        <div className="p-4">
                          <h3 className="font-bold text-foreground text-sm">{c.title}</h3>
                          {c.description && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{c.description}</p>}
                          {teacher && (
                            <div className="flex items-center gap-2 mt-2">
                              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-[9px] font-bold text-primary overflow-hidden">
                                {teacher.avatar_url ? (
                                  <img src={teacher.avatar_url} alt="" className="w-full h-full object-cover" />
                                ) : teacher.full_name?.charAt(0)?.toUpperCase() || "T"}
                              </div>
                              <span className="text-xs text-muted-foreground">{teacher.full_name}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-3 text-[11px] text-muted-foreground mt-2.5">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {scheduledDate.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3" /> Max {c.max_students || 100}
                            </span>
                          </div>
                          {isOwner && (
                            <div className="flex gap-2 mt-3">
                              <Button onClick={() => handleStartClass(c)} className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground" size="sm">
                                <Play className="w-3.5 h-3.5 mr-1" /> Start
                              </Button>
                              <Button variant="destructive" size="sm" onClick={() => handleDeleteClass(c)}>
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Empty state when nothing at all */}
            {liveClasses.length === 0 && upcomingClasses.length === 0 && (
              <div className="text-center py-12 sm:py-20 bg-card rounded-2xl border border-border">
                <div className="w-14 h-14 sm:w-20 sm:h-20 mx-auto rounded-xl sm:rounded-2xl bg-primary/5 flex items-center justify-center mb-3 sm:mb-4">
                  <Video className="w-7 h-7 sm:w-10 sm:h-10 text-primary/30" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-foreground mb-1">No Live Classes</h3>
                <p className="text-xs sm:text-sm text-muted-foreground max-w-sm mx-auto px-4">
                  {isTeacherOrAdmin
                    ? "Go to your course page and schedule a live class for your students."
                    : "Your teachers haven't scheduled any live classes yet. Check back later!"}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default LiveClasses;
