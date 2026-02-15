import { Dumbbell, Cog, Flame } from "lucide-react";
import { usePersonalRecords } from "../hooks/useStats";
import { useWorkoutSessions } from "../hooks/useSessions";
import { useMemo } from "react";

export const PRCard = () => {
  const { data: allPrs, isLoading: prsLoading } = usePersonalRecords();
  const { data: sessions, isLoading: sessionsLoading } = useWorkoutSessions(100);

  // Calculate workouts this month
  const workoutsThisMonth = useMemo(() => {
    if (!sessions) return 0;
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    return sessions.filter(
      (session) => new Date(session.session_date) >= firstDayOfMonth
    ).length;
  }, [sessions]);

  if (prsLoading || sessionsLoading) {
    return (
      <div className="bg-base-200 rounded-md p-4 border border-base-300 animate-pulse">
        <div className="h-6 bg-base-300 rounded w-24 mb-4"></div>
        <div className="grid grid-cols-3 gap-4">
          <div className="h-16 bg-base-300 rounded"></div>
          <div className="h-16 bg-base-300 rounded"></div>
          <div className="h-16 bg-base-300 rounded"></div>
        </div>
      </div>
    );
  }

  // Filter out 0kg PRs (safety check, should already be filtered from backend)
  const prs = allPrs?.filter((pr) => pr.max_load > 0);

  // Separate PRs by equipment type
  const weightPRs = prs?.filter((pr) => pr.equipment_type === "weight") || [];
  const machinePRs = prs?.filter((pr) => pr.equipment_type === "machine") || [];

  const bestWeight = weightPRs[0];
  const bestMachine = machinePRs[0];

  return (
    <div className="bg-base-200 rounded-md p-4 border border-base-300">
      <h2 className="text-base font-semibold mb-4 text-base-content">Quick Stats</h2>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3">
        {/* Free Weight PR */}
        <div className="bg-base-100 rounded-md p-3 border border-base-300">
          <div className="flex items-center gap-1 mb-2">
            <Dumbbell size={14} className="text-base-content/60" />
            <span className="text-xs text-base-content/60">Free Weight</span>
          </div>
          {bestWeight ? (
            <>
              <p className="text-xl font-bold text-base-content leading-tight">
                {bestWeight.max_load}
                <span className="text-xs font-semibold ml-0.5">kg</span>
              </p>
              <p className="text-xs text-base-content/60 truncate mt-1">
                {bestWeight.exercise_title}
              </p>
            </>
          ) : (
            <p className="text-xs text-base-content/40">No PRs yet</p>
          )}
        </div>

        {/* Machine PR */}
        <div className="bg-base-100 rounded-md p-3 border border-base-300">
          <div className="flex items-center gap-1 mb-2">
            <Cog size={14} className="text-base-content/60" />
            <span className="text-xs text-base-content/60">Machine</span>
          </div>
          {bestMachine ? (
            <>
              <p className="text-xl font-bold text-base-content leading-tight">
                {bestMachine.max_load}
                <span className="text-xs font-semibold ml-0.5">kg</span>
              </p>
              <p className="text-xs text-base-content/60 truncate mt-1">
                {bestMachine.exercise_title}
              </p>
            </>
          ) : (
            <p className="text-xs text-base-content/40">No PRs yet</p>
          )}
        </div>

        {/* Workouts This Month */}
        <div className="bg-base-100 rounded-md p-3 border border-base-300">
          <div className="flex items-center gap-1 mb-2">
            <Flame size={14} className="text-accent" />
            <span className="text-xs text-base-content/60">This Month</span>
          </div>
          <p className="text-xl font-bold text-accent leading-tight">
            {workoutsThisMonth}
          </p>
          <p className="text-xs text-base-content/60 mt-1">
            {workoutsThisMonth === 1 ? "Workout" : "Workouts"}
          </p>
        </div>
      </div>
    </div>
  );
};
