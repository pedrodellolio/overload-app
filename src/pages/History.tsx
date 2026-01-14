import { useWorkoutSessions } from "../hooks/useSessions";

export const History = () => {
  const { data: sessions, isLoading } = useWorkoutSessions(50);

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
        Showing the last 50 workout sessions
      </p>
      <div className="space-y-3">
        {sessions && sessions.length === 0 ? (
          <p className="text-center text-base-content/60 py-8">
            No workout history yet. Register your first workout!
          </p>
        ) : (
          sessions?.map((session) => (
            <div key={session.id} className="bg-base-200 border border-base-300 rounded-md p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-lg">{session.workout.title}</h3>
                <p className="text-sm text-accent">
                  {new Date(session.session_date).toLocaleDateString()}
                </p>
              </div>

              {session.exercises && session.exercises.length > 0 && (
                <div className="mt-3 space-y-2">
                  {session.exercises.map((sessionExercise) => (
                    <div
                      key={sessionExercise.id}
                      className="flex justify-between items-center text-sm bg-base-300 rounded px-3 py-2"
                    >
                      <span className="text-base-content/80">
                        {sessionExercise.exercise.title}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">
                          {sessionExercise.load_in_kg} kg
                        </span>
                        {sessionExercise.details && (
                          <span className="text-xs text-base-content/60">
                            ({sessionExercise.details})
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
