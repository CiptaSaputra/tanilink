export default function NotFound() {
  return (
    <div className="min-h-screen bg-nat-light-cream flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-nat-dark mb-2">404</h1>
        <p className="text-nat-sage mb-4">Halaman tidak ditemukan</p>
        <a href="/" className="text-nat-green hover:text-nat-green-hover font-medium">
          Kembali ke beranda
        </a>
      </div>
    </div>
  );
}
