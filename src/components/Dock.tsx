import { Link, useLocation } from "wouter";
import { DumbbellIcon, History, BarChart3, HomeIcon } from "lucide-react";

export const Dock = () => {
  const [location] = useLocation();
  // const { user, signOut } = useAuth();
  // const [showUserMenu, setShowUserMenu] = useState(false);

  const navItems = [
    { path: "/", label: "Home", icon: HomeIcon },
    { path: "/workouts", label: "Workouts", icon: DumbbellIcon },
    { path: "/history", label: "History", icon: History },
    { path: "/stats", label: "Stats", icon: BarChart3 },
  ];

  return (
    <div className="dock dock-md">
      {navItems.map((item) => {
        const isActive = location === item.path;
        const Icon = item.icon;
        return (
          <Link
            className={`${isActive && "dock-active text-accent"}`}
            to={item.path}
          >
            <Icon />
            <span className="dock-label mb-1">{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
};
