import { PRCard } from "../components/PRCard";
import { WorkoutHeatmap } from "../components/WorkoutHeatmap";
import { LoadEvolution } from "../components/LoadEvolution";
import { useAuth } from "../contexts/AuthContext";
import { LogOutIcon } from "lucide-react";

export const Stats = () => {
  const { user, signOut } = useAuth();
  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 pb-24">
      <h1 className="text-2xl font-bold mb-6">Stats</h1>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-auto">
        {/* PR Card - Largest, most prominent */}
        <div className="md:col-span-1 lg:row-span-2">
          <PRCard />
        </div>

        {/* Workout Heatmap - Wide */}
        <div className="md:col-span-1 lg:col-span-2">
          <WorkoutHeatmap />
        </div>

        {/* Load Evolution - Wide */}
        <div className="md:col-span-2 lg:col-span-2">
          <LoadEvolution />
        </div>
      </div>

      <p className="mt-8 text-sm text-base-content/60 text-center">
        Logged in as <span className="font-semibold text-base-content">{user?.email}</span>
      </p>
      <button onClick={handleSignOut} className="mt-6 w-full btn btn-soft">
        <LogOutIcon size={16} />
        Sign Out
      </button>
    </div>
  );
};
