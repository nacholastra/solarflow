"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const json = (await res.json()) as { error?: string };
    setLoading(false);

    if (!res.ok) {
      setError(json.error ?? "No se pudo iniciar sesión");
      return;
    }

    router.replace("/admin");
    router.refresh();
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-neutral-950 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-neutral-800 text-neutral-100">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-semibold text-neutral-100">Panel de administración</h1>
          <p className="mt-1 text-sm text-neutral-500">Acceso restringido</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-2xl border border-neutral-800 bg-neutral-900 p-6"
        >
          {error && (
            <div className="rounded-lg border border-red-900/50 bg-red-950/40 px-3 py-2.5 text-sm text-red-300">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label
              htmlFor="username"
              className="text-xs font-medium uppercase tracking-wide text-neutral-500"
            >
              Usuario
            </label>
            <input
              id="username"
              type="text"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="h-11 w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 text-neutral-100 outline-none focus:border-neutral-600"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="password"
              className="text-xs font-medium uppercase tracking-wide text-neutral-500"
            >
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-11 w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 text-neutral-100 outline-none focus:border-neutral-600"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="h-11 w-full rounded-lg bg-neutral-100 font-medium text-neutral-900 transition hover:bg-white disabled:opacity-60"
          >
            {loading ? "Accediendo…" : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}
