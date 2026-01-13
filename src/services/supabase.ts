import type {
  Workout,
  WorkoutWithExercises,
  CreateWorkout,
  Exercise,
  CreateExercise,
} from "../types/models";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
export const supabase = createClient(supabaseUrl, supabaseKey);

// Workout queries
export const getWorkouts = async (): Promise<Workout[]> => {
  const { data, error } = await supabase
    .from("workouts")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
};

export const getWorkoutById = async (
  workoutId: string
): Promise<WorkoutWithExercises> => {
  const { data, error } = await supabase
    .from("workouts")
    .select(
      `
      *,
      exercises:workouts_exercises(
        *,
        exercise:exercises(*)
      )
    `
    )
    .eq("id", workoutId)
    .single();
  if (error) throw error;
  return data;
};

export const getWorkoutHistory = async (limit = 20): Promise<Workout[]> => {
  const { data, error } = await supabase
    .from("workouts")
    .select("*")
    .not("last_session_at", "is", null)
    .order("last_session_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
};

// Workout mutations
export const createWorkout = async (
  workout: CreateWorkout
): Promise<Workout> => {
  const { data, error } = await supabase
    .from("workouts")
    .insert({
      title: workout.title,
      created_at: new Date().toISOString(),
    })
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const deleteWorkout = async (workoutId: string): Promise<void> => {
  const { error } = await supabase
    .from("workouts")
    .delete()
    .eq("id", workoutId);
  if (error) throw error;
};

export const updateWorkoutSession = async (
  workoutId: string,
  exerciseUpdates: Array<{
    workoutExerciseId: string;
    load_in_kg: number;
    details?: string;
  }>
): Promise<void> => {
  const { error: workoutError } = await supabase
    .from("workouts")
    .update({ last_session_at: new Date().toISOString() })
    .eq("id", workoutId);
  if (workoutError) throw workoutError;

  for (const update of exerciseUpdates) {
    const { error } = await supabase
      .from("workouts_exercises")
      .update({
        load_in_kg: update.load_in_kg,
        details: update.details || null,
      })
      .eq("id", update.workoutExerciseId);
    if (error) throw error;
  }
};

// Exercise queries
export const getExercises = async (): Promise<Exercise[]> => {
  const { data, error } = await supabase
    .from("exercises")
    .select("*")
    .order("title", { ascending: true });
  if (error) throw error;
  return data;
};

// Exercise mutations
export const createExercise = async (
  exercise: CreateExercise
): Promise<Exercise> => {
  const { data, error } = await supabase
    .from("exercises")
    .insert({
      title: exercise.title,
      created_at: new Date().toISOString(),
    })
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const deleteExercise = async (exerciseId: string): Promise<void> => {
  const { error } = await supabase
    .from("exercises")
    .delete()
    .eq("id", exerciseId);
  if (error) throw error;
};

// Workout-Exercise relationship
export const addExerciseToWorkout = async (
  workoutId: string,
  exerciseId: string,
  loadInKg: number = 0,
  details?: string
): Promise<void> => {
  const { error } = await supabase.from("workouts_exercises").insert({
    workout_id: workoutId,
    exercise_id: exerciseId,
    load_in_kg: loadInKg,
    details: details || null,
  });
  if (error) throw error;
};

export const removeExerciseFromWorkout = async (
  workoutExerciseId: string
): Promise<void> => {
  const { error } = await supabase
    .from("workouts_exercises")
    .delete()
    .eq("id", workoutExerciseId);
  if (error) throw error;
};

// Stats queries
export const getPersonalRecords = async (): Promise<
  Array<{
    exercise_id: string;
    exercise_title: string;
    max_load: number;
    workout_title: string;
    last_session_at: string;
  }>
> => {
  const { data, error } = await supabase.rpc("get_personal_records");
  if (error) throw error;
  return data;
};

export const getWorkoutFrequency = async (
  year: number
): Promise<Array<{ date: string; count: number }>> => {
  const startDate = `${year}-01-01`;
  const endDate = `${year}-12-31`;

  const { data, error } = await supabase
    .from("workouts")
    .select("last_session_at")
    .not("last_session_at", "is", null)
    .gte("last_session_at", startDate)
    .lte("last_session_at", endDate);

  if (error) throw error;

  // Group by date
  const frequencyMap = new Map<string, number>();
  data.forEach((workout) => {
    if (workout.last_session_at) {
      const date = workout.last_session_at.split("T")[0];
      frequencyMap.set(date, (frequencyMap.get(date) || 0) + 1);
    }
  });

  return Array.from(frequencyMap.entries()).map(([date, count]) => ({
    date,
    count,
  }));
};

export const getLoadEvolutionByExercise = async (
  exerciseId: string
): Promise<
  Array<{
    date: string;
    load_in_kg: number;
    workout_title: string;
  }>
> => {
  const { data, error } = await supabase
    .from("workouts_exercises")
    .select(
      `
      load_in_kg,
      workouts!inner(
        title,
        last_session_at
      )
    `
    )
    .eq("exercise_id", exerciseId)
    .not("workouts.last_session_at", "is", null)
    .order("workouts(last_session_at)", { ascending: true });

  if (error) throw error;

  return data.map((item: any) => ({
    date: item.workouts.last_session_at,
    load_in_kg: item.load_in_kg,
    workout_title: item.workouts.title,
  }));
};
