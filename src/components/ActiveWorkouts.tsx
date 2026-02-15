import { useMemo } from "react";
import { Link } from "wouter";
import { useWorkouts } from "../hooks/useWorkouts";
import { ChevronRight } from "lucide-react";

export const ActiveWorkouts = () => {
  const { data: workouts, isLoading } = useWorkouts();

  // Filter workouts that had a session this month
  const activeWorkouts = useMemo(() => {
    if (!workouts) return [];

    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    return workouts.filter((workout) => {
      if (!workout.last_session_at) return false;
      const lastSessionDate = new Date(workout.last_session_at);
      return lastSessionDate >= firstDayOfMonth;
    });
  }, [workouts]);

  if (isLoading) {
    return (
      <div>
        <h3 className="text-base font-semibold mb-3">Active Workouts</h3>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-base-200 rounded-md p-3 border border-base-300 animate-pulse"
            >
              <div className="h-4 bg-base-300 rounded w-24 mb-2"></div>
              <div className="h-3 bg-base-300 rounded w-32"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-base font-semibold mb-3 text-base-content">
        Active Workouts
      </h3>

      {activeWorkouts.length === 0 ? (
        /* Empty state */
        <div className="flex flex-col justify-center bg-base-200 min-h-28 h-full rounded-md p-4 border border-base-300 text-center">
          <p className="text-sm text-base-content/60">
            No workouts this month yet
          </p>
          <p className="text-xs text-base-content/40 mt-1">
            Start training to see your active workouts here
          </p>
        </div>
      ) : (
        /* Horizontal scrollable list */
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {activeWorkouts.map((workout) => {
            const lastSession = workout.last_session_at
              ? new Date(workout.last_session_at)
              : null;

            return (
              <Link
                key={workout.id}
                href={`/workout/${workout.id}`}
                className="bg-base-200 rounded-md p-3 min-w-50 min-h-32 border border-base-300 hover:bg-base-300 transition-colors shrink-0"
              >
                <div className="flex items-start justify-between h-full gap-2">
                  <div className="flex flex-col justify-between flex-1 h-full min-w-0">
                    <h4 className="font-semibold text-base truncate mb-1">
                      {workout.title}
                    </h4>
                    <div>
                      {lastSession && (
                        <p className="text-xs text-base-content/60">
                          Last:{" "}
                          {lastSession.toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                      )}
                      {workout.exercises && workout.exercises.length > 0 && (
                        <p className="text-xs text-base-content/40 mt-1">
                          {workout.exercises.length} exercise
                          {workout.exercises.length !== 1 ? "s" : ""}
                        </p>
                      )}
                    </div>
                  </div>
                  <ChevronRight
                    size={16}
                    className="text-base-content/40 shrink-0 mt-0.5"
                  />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};
