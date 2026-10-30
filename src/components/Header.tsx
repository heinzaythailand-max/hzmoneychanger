export default function Header() {
  return (
    <header className="sticky top-0 z-20 bg-gradient-to-r from-green-600 to-emerald-500 text-white shadow-md">
      <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center shadow-sm">
            <span className="text-white font-bold text-sm">HZ</span>
          </div>
          <h1 className="font-semibold text-base leading-tight">
            HeinZay Remittance
          </h1>
        </div>
      </div>
    </header>
  );
}
