import { useQuery } from "@tanstack/react-query";
import { getWorkoutSessions, getWorkoutSessionsByWorkout } from "../services/supabase";

// Query keys
export const sessionKeys = {
  all: ["workout_sessions"] as const,
  lists: () => [...sessionKeys.all, "list"] as const,
  list: () => [...sessionKeys.lists()] as const,
  byWorkout: (workoutId: string) => [...sessionKeys.all, "workout", workoutId] as const,
};

// Queries
export const useWorkoutSessions = (limit = 20) => {
  return useQuery({
    queryKey: sessionKeys.list(),
    queryFn: () => getWorkoutSessions(limit),
  });
};

export const useWorkoutSessionsByWorkout = (workoutId: string) => {
  return useQuery({
    queryKey: sessionKeys.byWorkout(workoutId),
    queryFn: () => getWorkoutSessionsByWorkout(workoutId),
    enabled: !!workoutId,
  });
};
