import { useQuery } from "@tanstack/react-query";
import {
  getPersonalRecords,
  getWorkoutFrequency,
  getLoadEvolutionByExercise,
} from "../services/supabase";

export const statsKeys = {
  all: ["stats"] as const,
  prs: () => [...statsKeys.all, "prs"] as const,
  frequency: (year: number) => [...statsKeys.all, "frequency", year] as const,
  evolution: (exerciseId: string) =>
    [...statsKeys.all, "evolution", exerciseId] as const,
};

export const usePersonalRecords = () => {
  return useQuery({
    queryKey: statsKeys.prs(),
    queryFn: () => getPersonalRecords(),
  });
};

export const useWorkoutFrequency = (year: number = new Date().getFullYear()) => {
  return useQuery({
    queryKey: statsKeys.frequency(year),
    queryFn: () => getWorkoutFrequency(year),
  });
};

export const useLoadEvolution = (exerciseId: string) => {
  return useQuery({
    queryKey: statsKeys.evolution(exerciseId),
    queryFn: () => getLoadEvolutionByExercise(exerciseId),
    enabled: !!exerciseId,
  });
};
