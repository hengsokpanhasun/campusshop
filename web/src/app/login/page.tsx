"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { login, register } from "../../lib/api";
import type { User } from "../../lib/types";

// Login / register (client). Stores the JWT + user in localStorage. (Week 8 on the client side)
export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"CUSTOMER" | "MERCHANT">("CUSTOMER");
  const [err, setErr] = useState("");
  const [me, setMe] = useState<User | null>(null);

  useEffect(() => {
    try {
      setMe(JSON.parse(localStorage.getItem("user") || "null"));
    } catch {
      setMe(null);
    }
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    try {
      const res = mode === "login" ? await login(email, password) : await register(name, email, password, role);
      localStorage.setItem("token", res.token);
      localStorage.setItem("user", JSON.stringify(res.user));
      window.dispatchEvent(new Event("cart:changed")); // refresh nav
      router.push(res.user.role === "MERCHANT" ? "/dashboard" : "/");
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Something went wrong");
    }
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setMe(null);
    window.dispatchEvent(new Event("cart:changed"));
  }

  if (me) {
    return (
      <div className="panel" style={{ maxWidth: 420, margin: "0 auto" }}>
        <h1>Hi, {me.name}</h1>
        <p className="muted">Signed in as {me.email} ({me.role.toLowerCase()}).</p>
        <button className="btn btn-ghost" onClick={logout}>Log out</button>
      </div>
    );
  }

  return (
    <div className="panel" style={{ maxWidth: 420, margin: "0 auto" }}>
      <h1>{mode === "login" ? "Log in" : "Create account"}</h1>
      {err && <div className="notice err">{err}</div>}
      <form onSubmit={submit}>
        {mode === "register" && (
          <>
            <label htmlFor="name">Name</label>
            <input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
          </>
        )}
        <label htmlFor="email">Email</label>
        <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <label htmlFor="password">Password</label>
        <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
        {mode === "register" && (
          <>
            <label htmlFor="role">I want to</label>
            <select id="role" value={role} onChange={(e) => setRole(e.target.value as "CUSTOMER" | "MERCHANT")}>
              <option value="CUSTOMER">Buy products (customer)</option>
              <option value="MERCHANT">Sell products (merchant)</option>
            </select>
          </>
        )}
        <button className="btn btn-primary" style={{ marginTop: 18, width: "100%" }} type="submit">
          {mode === "login" ? "Log in" : "Create account"}
        </button>
      </form>
      <p className="muted" style={{ marginTop: 14 }}>
        {mode === "login" ? "No account?" : "Have an account?"}{" "}
        <a role="button" onClick={() => { setErr(""); setMode(mode === "login" ? "register" : "login"); }} style={{ color: "var(--indigo)", cursor: "pointer" }}>
          {mode === "login" ? "Register" : "Log in"}
        </a>
      </p>
      <p className="muted">Demo: merchant@demo.com / customer@demo.com — password: <code>password</code></p>
    </div>
  );
}
