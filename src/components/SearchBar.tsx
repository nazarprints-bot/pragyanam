import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Search, X, BookOpen, Users } from "lucide-react";

interface SearchResult {
  id: string;
  title: string;
  type: "course" | "teacher";
  subtitle?: string;
}

const SearchBar = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const isHi = language === "hi";

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    if (query.length < 2) { setResults([]); return; }
    const timer = setTimeout(async () => {
      setLoading(true);
      const [coursesRes, teachersRes] = await Promise.all([
        supabase.from("courses").select("id, title, title_hi, category").eq("is_published", true).ilike("title", `%${query}%`).limit(5),
        supabase.from("profiles").select("user_id, full_name, school").ilike("full_name", `%${query}%`).limit(5),
      ]);

      const courseResults: SearchResult[] = (coursesRes.data || []).map((c: any) => ({
        id: c.id,
        title: isHi && c.title_hi ? c.title_hi : c.title,
        type: "course",
        subtitle: c.category,
      }));

      // Filter teachers from profiles by checking user_roles
      const teacherResults: SearchResult[] = (teachersRes.data || []).map((p: any) => ({
        id: p.user_id,
        title: p.full_name,
        type: "teacher",
        subtitle: p.school || "",
      }));

      setResults([...courseResults, ...teacherResults.slice(0, 3)]);
      setLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [query, isHi]);

  const handleSelect = (r: SearchResult) => {
    setOpen(false);
    setQuery("");
    if (r.type === "course") navigate(`/dashboard/course/${r.id}`);
    else navigate(`/dashboard/teachers/${r.id}`);
  };

  return (
    <div ref={ref} className="relative flex-1 max-w-xs sm:max-w-sm">
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => query.length >= 2 && setOpen(true)}
          placeholder={isHi ? "कोर्स, शिक्षक खोजें..." : "Search courses, teachers..."}
          className="w-full h-8 pl-8 pr-8 rounded-lg border border-border bg-muted/50 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
        />
        {query && (
          <button onClick={() => { setQuery(""); setResults([]); }} className="absolute right-2 top-1/2 -translate-y-1/2">
            <X className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        )}
      </div>

      {open && (query.length >= 2) && (
        <div className="absolute top-full mt-1 left-0 right-0 bg-card border border-border rounded-xl shadow-lg z-50 overflow-hidden max-h-64 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-sm text-muted-foreground">{isHi ? "खोज रहे हैं..." : "Searching..."}</div>
          ) : results.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">{isHi ? "कुछ नहीं मिला" : "No results found"}</div>
          ) : (
            results.map((r) => (
              <button
                key={`${r.type}-${r.id}`}
                onClick={() => handleSelect(r)}
                className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-muted/50 transition-colors text-left"
              >
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  {r.type === "course" ? <BookOpen className="w-4 h-4 text-primary" /> : <Users className="w-4 h-4 text-primary" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground truncate">{r.title}</p>
                  <p className="text-[10px] text-muted-foreground">{r.subtitle}</p>
                </div>
                <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground shrink-0">
                  {r.type === "course" ? (isHi ? "कोर्स" : "Course") : (isHi ? "शिक्षक" : "Teacher")}
                </span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
