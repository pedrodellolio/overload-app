import { useWorkoutHistory } from "../hooks/useWorkouts";
import { Link } from "wouter";

export const History = () => {
  const { data: workouts, isLoading } = useWorkoutHistory();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-gray-600">Loading history...</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-6 pb-24">
      <h1 className="text-2xl font-bold mb-6">Workout History</h1>

      <div className="space-y-3">
        {workouts && workouts.length === 0 ? (
          <p className="text-center text-gray-500 py-8">
            No workout history yet. Register your first workout!
          </p>
        ) : (
          workouts?.map((workout) => (
            <Link key={workout.id} href={`/workout/${workout.id}`}>
              <a className="block bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <h3 className="font-semibold text-lg">{workout.title}</h3>
                {workout.last_session_at && (
                  <p className="text-sm text-gray-600 mt-1">
                    Last session:{" "}
                    {new Date(workout.last_session_at).toLocaleString()}
                  </p>
                )}
                <p className="text-xs text-gray-400 mt-1">
                  Created: {new Date(workout.created_at).toLocaleDateString()}
                </p>
              </a>
            </Link>
          ))
        )}
      </div>
    </div>
  );
};
