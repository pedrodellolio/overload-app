import { useState } from "react";
import { useExercises } from "../hooks/useExercises";
import { useLoadEvolution } from "../hooks/useStats";

export const LoadEvolution = () => {
  const { data: exercises } = useExercises();
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>("");

  const { data: evolution, isLoading } = useLoadEvolution(selectedExerciseId);

  const getMaxLoad = () => {
    if (!evolution || evolution.length === 0) return 0;
    return Math.max(...evolution.map((e) => e.load_in_kg));
  };

  const maxLoad = getMaxLoad();

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <h2 className="text-lg font-semibold mb-4">Load Evolution</h2>

      <select
        value={selectedExerciseId}
        onChange={(e) => setSelectedExerciseId(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
      >
        <option value="">Select an exercise...</option>
        {exercises?.map((exercise) => (
          <option key={exercise.id} value={exercise.id}>
            {exercise.title}
          </option>
        ))}
      </select>

      {isLoading && selectedExerciseId && (
        <div className="h-64 bg-gray-100 rounded animate-pulse"></div>
      )}

      {!selectedExerciseId && (
        <div className="h-64 flex items-center justify-center text-gray-400">
          <p>Select an exercise to view progress</p>
        </div>
      )}

      {selectedExerciseId && !isLoading && evolution && evolution.length === 0 && (
        <div className="h-64 flex items-center justify-center text-gray-400">
          <p>No workout sessions recorded yet</p>
        </div>
      )}

      {selectedExerciseId &&
        !isLoading &&
        evolution &&
        evolution.length > 0 && (
          <div className="space-y-4">
            {/* Simple bar chart */}
            <div className="h-64 flex items-end gap-2">
              {evolution.map((point, idx) => {
                const heightPercentage = maxLoad > 0 ? (point.load_in_kg / maxLoad) * 100 : 0;
                return (
                  <div
                    key={idx}
                    className="flex-1 flex flex-col items-center gap-1 group"
                  >
                    <div
                      className="w-full bg-blue-500 rounded-t hover:bg-blue-600 transition-colors cursor-pointer relative"
                      style={{ height: `${heightPercentage}%` }}
                      title={`${point.load_in_kg} kg - ${new Date(
                        point.date
                      ).toLocaleDateString()}`}
                    >
                      <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        {point.load_in_kg} kg
                      </span>
                    </div>
                    <span className="text-xs text-gray-500 -rotate-45 origin-top-left mt-2">
                      {new Date(point.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Stats summary */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
              <div>
                <p className="text-xs text-gray-500">Sessions</p>
                <p className="text-xl font-bold">{evolution.length}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Current</p>
                <p className="text-xl font-bold">
                  {evolution[evolution.length - 1].load_in_kg} kg
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Max</p>
                <p className="text-xl font-bold">{maxLoad} kg</p>
              </div>
            </div>
          </div>
        )}
    </div>
  );
};
