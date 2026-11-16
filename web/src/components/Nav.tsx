"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { cartCount, loadCart } from "../lib/cart";
import type { User } from "../lib/types";

export function Nav() {
  const [count, setCount] = useState(0);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const sync = () => {
      setCount(cartCount(loadCart()));
      try {
        setUser(JSON.parse(localStorage.getItem("user") || "null"));
      } catch {
        setUser(null);
      }
    };
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener("cart:changed", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("cart:changed", sync);
    };
  }, []);

  return (
    <nav className="nav">
      <Link href="/" className="brand">
        <span className="brand-mark">C</span> CampusShop
      </Link>
      <div className="nav-links">
        <Link href="/">Browse</Link>
        <Link href="/cart">
          Cart{count > 0 && <span className="cart-badge">{count}</span>}
        </Link>
        {user?.role === "MERCHANT" && <Link href="/dashboard">Dashboard</Link>}
        {user ? (
          <Link href="/login">{user.name.split(" ")[0]}</Link>
        ) : (
          <Link href="/login">Login</Link>
        )}
      </div>
    </nav>
  );
}
