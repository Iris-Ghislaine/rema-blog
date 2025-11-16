export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-8 mt-16">
      <div className="container text-center">
        <p>&copy; {new Date().getFullYear()} Rema-Blog. All rights reserved.</p>
        <p className="text-sm text-gray-400 mt-2">
          Built with Next.js • Deployed on Vercel
        </p>
      </div>
    </footer>
  );
}