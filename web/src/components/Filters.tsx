"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import type { Category } from "../lib/types";

// Client component: search + category filter. Updates the URL query, which re-renders the
// server page with new data (Week 6 — state + routing working together).
export function Filters({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const params = useSearchParams();
  const [q, setQ] = useState(params.get("q") || "");

  function apply(next: Record<string, string>) {
    const sp = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(next)) {
      if (v) sp.set(k, v);
      else sp.delete(k);
    }
    sp.delete("page");
    router.push(`/?${sp.toString()}`);
  }

  return (
    <div className="toolbar">
      <form
        className="search"
        onSubmit={(e) => {
          e.preventDefault();
          apply({ q });
        }}
      >
        <label htmlFor="search" className="sr-only">Search products</label>
        <input id="search" type="search" placeholder="Search products…" value={q} onChange={(e) => setQ(e.target.value)} />
      </form>
      <select
        aria-label="Filter by category"
        value={params.get("category") || "all"}
        onChange={(e) => apply({ category: e.target.value })}
      >
        <option value="all">All categories</option>
        {categories.map((c) => (
          <option key={c.id} value={c.slug}>{c.name}</option>
        ))}
      </select>
    </div>
  );
}
