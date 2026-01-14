import { useQuery } from "@tanstack/react-query";
import {
  getPersonalRecords,
  getWorkoutFrequency,
  getLoadEvolutionByExercise,
  getLoadEvolutionByWorkout,
} from "../services/supabase";

export const statsKeys = {
  all: ["stats"] as const,
  prs: () => [...statsKeys.all, "prs"] as const,
  frequency: (year: number) => [...statsKeys.all, "frequency", year] as const,
  evolution: (exerciseId: string) =>
    [...statsKeys.all, "evolution", exerciseId] as const,
  workoutEvolution: (workoutId: string) =>
    [...statsKeys.all, "workoutEvolution", workoutId] as const,
};

export const usePersonalRecords = () => {
  return useQuery({
    queryKey: statsKeys.prs(),
    queryFn: () => getPersonalRecords(),
    staleTime: 0,
    refetchOnMount: "always",
  });
};

export const useWorkoutFrequency = (year: number = new Date().getFullYear()) => {
  return useQuery({
    queryKey: statsKeys.frequency(year),
    queryFn: () => getWorkoutFrequency(year),
    staleTime: 0,
    refetchOnMount: "always",
  });
};

export const useLoadEvolution = (exerciseId: string) => {
  return useQuery({
    queryKey: statsKeys.evolution(exerciseId),
    queryFn: () => getLoadEvolutionByExercise(exerciseId),
    enabled: !!exerciseId,
    staleTime: 0,
    refetchOnMount: "always",
  });
};

export const useWorkoutEvolution = (workoutId: string) => {
  return useQuery({
    queryKey: statsKeys.workoutEvolution(workoutId),
    queryFn: () => getLoadEvolutionByWorkout(workoutId),
    enabled: !!workoutId,
    staleTime: 0,
    refetchOnMount: "always",
  });
};
