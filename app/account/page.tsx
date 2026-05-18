import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { LogoutButton } from "@/components/logout-button";

export default async function AccountPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#070A12] to-[#0B1020] text-white">
      <div className="mx-auto max-w-3xl p-6">
        <div className="flex items-center justify-between">
          <div className="text-2xl font-extrabold tracking-tight">Account</div>
          <a className="opacity-80 hover:opacity-100" href="/today">Today</a>
        </div>

        <div className="mt-5 rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur space-y-4">
          <div>
            <div className="text-xs opacity-60 uppercase tracking-widest mb-1">Email</div>
            <div className="font-semibold">{user.email}</div>
          </div>
          <div className="pt-2">
            <LogoutButton />
          </div>
        </div>
      </div>
    </div>
  );
}
