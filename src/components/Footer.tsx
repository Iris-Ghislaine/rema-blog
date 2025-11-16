export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-10 mt-16">
      <div className="container text-center">
        <p>&copy; {new Date().getFullYear()} Rema-Blog. All rights reserved.</p>
      </div>
    </footer>
  );
}