import { useWorkoutFrequency } from "../hooks/useStats";

export const WorkoutHeatmap = () => {
  const currentYear = new Date().getFullYear();
  const { data: frequency, isLoading } = useWorkoutFrequency(currentYear);

  const generateYearDays = () => {
    const days = [];
    const startDate = new Date(currentYear, 0, 1);
    const endDate = new Date(currentYear, 11, 31);

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      days.push(new Date(d));
    }
    return days;
  };

  const getIntensity = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0];
    const workout = frequency?.find((f) => f.date === dateStr);
    return workout ? Math.min(workout.count, 3) : 0;
  };

  const getColorClass = (intensity: number) => {
    switch (intensity) {
      case 0:
        return "bg-gray-200";
      case 1:
        return "bg-green-300";
      case 2:
        return "bg-green-500";
      case 3:
        return "bg-green-700";
      default:
        return "bg-gray-200";
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Workout Frequency</h2>
        <div className="h-32 bg-gray-100 rounded animate-pulse"></div>
      </div>
    );
  }

  const yearDays = generateYearDays();
  const weeks = [];
  for (let i = 0; i < yearDays.length; i += 7) {
    weeks.push(yearDays.slice(i, i + 7));
  }

  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Workout Frequency</h2>
        <span className="text-sm text-gray-500">{currentYear}</span>
      </div>

      <div className="overflow-x-auto">
        {/* Month labels */}
        <div className="flex gap-1 mb-2 text-xs text-gray-500">
          {months.map((month, idx) => (
            <div key={month} className="w-10 text-center">
              {month}
            </div>
          ))}
        </div>

        {/* Heatmap grid */}
        <div className="flex gap-1">
          {weeks.map((week, weekIdx) => (
            <div key={weekIdx} className="flex flex-col gap-1">
              {week.map((day, dayIdx) => {
                const intensity = getIntensity(day);
                return (
                  <div
                    key={dayIdx}
                    className={`w-3 h-3 rounded-sm ${getColorClass(
                      intensity
                    )} hover:ring-2 hover:ring-blue-400 transition-all cursor-pointer`}
                    title={`${day.toLocaleDateString()}: ${
                      intensity > 0 ? `${intensity} workout${intensity > 1 ? "s" : ""}` : "Rest day"
                    }`}
                  />
                );
              })}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2 mt-4 text-xs text-gray-600">
          <span>Less</span>
          <div className="flex gap-1">
            <div className="w-3 h-3 bg-gray-200 rounded-sm"></div>
            <div className="w-3 h-3 bg-green-300 rounded-sm"></div>
            <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
            <div className="w-3 h-3 bg-green-700 rounded-sm"></div>
          </div>
          <span>More</span>
        </div>
      </div>
    </div>
  );
};
