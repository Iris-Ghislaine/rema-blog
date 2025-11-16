// src/components/Header.tsx
import Link from "next/link";

export default function Header() {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container py-4 flex justify-between items-center">

        <Link href="/" className="text-2xl font-bold text-gray-800">
          Rema<span className="text-teal-600">-Blog</span>
        </Link>
        <nav>
          <ul className="flex space-x-6">
            <li>
              <Link href="/" className="text-gray-600 hover:text-gray-900 transition">
                Home
              </Link>
            </li>
            <li>
              <Link href="/about" className="text-gray-600 hover:text-gray-900 transition">
                About
              </Link>
            </li>
            <li>
              <Link href="/write" className="text-gray-600 hover:text-gray-900 transition">
                Write
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}