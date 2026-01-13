import { useWorkoutHistory } from "../hooks/useWorkouts";

export const History = () => {
  const { data: workouts, isLoading } = useWorkoutHistory();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-base-content/70">Loading history...</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Workout History</h1>
      <p className="text-sm text-base-content/50 mb-6">
        Showing the last 20 workouts
      </p>
      <div className="space-y-3">
        {workouts && workouts.length === 0 ? (
          <p className="text-center text-base-content/60 py-8">
            No workout history yet. Register your first workout!
          </p>
        ) : (
          workouts?.map((workout) => (
            <div key={workout.id}>
              <a className="block bg-base-200 border border-base-300 rounded-md p-4 transition-shadow">
                <h3 className="font-semibold text-lg">{workout.title}</h3>
                {workout.last_session_at && (
                  <p className="text-sm text-accent mt-1">
                    Last session:{" "}
                    {new Date(workout.last_session_at).toLocaleString()}
                  </p>
                )}
                <p className="text-xs text-base-content/50 mt-1">
                  Created: {new Date(workout.created_at).toLocaleDateString()}
                </p>
              </a>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
