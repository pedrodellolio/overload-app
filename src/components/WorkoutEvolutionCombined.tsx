import { useState } from "react";
import { useWorkouts } from "../hooks/useWorkouts";
import { useWorkoutEvolution } from "../hooks/useStats";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Line, LineChart, CartesianGrid, XAxis, YAxis, Legend, LabelList } from "recharts";

// Generate distinct colors for different exercises
const CHART_COLORS = [
  "#1fb8ab", // teal
  "#f59e0b", // amber
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#10b981", // emerald
  "#3b82f6", // blue
  "#f97316", // orange
  "#06b6d4", // cyan
];

export const WorkoutEvolutionCombined = () => {
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

  // Transform data for combined chart
  const getCombinedChartData = () => {
    if (!groupedByExercise) return [];

    // Get all unique dates
    const allDates = new Set<string>();
    Object.values(groupedByExercise).forEach((exerciseData) => {
      exerciseData.forEach((point) => {
        allDates.add(point.date);
      });
    });

    // Sort dates
    const sortedDates = Array.from(allDates).sort(
      (a, b) => new Date(a).getTime() - new Date(b).getTime()
    );

    // Create chart data with all exercises
    return sortedDates.map((date) => {
      const dataPoint: any = {
        date: new Date(date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
      };

      Object.entries(groupedByExercise).forEach(([exerciseTitle, exerciseData]) => {
        const point = exerciseData.find((p) => p.date === date);
        if (point) {
          dataPoint[exerciseTitle] = point.load_in_kg;
        }
      });

      return dataPoint;
    });
  };

  const combinedData = getCombinedChartData();

  // Create chart config for all exercises
  const chartConfig = groupedByExercise
    ? Object.keys(groupedByExercise).reduce((config, exerciseTitle, index) => {
        config[exerciseTitle] = {
          label: exerciseTitle,
          color: CHART_COLORS[index % CHART_COLORS.length],
        };
        return config;
      }, {} as Record<string, { label: string; color: string }>)
    : {};

  // Calculate stats for each exercise
  const exerciseStats = groupedByExercise
    ? Object.entries(groupedByExercise).map(([exerciseTitle, exerciseData]) => ({
        title: exerciseTitle,
        sessions: exerciseData.length,
        current: exerciseData[exerciseData.length - 1].load_in_kg,
        max: Math.max(...exerciseData.map((e) => e.load_in_kg)),
      }))
    : [];

  return (
    <div className="bg-base-200 rounded-md p-6 border border-base-300">
      <h2 className="text-lg font-semibold mb-4">Workout Evolution (Combined)</h2>

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
          <div className="mt-6 space-y-4">
            {/* Combined Chart - Responsive height */}
            <ChartContainer config={chartConfig} className="h-64 sm:h-72 md:h-80 w-full">
              <LineChart data={combinedData}>
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
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend
                  wrapperStyle={{ fontSize: '12px' }}
                  iconSize={12}
                />
                {Object.keys(groupedByExercise).map((exerciseTitle, index) => (
                  <Line
                    key={exerciseTitle}
                    dataKey={exerciseTitle}
                    type="monotone"
                    stroke={CHART_COLORS[index % CHART_COLORS.length]}
                    strokeWidth={2.5}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                    connectNulls
                  >
                    <LabelList
                      dataKey={exerciseTitle}
                      position="top"
                      offset={8}
                      style={{
                        fontSize: '11px',
                        fontWeight: 'bold',
                        fill: CHART_COLORS[index % CHART_COLORS.length]
                      }}
                      formatter={(value: number) => value ? `${value}kg` : ''}
                    />
                  </Line>
                ))}
              </LineChart>
            </ChartContainer>

            {/* Stats Summary - Horizontal layout like individual view */}
            <div className="space-y-2">
              {exerciseStats.map((stat, index) => (
                <div
                  key={stat.title}
                  className="flex items-center justify-between border border-base-300 rounded-md p-3"
                  style={{
                    borderLeftWidth: "4px",
                    borderLeftColor: CHART_COLORS[index % CHART_COLORS.length],
                  }}
                >
                  <h4 className="font-semibold text-base">{stat.title}</h4>
                  <div className="flex gap-3 text-sm">
                    <div className="text-right">
                      <p className="opacity-60">Sessions</p>
                      <p className="font-bold">{stat.sessions}</p>
                    </div>
                    <div className="text-right">
                      <p className="opacity-60">Current</p>
                      <p className="font-bold">{stat.current} kg</p>
                    </div>
                    <div className="text-right">
                      <p className="opacity-60">Max</p>
                      <p className="font-bold">{stat.max} kg</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
    </div>
  );
};
