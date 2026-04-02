

# Student & Teacher Flow Analysis + UX Improvement Plan

## Current Student Flow

```text
Landing Page → Auth (Signup/Login) → Student Home Dashboard
                                         ├── Live Classes (Join via Jitsi)
                                         ├── Academic Classes (Class 6-12)
                                         ├── Competitive Prep (Army/Police/Govt)
                                         ├── Courses → Course Detail → Lessons
                                         ├── Recorded Lectures (by class/subject/chapter)
                                         ├── Tests (take test → see result)
                                         ├── Doubts (post & view replies)
                                         ├── Progress (stats)
                                         ├── Certificates
                                         ├── Notifications
                                         └── Profile (edit info, avatar)
```

**Issues Found:**
1. **No onboarding** — after signup, student lands on dashboard with no guidance
2. **No search** — students can't search courses/teachers/content
3. **No progress indicator on courses** — enrolled courses show no completion %
4. **Bottom nav has only 5 tabs** — Tests & Doubts are hidden, only accessible via sidebar
5. **No empty states with CTAs** — when no enrolled courses, just blank
6. **Doubts page** — no subject tagging, no teacher name on replies, no status filter for students
7. **Test result page** — no detailed question-wise review after submission

---

## Current Teacher Flow

```text
Auth (Login) → Teacher Dashboard
                  ├── My Courses (create/manage)
                  ├── Manual Test Creator
                  ├── AI Test Generator
                  ├── Test Responses (view student scores)
                  ├── Doubts (answer student questions)
                  ├── Notifications
                  └── Profile
```

**Issues Found:**
1. **No student analytics per course** — teacher can't see which students are enrolled or their progress
2. **No lesson management** — TeacherUpload only creates courses, no flow to add subjects → chapters → lessons
3. **No bulk test upload** — only one question at a time
4. **No doubt assignment** — all doubts visible, no "assigned to me" filter
5. **Quick actions on dashboard** — only 3 actions, missing "View Responses" and "Upload Lesson"
6. **No course preview** — teacher can't preview how students see their course

---

## UX Improvement Plan

### Phase 1: Student Experience (High Impact)

**1. Onboarding Welcome Screen**
- After first login, show a 3-step onboarding: choose interests (subjects), set daily study goal, discover popular courses
- Store `onboarding_completed` flag in profiles table
- File: new `src/pages/Onboarding.tsx`, update `DashboardRouter.tsx`

**2. Global Search Bar**
- Add search in dashboard header — search courses, teachers, subjects
- Debounced search with category tabs (All / Courses / Teachers)
- File: new `src/components/SearchBar.tsx`, update `DashboardLayout.tsx`

**3. Course Progress Tracking**
- Show completion % on enrolled course cards (lessons watched / total lessons)
- Add a progress bar component to course cards in StudentHome
- File: update `StudentHome.tsx`, add progress calculation query

**4. Better Empty States**
- When no enrolled courses: show illustration + "Browse Courses" CTA
- When no live classes: show next upcoming class countdown
- File: update `StudentHome.tsx`

**5. Enhanced Bottom Nav**
- Replace 5-tab with contextual tab: Home, Classes, Tests, Doubts, Profile
- Tests & Doubts are high-usage features — they deserve bottom nav spots
- File: update `BottomNav.tsx`

### Phase 2: Teacher Experience (High Impact)

**6. Full Content Management Flow**
- After creating a course, teacher can add Subjects → Chapters → Lessons (video/PDF upload)
- Step-by-step wizard: Course → Subject → Chapter → Lesson
- File: update `TeacherUpload.tsx` with tabbed interface, new lesson upload form

**7. Student Analytics per Course**
- Show enrolled student count, average test score, lesson completion rate per course
- File: new section in `Dashboard.tsx` teacher view

**8. Quick Actions Enhancement**
- Add "Upload Lesson", "View Responses", "Schedule Live Class" to teacher dashboard quick actions
- File: update `Dashboard.tsx`

**9. Doubt Assignment & Filters**
- Teacher can filter: "My Subject Doubts" / "Unanswered" / "All"
- Show student name and course context on each doubt
- File: update `Doubts.tsx`

### Phase 3: Shared UX Polish

**10. Toast Notifications in Hindi**
- All success/error toasts should be bilingual based on language context
- File: update all toast calls to use `t()` translations

**11. Skeleton Loading States**
- Replace spinner with skeleton cards on StudentHome, Dashboard, Tests
- File: add skeleton components to loading states

**12. Pull-to-Refresh on Mobile**
- Add pull-to-refresh gesture on StudentHome and Tests page
- File: add refresh handler with touch events

### Database Changes Required
- Add `onboarding_completed` boolean column to `profiles` table (default false)
- Add `subject_tag` column to `doubts` table for subject-based filtering
- No new tables needed — all improvements use existing schema

### Priority Order
1. Onboarding → highest impact for new users
2. Search bar → most requested feature in EdTech
3. Better bottom nav → instant usability improvement
4. Content management flow → unblocks teacher productivity
5. Empty states + skeletons → polish

