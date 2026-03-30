-- Live classes table
CREATE TABLE public.live_classes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  title_hi text NOT NULL DEFAULT '',
  description text,
  course_id uuid REFERENCES public.courses(id),
  teacher_id uuid NOT NULL,
  room_id text NOT NULL DEFAULT gen_random_uuid()::text,
  scheduled_at timestamp with time zone NOT NULL,
  duration_minutes integer DEFAULT 60,
  status text NOT NULL DEFAULT 'scheduled',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.live_classes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view live classes"
  ON public.live_classes FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Teachers can create live classes"
  ON public.live_classes FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'teacher') OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Teachers can update own live classes"
  ON public.live_classes FOR UPDATE TO authenticated
  USING (teacher_id = auth.uid() OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Teachers can delete own live classes"
  ON public.live_classes FOR DELETE TO authenticated
  USING (teacher_id = auth.uid() OR has_role(auth.uid(), 'admin'));

ALTER PUBLICATION supabase_realtime ADD TABLE public.live_classes;