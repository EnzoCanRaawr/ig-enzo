import { Home, Clapperboard, Briefcase, User } from "lucide-react";

export type MobileNavId = "posts" | "reels" | "works" | "profile";

const items = [
  { id: "posts" as const, label: "Home", icon: Home },
  { id: "reels" as const, label: "Reels", icon: Clapperboard },
  { id: "works" as const, label: "Works", icon: Briefcase },
  { id: "profile" as const, label: "Profile", icon: User },
];

const MobileNav = ({
  active,
  onSelect,
  avatarUrl,
}: {
  active: MobileNavId;
  onSelect: (id: MobileNavId) => void;
  avatarUrl: string;
}) => (
  <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-black/90 backdrop-blur-xl pb-[env(safe-area-inset-bottom)]">
    <ul className="flex items-center justify-around px-2 py-2">
      {items.map((item) => {
        const isActive = active === item.id;
        return (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => onSelect(item.id)}
              aria-label={item.label}
              aria-current={isActive ? "page" : undefined}
              className="flex flex-col items-center justify-center w-16 py-1.5"
            >
              {item.id === "profile" ? (
                <img
                  src={avatarUrl}
                  alt=""
                  className={`w-6 h-6 rounded-full object-cover ${
                    isActive ? "ring-2 ring-white" : "ring-1 ring-white/30"
                  }`}
                />
              ) : (
                <item.icon
                  className={`w-6 h-6 ${isActive ? "text-white" : "text-white/50"}`}
                  strokeWidth={isActive ? 2.2 : 1.6}
                />
              )}
            </button>
          </li>
        );
      })}
    </ul>
  </nav>
);

export default MobileNav;
