import { useState } from "react";
import { useExercises } from "../hooks/useExercises";
import { useLoadEvolution } from "../hooks/useStats";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, LabelList } from "recharts";

export const LoadEvolution = () => {
  const { data: exercises } = useExercises();
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>("");

  const { data: evolution, isLoading } = useLoadEvolution(selectedExerciseId);

  const getMaxLoad = () => {
    if (!evolution || evolution.length === 0) return 0;
    return Math.max(...evolution.map((e) => e.load_in_kg));
  };

  const maxLoad = getMaxLoad();

  // Transform data for recharts
  const chartData = evolution?.map((point) => ({
    date: new Date(point.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    load: point.load_in_kg,
  })) || [];

  const chartConfig = {
    load: {
      label: "Load (kg)",
      color: "#1fb8ab",
    },
  };

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
        <div className="h-64 rounded animate-pulse mt-6"></div>
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
            {/* Recharts Area Chart - Responsive height */}
            <ChartContainer config={chartConfig} className="h-64 sm:h-72 w-full">
              <AreaChart data={chartData} margin={{ top: 20, right: 5, bottom: 5, left: 5 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tick={{ fontSize: 11 }}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tick={{ fontSize: 11 }}
                  width={40}
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

            {/* Stats summary - Better mobile spacing */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-base-300 text-center">
              <div>
                <p className="text-xs opacity-60 mb-1">Sessions</p>
                <p className="text-xl font-bold">{evolution.length}</p>
              </div>
              <div>
                <p className="text-xs opacity-60 mb-1">Current</p>
                <p className="text-xl font-bold">
                  {evolution[evolution.length - 1].load_in_kg} kg
                </p>
              </div>
              <div>
                <p className="text-xs opacity-60 mb-1">Max</p>
                <p className="text-xl font-bold">{maxLoad} kg</p>
              </div>
            </div>
          </div>
        )}
    </div>
  );
};
