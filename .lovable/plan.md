

# Live Stream System — Bina YouTube ke

## Kya banega?

Jitsi ko "stage mode" mein use karenge — teacher ka video ek taraf, aur side mein live chat. Students sirf dekhenge aur chat karenge, unka camera/mic nahi chalega.

```text
┌─────────────────────────────────┬──────────────┐
│                                 │  Live Chat   │
│     Teacher Video Stream        │  ─────────── │
│     (Jitsi - only teacher       │  Ravi: Hello │
│      has camera/mic)            │  Priya: 👍   │
│                                 │  Sir: Thanks │
│                                 │  ─────────── │
│                                 │  [Type msg ▶]│
└─────────────────────────────────┴──────────────┘
Mobile: Video upar, Chat neeche (stacked)
```

## Steps

### 1. Database — `live_chat_messages` table banao
- Columns: `id`, `class_id`, `user_id`, `user_name`, `message`, `created_at`
- RLS: Authenticated users can read & insert
- Realtime enable karenge taaki messages instant dikhen

### 2. Jitsi ko "One-Way Broadcast" mode mein set karo
- Students ke liye Jitsi iframe mein config pass karenge:
  - `startWithAudioMuted=true`
  - `startWithVideoMuted=true`
  - `disableModeratorIndicator=true`
  - Toolbar buttons hide (camera/mic buttons remove)
- Teacher ke liye normal Jitsi (camera + mic ON)
- Result: Sirf teacher dikhega, students sirf dekhenge — YouTube jaisa experience

### 3. Live Chat sidebar banao (`LiveClasses.tsx` mein)
- Right side mein scrolling chat panel
- Real-time Supabase subscription — koi message bheje toh sabko turant dikhe
- Input field + send button at bottom
- Username ke saath messages dikhen
- Auto-scroll to latest message

### 4. UI Layout update karo
- Desktop: 70% video | 30% chat (side by side)
- Mobile: Video upar (60vh), Chat neeche (collapsible)
- Teacher ko "End Class" button chat ke upar

### 5. LanguageContext mein chat strings add karo
- "Type a message", "Send", "Live Chat" — Hindi + English

## Technical Details

- **No external service needed** — Jitsi free hai, chat Supabase Realtime se
- **No YouTube account/subscribers needed**
- Teacher ko sirf "Start Class" dabana hai, baaki automatic
- Backward compatible — purana system bhi kaam karega

