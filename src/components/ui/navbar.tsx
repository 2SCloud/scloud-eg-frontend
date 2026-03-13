"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Home" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/routes", label: "Routes" },
];

export default function NavBar() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-4 p-4 bg-gray-900 text-white">
        <img src="/small_logo.svg" alt="small_logo" style={{ width: '110px', height: '32px' }} />
        {links.map(({ href, label }) => (
            <Link
                key={href}
                href={href}
                className={pathname === href ? "text-blue-400 font-bold" : "hover:text-gray-300"}
            >
                {label}
            </Link>
        ))}
    </nav>
  );
}