// Fixed bottom navigation for phones (hidden on tablet/desktop where headers
// carry navigation). Safe-area aware so it never collides with the iPhone
// home indicator or Android gesture areas.
import { Link, useLocation } from "react-router-dom";
import { Home, ShieldCheck } from "lucide-react";
import { useI18n } from "@/lib/i18n";

const ITEMS = [
  { to: "/", labelKey: "nav.home", icon: Home, exact: true },
  { to: "/dashboard", labelKey: "nav.parents", icon: ShieldCheck, exact: false },
];

export default function BottomNav() {
  const { pathname } = useLocation();
  const { t } = useI18n();

  return (
    <nav
      aria-label={t("common.parentSettings")}
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-card pb-safe lg:hidden"
    >
      <div className="mx-auto grid max-w-md grid-cols-2">
        {ITEMS.map(({ to, labelKey, icon: Icon, exact }) => {
          const active = exact ? pathname === "/" : pathname.startsWith(to);
          return (
            <Link
              key={to}
              to={to}
              aria-current={active ? "page" : undefined}
              className={`flex min-h-16 flex-col items-center justify-center gap-1 px-2 text-xs font-semibold ${
                active ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <Icon className="h-6 w-6" aria-hidden="true" />
              {t(labelKey)}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}