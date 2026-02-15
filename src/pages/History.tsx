import { useState } from "react";
import { useWorkoutSessions } from "../hooks/useSessions";
import { ChevronDown, ChevronUp } from "lucide-react";

export const History = () => {
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);
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
            <div key={session.id} className="bg-base-200 rounded-md p-4 transition-shadow">
              <div
                className="flex justify-between items-center cursor-pointer "
                onClick={() =>
                  setExpandedSessionId(
                    expandedSessionId === session.id ? null : session.id
                  )
                }
              >
                <div className="flex items-center gap-2 flex-1">
                  <h3 className="font-semibold text-lg">{session.workout.title}</h3>
                  {expandedSessionId === session.id ? (
                    <ChevronUp size={20} className="text-base-content/60" />
                  ) : (
                    <ChevronDown size={20} className="text-base-content/60" />
                  )}
                </div>
                <p className="text-sm text-accent shrink-0 ml-2">
                  {new Date(session.session_date).toLocaleDateString()}
                </p>
              </div>

              {expandedSessionId === session.id &&
                session.exercises &&
                session.exercises.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-base-300">
                    <h4 className="text-sm font-medium text-base-content/60 mb-2">
                      Exercises:
                    </h4>
                    <div className="space-y-2">
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
                  </div>
                )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
