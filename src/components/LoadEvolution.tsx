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
    <div className="bg-base-200 rounded-md p-6 border border-base-300">
      <h2 className="text-lg font-semibold mb-4">Load Evolution</h2>

      <select
        value={selectedExerciseId}
        onChange={(e) => setSelectedExerciseId(e.target.value)}
        className="w-full select"
      >
        <option value="">Select an exercise...</option>
        {exercises?.map((exercise) => (
          <option key={exercise.id} value={exercise.id}>
            {exercise.title}
          </option>
        ))}
      </select>

      {isLoading && selectedExerciseId && (
        <div className="h-64 rounded animate-pulse"></div>
      )}

      {!selectedExerciseId && (
        <div className="h-64 flex items-center justify-center">
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
          <div className="space-y-4 mt-6">
            {/* Line chart */}
            <div className="relative h-64 w-full">
              {/* Y-axis labels positioned absolutely */}
              <div className="absolute left-0 top-0 bottom-0 w-10 flex flex-col justify-between py-4 text-xs opacity-60">
                {[0, 1, 2, 3, 4].map((i) => {
                  const value = maxLoad - (i * maxLoad) / 4;
                  return (
                    <div key={i} className="text-right pr-2">
                      {Math.round(value)}
                    </div>
                  );
                })}
              </div>

              {/* Chart SVG with stretching enabled */}
              <div className="absolute left-10 right-0 top-0 bottom-8">
                <svg className="w-full h-full text-accent" viewBox="0 0 750 216" preserveAspectRatio="none">
                  {/* Grid lines */}
                  <g className="grid-lines" opacity="0.1">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <line
                        key={i}
                        x1="0"
                        y1={(i * 216) / 4}
                        x2="740"
                        y2={(i * 216) / 4}
                        stroke="currentColor"
                        strokeWidth="1"
                        vectorEffect="non-scaling-stroke"
                      />
                    ))}
                  </g>

                  {/* Line path */}
                  <path
                    d={evolution
                      .map((point, idx) => {
                        const x = (idx * 740) / (evolution.length - 1 || 1);
                        const y = 216 - ((point.load_in_kg / maxLoad) * 216);
                        return `${idx === 0 ? "M" : "L"} ${x} ${y}`;
                      })
                      .join(" ")}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    vectorEffect="non-scaling-stroke"
                  />

                  {/* Area under the line */}
                  <path
                    d={
                      evolution
                        .map((point, idx) => {
                          const x = (idx * 740) / (evolution.length - 1 || 1);
                          const y = 216 - ((point.load_in_kg / maxLoad) * 216);
                          return `${idx === 0 ? "M" : "L"} ${x} ${y}`;
                        })
                        .join(" ") +
                      ` L ${(740 * (evolution.length - 1)) / (evolution.length - 1 || 1)} 216 L 0 216 Z`
                    }
                    fill="currentColor"
                    fillOpacity="0.1"
                  />

                  {/* Data points */}
                  {evolution.map((point, idx) => {
                    const x = (idx * 740) / (evolution.length - 1 || 1);
                    const y = 216 - ((point.load_in_kg / maxLoad) * 216);
                    return (
                      <g key={idx}>
                        <ellipse
                          cx={x}
                          cy={y}
                          rx="7"
                          ry="4"
                          fill="currentColor"
                          stroke="white"
                          strokeWidth="2"
                          vectorEffect="non-scaling-stroke"
                          className="cursor-pointer transition-all"
                        >
                          <title>
                            {new Date(point.date).toLocaleDateString()}: {point.load_in_kg} kg
                          </title>
                        </ellipse>
                      </g>
                    );
                  })}
                </svg>
              </div>

              {/* X-axis labels positioned absolutely */}
              <div className="absolute left-10 right-0 bottom-0 h-8 flex justify-between items-start text-xs opacity-60">
                {evolution.map((point, idx) => {
                  // Show labels for first, last, and some middle points
                  const showLabel =
                    idx === 0 ||
                    idx === evolution.length - 1 ||
                    (evolution.length > 5 && idx % Math.ceil(evolution.length / 5) === 0);
                  if (!showLabel) return null;

                  const position = (idx / (evolution.length - 1 || 1)) * 100;
                  return (
                    <div
                      key={idx}
                      className="absolute"
                      style={{ left: `${position}%`, transform: 'translateX(-50%)' }}
                    >
                      {new Date(point.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Stats summary */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-base-300">
              <div>
                <p className="text-xs opacity-60">Sessions</p>
                <p className="text-xl font-bold">{evolution.length}</p>
              </div>
              <div>
                <p className="text-xs opacity-60">Current</p>
                <p className="text-xl font-bold">
                  {evolution[evolution.length - 1].load_in_kg} kg
                </p>
              </div>
              <div>
                <p className="text-xs opacity-60">Max</p>
                <p className="text-xl font-bold">{maxLoad} kg</p>
              </div>
            </div>
          </div>
        )}
    </div>
  );
};
