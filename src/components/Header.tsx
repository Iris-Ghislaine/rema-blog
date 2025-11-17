import Link from "next/link";

export default function Header() {
  return (
    <header className="bg-white shadow-sm py-4">
      <div className="container flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-gray-800">
          Rema<span className="text-teal-600">-Blog</span>
        </Link>
        <nav>
          <ul className="flex gap-10">
            <li>
              <Link href="/" className="text-gray-600 hover:text-gray-900">
                Home
              </Link>
            </li>
            <li>
              <Link href="/about" className="text-gray-600 hover:text-gray-900">
                About
              </Link>
            </li>
            <li>
              <Link href="/write" className="text-gray-600 hover:text-gray-900">
                Write
              </Link>
            </li>
<li><Link href="/profile" className="hover:text-emerald-300 transition">
  Profile
</Link></li>

          </ul>
        </nav>
      </div>
    </header>
  );
}
