import { useState } from "react";
import { useWorkouts } from "../hooks/useWorkouts";
import { useWorkoutEvolution } from "../hooks/useStats";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Area, AreaChart, Line, LineChart, CartesianGrid, XAxis, YAxis, LabelList, Legend } from "recharts";

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

export const WorkoutEvolutionToggle = () => {
  const { data: workouts } = useWorkouts();
  const [selectedWorkoutId, setSelectedWorkoutId] = useState<string>("");
  const [viewMode, setViewMode] = useState<"individual" | "combined">("individual");

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
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Workout Evolution</h2>

        {/* Toggle Button */}
        {selectedWorkoutId && groupedByExercise && Object.keys(groupedByExercise).length > 0 && (
          <div className="flex gap-1 bg-base-300 rounded-lg p-1">
            <button
              onClick={() => setViewMode("individual")}
              className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                viewMode === "individual"
                  ? "bg-base-100 text-base-content shadow-sm"
                  : "text-base-content/60 hover:text-base-content"
              }`}
            >
              Individual
            </button>
            <button
              onClick={() => setViewMode("combined")}
              className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                viewMode === "combined"
                  ? "bg-base-100 text-base-content shadow-sm"
                  : "text-base-content/60 hover:text-base-content"
              }`}
            >
              Combined
            </button>
          </div>
        )}
      </div>

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

      {/* Individual Charts View */}
      {selectedWorkoutId &&
        !isLoading &&
        groupedByExercise &&
        Object.keys(groupedByExercise).length > 0 &&
        viewMode === "individual" && (
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

              const exerciseChartConfig = {
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
                  <ChartContainer config={exerciseChartConfig} className="h-40 sm:h-36 w-full">
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

      {/* Combined Chart View */}
      {selectedWorkoutId &&
        !isLoading &&
        groupedByExercise &&
        Object.keys(groupedByExercise).length > 0 &&
        viewMode === "combined" && (
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
                  className="flex items-center justify-between border border-base-300 rounded-lg p-3"
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
