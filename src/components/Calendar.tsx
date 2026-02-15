import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "wouter";
import { useWorkoutSessions } from "../hooks/useSessions";
import type { WorkoutSessionWithDetails } from "../types/models";

export const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { data: sessions, isLoading } = useWorkoutSessions(1000); // Get all sessions for calendar

  // Navigate to previous month
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  // Navigate to next month
  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // Generate calendar grid for current month
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // First day of the month
    const firstDay = new Date(year, month, 1);
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0);

    // Get day of week for first day (0 = Sunday)
    const startingDayOfWeek = firstDay.getDay();

    // Calculate how many days to show from previous month
    const daysFromPrevMonth = startingDayOfWeek;

    // Calculate total days needed (prev month days + current month days)
    const totalDaysNeeded = daysFromPrevMonth + lastDay.getDate();

    // Calculate number of weeks needed (minimum 5 weeks, maximum 6 weeks)
    const weeksNeeded = Math.max(5, Math.ceil(totalDaysNeeded / 7));

    // Total cells to show (minimum 5 weeks = 35 cells)
    const totalCells = weeksNeeded * 7;

    const days: Array<{ date: Date; isCurrentMonth: boolean }> = [];

    // Add days from previous month
    for (let i = daysFromPrevMonth - 1; i >= 0; i--) {
      const date = new Date(year, month, -i);
      days.push({ date, isCurrentMonth: false });
    }

    // Add days from current month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const date = new Date(year, month, i);
      days.push({ date, isCurrentMonth: true });
    }

    // Add days from next month to fill the grid (only to complete the last week)
    const remainingCells = totalCells - days.length;
    for (let i = 1; i <= remainingCells; i++) {
      const date = new Date(year, month + 1, i);
      days.push({ date, isCurrentMonth: false });
    }

    return days;
  }, [currentDate]);

  // Map sessions by date for quick lookup
  const sessionsByDate = useMemo(() => {
    if (!sessions) return new Map<string, WorkoutSessionWithDetails[]>();

    const map = new Map<string, WorkoutSessionWithDetails[]>();
    sessions.forEach((session) => {
      const dateStr = session.session_date.split("T")[0];
      if (!map.has(dateStr)) {
        map.set(dateStr, []);
      }
      map.get(dateStr)!.push(session);
    });
    return map;
  }, [sessions]);

  // Helper to get the last session ID for a given date
  const getSessionIdForDate = (dateStr: string): string | null => {
    const sessionsOnDate = sessionsByDate.get(dateStr) || [];
    if (sessionsOnDate.length === 0) return null;
    // Sort by session_date descending and return the most recent one's ID
    const sorted = [...sessionsOnDate].sort(
      (a, b) => new Date(b.session_date).getTime() - new Date(a.session_date).getTime()
    );
    return sorted[0]?.id || null;
  };

  // Check if a date is today
  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  if (isLoading) {
    return (
      <div className="bg-base-200 rounded-md p-6 border border-base-300">
        <h2 className="text-lg font-semibold mb-4">Workout Calendar</h2>
        <div className="h-64 bg-base-300 rounded animate-pulse"></div>
      </div>
    );
  }

  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <>
      <div className="bg-base-200 rounded-md p-4 md:p-6 border border-base-300">
        {/* Header with month navigation */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg md:text-xl font-semibold">
            {currentDate.toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            })}
          </h2>
          <div className="flex gap-2">
            <button
              onClick={goToPreviousMonth}
              className="btn btn-ghost btn-sm min-h-[44px] min-w-[44px] p-2"
              aria-label="Previous month"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={goToNextMonth}
              className="btn btn-ghost btn-sm min-h-[44px] min-w-[44px] p-2"
              aria-label="Next month"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Day labels */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayLabels.map((day) => (
            <div
              key={day}
              className="text-center text-xs text-base-content/60 font-medium py-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, index) => {
            const dateStr = day.date.toISOString().split("T")[0];
            const hasWorkout = sessionsByDate.has(dateStr);
            const workoutCount = sessionsByDate.get(dateStr)?.length || 0;
            const isTodayDate = isToday(day.date);
            const sessionId = getSessionIdForDate(dateStr);

            const cellClasses = `
              relative aspect-square min-h-[44px] rounded-md flex flex-col items-center justify-center
              text-base transition-all
              ${!day.isCurrentMonth ? "text-base-content/30" : "text-base-content"}
              ${hasWorkout ? "bg-accent/20 hover:bg-accent/30 cursor-pointer font-semibold" : "bg-base-300/50"}
              ${isTodayDate ? "ring-2 ring-accent" : ""}
            `;

            if (hasWorkout && sessionId) {
              return (
                <Link key={index} href={`/session/${sessionId}`} className={cellClasses}>
                  <span className="text-sm md:text-base">{day.date.getDate()}</span>
                  {hasWorkout && (
                    <div className="absolute bottom-1 flex gap-0.5">
                      {Array.from({ length: Math.min(workoutCount, 3) }).map((_, i) => (
                        <div
                          key={i}
                          className="w-1 h-1 rounded-full bg-accent"
                        />
                      ))}
                    </div>
                  )}
                </Link>
              );
            }

            return (
              <div key={index} className={cellClasses}>
                <span className="text-sm md:text-base">{day.date.getDate()}</span>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};
