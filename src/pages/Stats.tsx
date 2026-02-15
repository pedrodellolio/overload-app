import { LoadEvolution } from "../components/LoadEvolution";
import { WorkoutEvolutionToggle } from "../components/WorkoutEvolutionToggle";
import { WorkoutHeatmap } from "../components/WorkoutHeatmap";

export const Stats = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Analytics & Stats</h1>

      {/* Charts Layout */}
      <div className="space-y-4">
        {/* Workout Frequency Heatmap */}
        <WorkoutHeatmap />

        {/* Load Evolution by Exercise */}
        <LoadEvolution />

        {/* Workout Evolution with Toggle */}
        <WorkoutEvolutionToggle />
      </div>
    </div>
  );
};
