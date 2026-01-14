import { useState } from "react";
import { useWorkouts } from "../hooks/useWorkouts";
import { useWorkoutEvolution } from "../hooks/useStats";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, LabelList } from "recharts";

export const WorkoutEvolutionCompact = () => {
  const { data: workouts } = useWorkouts();
  const [selectedWorkoutId, setSelectedWorkoutId] = useState<string>("");

  const { data: evolution, isLoading } = useWorkoutEvolution(selectedWorkoutId);

  // Group evolution data by exercise
  const groupedByExercise = evolution?.reduce((acc, item) => {
    if (!acc[item.exercise_title]) {
      acc[item.exercise_title] = [];
    }
    acc[item.exercise_title].push({
      date: item.date,
      load_in_kg: item.load_in_kg,
    });
    return acc;
  }, {} as Record<string, Array<{ date: string; load_in_kg: number }>>);

  const getMaxLoad = (exerciseData: Array<{ date: string; load_in_kg: number }>) => {
    if (!exerciseData || exerciseData.length === 0) return 0;
    return Math.max(...exerciseData.map((e) => e.load_in_kg));
  };

  return (
    <div className="bg-base-200 rounded-md p-6 border border-base-300">
      <h2 className="text-lg font-semibold mb-4">Workout Evolution (Compact)</h2>

      <select
        value={selectedWorkoutId}
        onChange={(e) => setSelectedWorkoutId(e.target.value)}
        className="w-full select"
      >
        <option value="">Select a workout...</option>
        {workouts?.map((workout) => (
          <option key={workout.id} value={workout.id}>
            {workout.title}
          </option>
        ))}
      </select>

      {isLoading && selectedWorkoutId && (
        <div className="h-64 rounded animate-pulse mt-6"></div>
      )}

      {!selectedWorkoutId && (
        <div className="h-64 flex items-center justify-center">
          <p>Select a workout to view evolution</p>
        </div>
      )}

      {selectedWorkoutId && !isLoading && evolution && evolution.length === 0 && (
        <div className="h-64 flex items-center justify-center text-gray-400">
          <p>No workout sessions recorded yet</p>
        </div>
      )}

      {selectedWorkoutId &&
        !isLoading &&
        groupedByExercise &&
        Object.keys(groupedByExercise).length > 0 && (
          <div className="space-y-3 mt-4">
            {Object.entries(groupedByExercise).map(([exerciseTitle, exerciseData]) => {
              const maxLoad = getMaxLoad(exerciseData);

              // Transform data for recharts
              const chartData = exerciseData.map((point) => ({
                date: new Date(point.date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                }),
                load: point.load_in_kg,
              }));

              const chartConfig = {
                load: {
                  label: "Load (kg)",
                  color: "#1fb8ab",
                },
              };

              return (
                <div key={exerciseTitle} className="border border-base-300 rounded-lg p-3">
                  {/* Exercise title and stats in one row */}
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-lg">{exerciseTitle}</h3>
                    <div className="flex gap-3 text-sm">
                      <div className="text-right">
                        <p className="opacity-60">Sessions</p>
                        <p className="font-bold">{exerciseData.length}</p>
                      </div>
                      <div className="text-right">
                        <p className="opacity-60">Current</p>
                        <p className="font-bold">{exerciseData[exerciseData.length - 1].load_in_kg} kg</p>
                      </div>
                      <div className="text-right">
                        <p className="opacity-60">Max</p>
                        <p className="font-bold">{maxLoad} kg</p>
                      </div>
                    </div>
                  </div>

                  {/* Compact Chart */}
                  <ChartContainer config={chartConfig} className="h-40 sm:h-36 w-full">
                    <AreaChart data={chartData} margin={{ top: 20, right: 5, bottom: 5, left: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis
                        dataKey="date"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={6}
                        tick={{ fontSize: 11 }}
                        interval="preserveStartEnd"
                      />
                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        tickMargin={6}
                        tick={{ fontSize: 11 }}
                        width={35}
                        tickFormatter={(value) => `${value}`}
                        domain={[0, (dataMax: number) => Math.ceil(dataMax * 1.15)]}
                      />
                      <ChartTooltip
                        content={<ChartTooltipContent />}
                        cursor={false}
                      />
                      <Area
                        dataKey="load"
                        type="monotone"
                        fill="var(--color-load)"
                        fillOpacity={0.2}
                        stroke="var(--color-load)"
                        strokeWidth={2.5}
                      >
                        <LabelList
                          dataKey="load"
                          position="top"
                          offset={5}
                          style={{ fontSize: '12px', fontWeight: 'bold', fill: 'var(--color-load)' }}
                          formatter={(value: number) => `${value}kg`}
                        />
                      </Area>
                    </AreaChart>
                  </ChartContainer>
                </div>
              );
            })}
          </div>
        )}
    </div>
  );
};
