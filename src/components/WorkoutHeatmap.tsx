import { useWorkoutFrequency } from "../hooks/useStats";

export const WorkoutHeatmap = () => {
  const currentYear = new Date().getFullYear();
  const { data: frequency, isLoading } = useWorkoutFrequency(currentYear);

  const generateWeeksGrid = () => {
    const startDate = new Date(currentYear, 0, 1);
    const endDate = new Date(currentYear, 11, 31);

    // Get the day of week for Jan 1 (0 = Sunday, 1 = Monday, etc.)
    const startDay = startDate.getDay();

    // Calculate the first Sunday on or before Jan 1
    const gridStart = new Date(startDate);
    gridStart.setDate(gridStart.getDate() - startDay);

    const weeks: (Date | null)[][] = [];
    let currentWeek: (Date | null)[] = [];

    for (let d = new Date(gridStart); ; d.setDate(d.getDate() + 1)) {
      const currentDate = new Date(d);

      // Add null for days before the year starts or after it ends
      if (currentDate < startDate || currentDate > endDate) {
        currentWeek.push(null);
      } else {
        currentWeek.push(currentDate);
      }

      // Complete week (Sunday to Saturday)
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];

        // Stop if we've passed the end of the year
        if (currentDate > endDate) break;
      }
    }

    return weeks;
  };

  const getMonthLabels = (weeks: (Date | null)[][]) => {
    const labels: { month: string; weekIndex: number }[] = [];
    let currentMonth = -1;

    weeks.forEach((week, weekIndex) => {
      // Find the first valid date in this week
      const firstDate = week.find(day => day !== null);
      if (firstDate) {
        const month = firstDate.getMonth();
        // Add label when we encounter a new month and it's not the first few days
        if (month !== currentMonth && firstDate.getDate() <= 7) {
          labels.push({
            month: firstDate.toLocaleDateString('en-US', { month: 'short' }),
            weekIndex
          });
          currentMonth = month;
        }
      }
    });

    return labels;
  };

  const getIntensity = (date: Date | null) => {
    if (!date) return 0;
    const dateStr = date.toISOString().split("T")[0];
    const workout = frequency?.find((f) => f.date === dateStr);
    return workout ? Math.min(workout.count, 3) : 0;
  };

  const getColorClass = (intensity: number, isNull: boolean) => {
    if (isNull) return "bg-transparent";
    switch (intensity) {
      case 0:
        return "bg-base-content/15";
      case 1:
      case 2:
      case 3:
        return "bg-accent";
      default:
        return "bg-base-content/15";
    }
  };

  if (isLoading) {
    return (
      <div className="bg-base-200 rounded-md p-6 border border-base-300">
        <h2 className="text-lg font-semibold mb-4">Workout Frequency</h2>
        <div className="h-32 bg-gray-100 rounded animate-pulse"></div>
      </div>
    );
  }

  const weeks = generateWeeksGrid();
  const monthLabels = getMonthLabels(weeks);

  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="bg-base-200 rounded-md p-6 border border-base-300">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Workout Frequency</h2>
        <span className="text-sm text-gray-500">{currentYear}</span>
      </div>

      <div className="overflow-x-auto overflow-y-hidden">
        {/* Month labels */}
        <div className="flex gap-1 mb-2 ml-8">
          <div className="relative flex gap-1" style={{ height: '14px' }}>
            {monthLabels.map(({ month, weekIndex }) => (
              <div
                key={`${month}-${weekIndex}`}
                className="text-xs text-gray-500 absolute"
                style={{ left: `${weekIndex * 16}px` }}
              >
                {month}
              </div>
            ))}
          </div>
        </div>

        {/* Heatmap grid with day labels */}
        <div className="flex gap-1">
          {/* Day of week labels */}
          <div className="flex flex-col gap-1 text-xs text-gray-500 mr-1">
            {dayLabels.map((day, idx) => (
              <div
                key={day}
                className="h-3 flex items-center"
                style={{ visibility: idx % 2 === 1 ? 'visible' : 'hidden' }}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Heatmap columns */}
          {weeks.map((week, weekIdx) => (
            <div key={weekIdx} className="flex flex-col gap-1">
              {week.map((day, dayIdx) => {
                const intensity = getIntensity(day);
                const isNull = day === null;
                return (
                  <div
                    key={dayIdx}
                    className={`w-3 h-3 rounded-sm ${getColorClass(
                      intensity,
                      isNull
                    )} ${!isNull ? 'hover:ring-2 transition-all cursor-pointer' : ''}`}
                    title={
                      day
                        ? `${day.toLocaleDateString()}: ${
                            intensity > 0
                              ? `${intensity} workout${intensity > 1 ? "s" : ""}`
                              : "Rest day"
                          }`
                        : undefined
                    }
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
