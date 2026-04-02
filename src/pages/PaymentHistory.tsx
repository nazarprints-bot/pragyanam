import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import BottomNav from "@/components/BottomNav";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { CreditCard, CheckCircle2, Clock, IndianRupee, CalendarDays, ShieldCheck } from "lucide-react";
import { format } from "date-fns";

interface Payment {
  id: string;
  razorpay_order_id: string;
  razorpay_payment_id: string | null;
  amount: number;
  currency: string;
  status: string;
  plan: string;
  created_at: string;
  paid_at: string | null;
}

const PaymentHistory = () => {
  const { profile, role } = useAuth();
  const { language } = useLanguage();
  const isHi = language === "hi";
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      const { data, error } = await supabase
        .from("payments")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) setPayments(data as Payment[]);
      setLoading(false);
    };
    fetchPayments();
  }, []);

  const trialActive = profile?.trial_ends_at && new Date(profile.trial_ends_at) > new Date();
  const daysLeft = profile?.trial_ends_at
    ? Math.max(0, Math.ceil((new Date(profile.trial_ends_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-xl font-bold text-foreground">
            {isHi ? "भुगतान इतिहास" : "Payment History"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isHi ? "आपके सभी लेन-देन और सदस्यता की स्थिति" : "Your transactions and subscription status"}
          </p>
        </div>

        {/* Subscription Status Card */}
        <div className="rounded-xl border border-border bg-card p-5 space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <ShieldCheck className="w-4.5 h-4.5 text-primary" />
            {isHi ? "सदस्यता स्थिति" : "Subscription Status"}
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">
                {isHi ? "योजना" : "Plan"}:{" "}
                <span className="font-medium text-foreground capitalize">
                  {profile?.subscription_plan === "paid" ? (isHi ? "पेड (₹299/माह)" : "Paid (₹299/month)") : (isHi ? "फ्री" : "Free")}
                </span>
              </p>
              {profile?.trial_ends_at && (
                <p className="text-sm text-muted-foreground">
                  {isHi ? "वैध तक" : "Valid until"}:{" "}
                  <span className="font-medium text-foreground">
                    {format(new Date(profile.trial_ends_at), "dd MMM yyyy")}
                  </span>
                </p>
              )}
            </div>

            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
              trialActive
                ? "bg-green-500/10 text-green-600 dark:text-green-400"
                : "bg-red-500/10 text-red-600 dark:text-red-400"
            }`}>
              {trialActive ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
              {trialActive
                ? (isHi ? `${daysLeft} दिन बाकी` : `${daysLeft} days left`)
                : (isHi ? "समाप्त" : "Expired")}
            </div>
          </div>
        </div>

        {/* Payment List */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-foreground">
            {isHi ? "लेन-देन" : "Transactions"}
          </h2>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />
              ))}
            </div>
          ) : payments.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-8 text-center">
              <CreditCard className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                {isHi ? "अभी तक कोई भुगतान नहीं" : "No payments yet"}
              </p>
            </div>
          ) : (
            payments.map((payment) => (
              <div key={payment.id} className="rounded-xl border border-border bg-card p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                    payment.status === "paid"
                      ? "bg-green-500/10 text-green-600 dark:text-green-400"
                      : "bg-amber-500/10 text-amber-600"
                  }`}>
                    {payment.status === "paid" ? <CheckCircle2 className="w-4.5 h-4.5" /> : <Clock className="w-4.5 h-4.5" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground capitalize">
                      {payment.plan === "monthly" ? (isHi ? "मासिक सदस्यता" : "Monthly Subscription") : payment.plan}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[11px] text-muted-foreground flex items-center gap-0.5">
                        <CalendarDays className="w-3 h-3" />
                        {format(new Date(payment.paid_at || payment.created_at), "dd MMM yyyy, hh:mm a")}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-foreground flex items-center gap-0.5">
                    <IndianRupee className="w-3.5 h-3.5" />
                    {(payment.amount / 100).toFixed(0)}
                  </p>
                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                    payment.status === "paid"
                      ? "bg-green-500/10 text-green-600 dark:text-green-400"
                      : "bg-amber-500/10 text-amber-600"
                  }`}>
                    {payment.status === "paid" ? (isHi ? "सफल" : "Success") : payment.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      <BottomNav />
    </DashboardLayout>
  );
};

export default PaymentHistory;
