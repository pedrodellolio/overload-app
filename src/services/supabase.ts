import type {
  Workout,
  WorkoutWithExercises,
  CreateWorkout,
  Exercise,
  WorkoutSessionWithDetails,
} from "../types/models";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
export const supabase = createClient(supabaseUrl, supabaseKey);

// Workout queries
export const getWorkouts = async (): Promise<WorkoutWithExercises[]> => {
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

// Workout session queries
export const getWorkoutSessions = async (
  limit = 20
): Promise<WorkoutSessionWithDetails[]> => {
  const { data, error } = await supabase
    .from("workout_sessions")
    .select(
      `
      *,
      workout:workouts(*),
      exercises:workout_session_exercises(
        *,
        exercise:exercises(*)
      )
    `
    )
    .order("session_date", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
};

export const getWorkoutSessionsByWorkout = async (
  workoutId: string
): Promise<WorkoutSessionWithDetails[]> => {
  const { data, error } = await supabase
    .from("workout_sessions")
    .select(
      `
      *,
      workout:workouts(*),
      exercises:workout_session_exercises(
        *,
        exercise:exercises(*)
      )
    `
    )
    .eq("workout_id", workoutId)
    .order("session_date", { ascending: false });
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
  sessionDate: string,
  exerciseUpdates: Array<{
    workoutExerciseId: string;
    exerciseId: string;
    load_in_kg: number;
    details?: string;
  }>
): Promise<void> => {
  // Convert sessionDate (YYYY-MM-DD) to ISO datetime string
  const sessionDateTime = new Date(sessionDate + "T00:00:00").toISOString();

  // Get current workout to check last_session_at
  const { data: currentWorkout, error: fetchError } = await supabase
    .from("workouts")
    .select("last_session_at")
    .eq("id", workoutId)
    .single();
  if (fetchError) throw fetchError;

  // Only update last_session_at if the new session is more recent
  if (
    !currentWorkout.last_session_at ||
    new Date(sessionDateTime) > new Date(currentWorkout.last_session_at)
  ) {
    const { error: workoutError } = await supabase
      .from("workouts")
      .update({ last_session_at: sessionDateTime })
      .eq("id", workoutId);
    if (workoutError) throw workoutError;
  }

  // Create a workout session record
  const { data: sessionData, error: sessionError } = await supabase
    .from("workout_sessions")
    .insert({
      workout_id: workoutId,
      session_date: sessionDateTime,
    })
    .select()
    .single();
  if (sessionError) throw sessionError;

  // Update workouts_exercises with latest loads
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

  // Create workout_session_exercises records
  const sessionExercises = exerciseUpdates.map((update) => ({
    session_id: sessionData.id,
    exercise_id: update.exerciseId,
    load_in_kg: update.load_in_kg,
    details: update.details || null,
  }));

  const { error: sessionExercisesError } = await supabase
    .from("workout_session_exercises")
    .insert(sessionExercises);
  if (sessionExercisesError) throw sessionExercisesError;
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
    .from("workout_sessions")
    .select("session_date")
    .gte("session_date", startDate)
    .lte("session_date", endDate);

  if (error) throw error;

  // Group by date
  const frequencyMap = new Map<string, number>();
  data.forEach((session) => {
    const date = session.session_date.split("T")[0];
    frequencyMap.set(date, (frequencyMap.get(date) || 0) + 1);
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
    .from("workout_session_exercises")
    .select(
      `
      load_in_kg,
      workout_sessions!inner(
        session_date,
        workouts!inner(
          title
        )
      )
    `
    )
    .eq("exercise_id", exerciseId)
    .order("workout_sessions(session_date)", { ascending: true });

  if (error) throw error;

  return data.map((item: any) => ({
    date: item.workout_sessions.session_date,
    load_in_kg: item.load_in_kg,
    workout_title: item.workout_sessions.workouts.title,
  }));
};

export const getLoadEvolutionByWorkout = async (
  workoutId: string
): Promise<
  Array<{
    date: string;
    exercise_title: string;
    load_in_kg: number;
  }>
> => {
  const { data, error } = await supabase
    .from("workout_session_exercises")
    .select(
      `
      load_in_kg,
      exercises!inner(
        title
      ),
      workout_sessions!inner(
        session_date,
        workout_id
      )
    `
    )
    .eq("workout_sessions.workout_id", workoutId)
    .order("workout_sessions(session_date)", { ascending: true });

  if (error) throw error;

  return data.map((item: any) => ({
    date: item.workout_sessions.session_date,
    load_in_kg: item.load_in_kg,
    exercise_title: item.exercises.title,
  }));
};
