CREATE TABLE public.live_chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id uuid NOT NULL REFERENCES public.live_classes(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  user_name text NOT NULL DEFAULT '',
  message text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.live_chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view chat messages"
  ON public.live_chat_messages FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated can send chat messages"
  ON public.live_chat_messages FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

ALTER PUBLICATION supabase_realtime ADD TABLE public.live_chat_messages;