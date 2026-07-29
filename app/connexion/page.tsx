import { Header } from "@/components/layout/Header";
import { LoginForm } from "@/components/forms/LoginForm";
import { getSessionUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  const user = await getSessionUser();
  if (user) {
    // ✅ CORRECTION : Gérer les 3 rôles possibles (ADMIN, VENDOR, CLIENT)
    if (user.role === "ADMIN") {
      redirect("/admin");
    } else if (user.role === "VENDOR") {
      redirect("/vendeur");
    } else {
      redirect("/client");
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      <Header />
      <main className="mx-auto max-w-md px-4 py-16">
        <h1 className="mb-2 text-center text-2xl font-bold text-stone-900">
          Hiditra
        </h1>
        <p className="mb-8 text-center text-stone-500">
          Midira amin&apos;ny kaontinao
        </p>
        <div className="rounded-2xl border border-amber-100 bg-white p-6 shadow-sm">
          <LoginForm />
        </div>
      </main>
    </div>
  );
}
