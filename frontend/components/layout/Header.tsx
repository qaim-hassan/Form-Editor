import Link from "next/link";
import { FileText } from "lucide-react";

export function Header() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold text-slate-900">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-white">
            <FileText className="h-5 w-5" />
          </span>
          Dynamic Form Builder
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/" className="text-slate-600 hover:text-brand-600">
            Dashboard
          </Link>
          <Link
            href="/forms/new"
            className="rounded-lg bg-brand-600 px-3 py-1.5 font-medium text-white hover:bg-brand-700"
          >
            New Form
          </Link>
        </nav>
      </div>
    </header>
  );
}
