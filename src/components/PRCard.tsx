import { Trophy } from "lucide-react";
import { usePersonalRecords } from "../hooks/useStats";

export const PRCard = () => {
  const { data: prs, isLoading } = usePersonalRecords();

  if (isLoading) {
    return (
      <div className="from-accent/30 to-accent rounded-md p-6 text-base-content animate-pulse">
        <div className="h-8 bg-white/20 rounded w-32 mb-4"></div>
        <div className="h-12 bg-white/20 rounded w-48"></div>
      </div>
    );
  }

  const topPR = prs?.[0];

  if (!topPR) {
    return (
      <div className="from-gray-400 to-gray-500 rounded-md p-6 text-base-content">
        <h2 className="text-lg font-semibold mb-2">Personal Record</h2>
        <p className="text-3xl font-bold mb-1">No PRs yet</p>
        <p className="text-sm opacity-90">Start tracking your workouts!</p>
      </div>
    );
  }

  return (
    <div className="bg-linear-to-br from-accent/30 to-accent rounded-md p-6 text-base-content">
      <div className="flex items-start justify-between mb-4">
        <h2 className="text-lg font-semibold">Personal Record</h2>
        <Trophy size={32} />
      </div>
      <div className="space-y-2">
        <p className="text-5xl font-bold">{topPR.max_load} <span className="font-semibold">kg</span></p>
        <p className="text-xl font-medium text-base-content/80">{topPR.exercise_title}</p>
        <p className="text-sm text-base-content/60">
          {new Date(topPR.last_session_at).toLocaleDateString()}
        </p>
      </div>
      {prs && prs.length > 1 && (
        <div className="mt-4 pt-4 border-t border-white/20">
          <p className="text-xs opacity-75 mb-2">Other PRs:</p>
          <div className="space-y-1">
            {prs.slice(1, 4).map((pr) => (
              <div key={pr.exercise_id} className="flex justify-between text-sm">
                <span className="opacity-90">{pr.exercise_title}</span>
                <span className="font-semibold">{pr.max_load} kg</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
