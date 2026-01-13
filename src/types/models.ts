import { z } from "zod";

// Database schemas
export const WorkoutSchema = z.object({
  id: z.uuid(),
  title: z.string().min(1, "Title is required"),
  created_at: z.iso.datetime(),
  last_session_at: z.iso.datetime().nullable(),
  user_id: z.uuid(),
});

export const ExerciseSchema = z.object({
  id: z.uuid(),
  title: z.string().min(1, "Title is required"),
  created_at: z.iso.datetime(),
  user_id: z.uuid(),
});

export const WorkoutExerciseSchema = z.object({
  id: z.uuid(),
  workout_id: z.uuid(),
  exercise_id: z.uuid(),
  load_in_kg: z.number().min(0, "Load must be positive"),
  details: z.string().nullable(),
});

// DTOs
export const CreateWorkoutSchema = z.object({
  title: z.string().min(1, "Title is required"),
});

export const CreateExerciseSchema = z.object({
  title: z.string().min(1, "Title is required"),
});

export const UpdateWorkoutExerciseSchema = z.object({
  load_in_kg: z.number().min(0, "Load must be positive"),
  details: z.string().optional(),
});

// Schema for the workout_exercise join with nested exercise
export const WorkoutExerciseWithExerciseSchema = z.object({
  id: z.uuid(), // workout_exercise id
  workout_id: z.uuid(),
  exercise_id: z.uuid(),
  load_in_kg: z.number().min(0),
  details: z.string().nullable(),
  exercise: ExerciseSchema,
});

export const WorkoutWithExercisesSchema = WorkoutSchema.extend({
  exercises: z.array(WorkoutExerciseWithExerciseSchema),
});

// Types
export type Workout = z.infer<typeof WorkoutSchema>;
export type Exercise = z.infer<typeof ExerciseSchema>;
export type WorkoutExercise = z.infer<typeof WorkoutExerciseSchema>;
export type CreateWorkout = z.infer<typeof CreateWorkoutSchema>;
export type CreateExercise = z.infer<typeof CreateExerciseSchema>;
export type UpdateWorkoutExercise = z.infer<typeof UpdateWorkoutExerciseSchema>;
export type WorkoutWithExercises = z.infer<typeof WorkoutWithExercisesSchema>;
