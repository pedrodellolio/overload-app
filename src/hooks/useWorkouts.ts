import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreateWorkout } from "../types/models";
import {
  getWorkouts,
  getWorkoutById,
  getWorkoutHistory,
  createWorkout,
  deleteWorkout,
  updateWorkoutSession,
} from "../services/supabase";

// Query keys
export const workoutKeys = {
  all: ["workouts"] as const,
  lists: () => [...workoutKeys.all, "list"] as const,
  list: () => [...workoutKeys.lists()] as const,
  details: () => [...workoutKeys.all, "detail"] as const,
  detail: (id: string) => [...workoutKeys.details(), id] as const,
  history: () => [...workoutKeys.all, "history"] as const,
  historyList: () => [...workoutKeys.history()] as const,
};

// Queries
export const useWorkouts = () => {
  return useQuery({
    queryKey: workoutKeys.list(),
    queryFn: () => getWorkouts(),
  });
};

export const useWorkout = (workoutId: string) => {
  return useQuery({
    queryKey: workoutKeys.detail(workoutId),
    queryFn: () => getWorkoutById(workoutId),
    enabled: !!workoutId,
  });
};

export const useWorkoutHistory = (limit = 20) => {
  return useQuery({
    queryKey: workoutKeys.historyList(),
    queryFn: () => getWorkoutHistory(limit),
  });
};

// Mutations
export const useCreateWorkout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (workout: CreateWorkout) => createWorkout(workout),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workoutKeys.list() });
    },
  });
};

export const useDeleteWorkout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (workoutId: string) => deleteWorkout(workoutId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workoutKeys.list() });
      queryClient.invalidateQueries({ queryKey: workoutKeys.historyList() });
    },
  });
};

export const useRegisterWorkout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      workoutId,
      exerciseUpdates,
    }: {
      workoutId: string;
      exerciseUpdates: Array<{
        workoutExerciseId: string;
        load_in_kg: number;
        details?: string;
      }>;
    }) => updateWorkoutSession(workoutId, exerciseUpdates),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: workoutKeys.detail(variables.workoutId),
      });
      queryClient.invalidateQueries({ queryKey: workoutKeys.list() });
      queryClient.invalidateQueries({
        queryKey: workoutKeys.historyList(),
      });
    },
  });
};
