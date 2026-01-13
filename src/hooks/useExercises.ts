import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreateExercise } from "../types/models";
import {
  getExercises,
  createExercise,
  deleteExercise,
  addExerciseToWorkout,
  removeExerciseFromWorkout,
} from "../services/supabase";
import { workoutKeys } from "./useWorkouts";

// Query keys
export const exerciseKeys = {
  all: ["exercises"] as const,
  lists: () => [...exerciseKeys.all, "list"] as const,
  list: () => [...exerciseKeys.lists()] as const,
};

// Queries
export const useExercises = () => {
  return useQuery({
    queryKey: exerciseKeys.list(),
    queryFn: () => getExercises(),
  });
};

// Mutations
export const useCreateExercise = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (exercise: CreateExercise) => createExercise(exercise),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: exerciseKeys.list() });
    },
  });
};

export const useDeleteExercise = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (exerciseId: string) => deleteExercise(exerciseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: exerciseKeys.list() });
    },
  });
};

export const useAddExerciseToWorkout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      workoutId,
      exerciseId,
      loadInKg = 0,
      details,
    }: {
      workoutId: string;
      exerciseId: string;
      loadInKg?: number;
      details?: string;
    }) => addExerciseToWorkout(workoutId, exerciseId, loadInKg, details),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: workoutKeys.detail(variables.workoutId),
      });
    },
  });
};

export const useRemoveExerciseFromWorkout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      workoutExerciseId,
    }: {
      workoutExerciseId: string;
      workoutId: string;
    }) => removeExerciseFromWorkout(workoutExerciseId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: workoutKeys.detail(variables.workoutId),
      });
    },
  });
};
