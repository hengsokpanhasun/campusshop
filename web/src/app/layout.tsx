import type { Metadata } from "next";
import "./globals.css";
import { Nav } from "../components/Nav";

export const metadata: Metadata = {
  title: "CampusShop — buy & sell on campus",
  description: "A student e-commerce store: browse products, add to cart, and check out.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Nav />
        <main className="container">{children}</main>
        <footer className="site-footer">
          <p>CampusShop — a Full-Stack capstone project.</p>
        </footer>
      </body>
    </html>
  );
}
