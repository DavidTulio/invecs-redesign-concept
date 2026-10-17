import { Suspense } from "react";
import { LogOut } from "lucide-react";
import { signOut } from "@/actions/admin-auth";
import { AdminNav, AdminNavList } from "@/components/admin/AdminNav";

/**
 * Admin panel shell: header and menu. Each page inside shows its own placeholder
 * while it checks the login and loads data, so this frame shows straight away.
 * The shell itself holds no data; each page checks the admin with requireAdmin().
 */
export default function AdminPanelLayout({ children }: LayoutProps<"/admin">) {
  return (
    <>
      <header className="border-b border-line bg-paper">
        <div className="container-site flex flex-wrap items-center justify-between gap-x-6 gap-y-3 py-3">
          <p className="flex items-baseline gap-2">
            <span className="font-wider text-lg font-extrabold">INVECS</span>
            <span className="rounded bg-soft px-1.5 py-0.5 text-xs font-semibold tracking-wide text-muted uppercase">
              Admin
            </span>
          </p>
          <form action={signOut} className="sm:order-last">
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-field px-3 py-2 text-sm font-semibold text-ink-2 hover:bg-soft"
            >
              <LogOut aria-hidden size={16} />
              Sign out
            </button>
          </form>
          <div className="w-full sm:w-auto sm:flex-1">
            <Suspense fallback={<AdminNavList pathname={null} />}>
              <AdminNav />
            </Suspense>
          </div>
        </div>
      </header>
      <div className="container-site py-6 sm:py-8">
        {children}
      </div>
    </>
  );
}
