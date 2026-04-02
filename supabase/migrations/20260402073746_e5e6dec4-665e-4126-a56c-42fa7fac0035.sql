
-- Create payments table for transaction history
CREATE TABLE public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  razorpay_order_id text NOT NULL,
  razorpay_payment_id text,
  amount integer NOT NULL DEFAULT 29900,
  currency text NOT NULL DEFAULT 'INR',
  status text NOT NULL DEFAULT 'created',
  plan text NOT NULL DEFAULT 'monthly',
  created_at timestamptz NOT NULL DEFAULT now(),
  paid_at timestamptz
);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Students see own payments
CREATE POLICY "Users see own payments" ON public.payments
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Admins see all payments  
CREATE POLICY "Admins see all payments" ON public.payments
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Service role inserts (edge function uses service role key)
CREATE POLICY "Service can insert payments" ON public.payments
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
