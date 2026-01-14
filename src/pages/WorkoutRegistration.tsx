import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useWorkout, useRegisterWorkout } from "../hooks/useWorkouts";
import {
  useExercises,
  useAddExerciseToWorkout,
  useRemoveExerciseFromWorkout,
} from "../hooks/useExercises";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Trash2Icon } from "lucide-react";

const ExerciseInputSchema = z.object({
  workoutExerciseId: z.string(),
  load_in_kg: z.number().min(0),
  details: z.string().optional(),
});

const WorkoutRegistrationSchema = z.object({
  exercises: z.array(ExerciseInputSchema),
  sessionDate: z.string().refine(
    (date) => {
      const selectedDate = new Date(date);
      const today = new Date();
      today.setHours(23, 59, 59, 999); // Set to end of today
      return selectedDate <= today;
    },
    { message: "Session date cannot be in the future" }
  ),
});

type WorkoutRegistrationForm = z.infer<typeof WorkoutRegistrationSchema>;

export const WorkoutRegistration = () => {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const [isAddingExercise, setIsAddingExercise] = useState(false);
  const [selectedExerciseId, setSelectedExerciseId] = useState("");

  const { data: workout, isLoading } = useWorkout(id || "");
  const { data: availableExercises } = useExercises();
  const registerMutation = useRegisterWorkout();
  const addExerciseMutation = useAddExerciseToWorkout();
  const removeExerciseMutation = useRemoveExerciseFromWorkout();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<WorkoutRegistrationForm>({
    resolver: zodResolver(WorkoutRegistrationSchema),
    defaultValues: {
      exercises:
        workout?.exercises.map((ex) => ({
          workoutExerciseId: ex.id,
          load_in_kg: ex.load_in_kg,
          details: ex.details || "",
        })) || [],
      sessionDate: new Date().toISOString().split("T")[0], // Today's date in YYYY-MM-DD format
    },
  });

  const onSubmit = async (data: WorkoutRegistrationForm) => {
    if (!id || !workout) return;

    try {
      await registerMutation.mutateAsync({
        workoutId: id,
        sessionDate: data.sessionDate,
        exerciseUpdates: data.exercises.map((ex) => {
          const workoutExercise = workout.exercises.find((we) => we.id === ex.workoutExerciseId);
          return {
            workoutExerciseId: ex.workoutExerciseId,
            exerciseId: workoutExercise?.exercise_id || "",
            load_in_kg: ex.load_in_kg,
            details: ex.details || undefined,
          };
        }),
      });
      setLocation("/");
    } catch (error) {
      console.error("Failed to register workout:", error);
    }
  };

  const handleAddExercise = async () => {
    if (!id || !selectedExerciseId) return;

    try {
      await addExerciseMutation.mutateAsync({
        workoutId: id,
        exerciseId: selectedExerciseId,
      });
      setSelectedExerciseId("");
      setIsAddingExercise(false);
    } catch (error) {
      console.error("Failed to add exercise:", error);
    }
  };

  const handleRemoveExercise = async (workoutExerciseId: string) => {
    if (!id) return;

    if (confirm("Remove this exercise from the workout?")) {
      try {
        await removeExerciseMutation.mutateAsync({
          workoutExerciseId,
          workoutId: id,
        });
      } catch (error) {
        console.error("Failed to remove exercise:", error);
      }
    }
  };

  const exercisesNotInWorkout = availableExercises?.filter(
    (ex) => !workout?.exercises.some((we) => we.exercise_id === ex.id)
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-base-content/70">Loading workout...</p>
      </div>
    );
  }

  if (!workout) {
    return (
      <div className="max-w-md mx-auto px-4 py-6">
        <p className="text-error">Workout not found</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <button
          onClick={() => setLocation("/")}
          className="text-accent hover:underline mb-2"
        >
          ← Back
        </button>
        <h1 className="text-2xl font-bold">{workout.title}</h1>
        <p className="text-sm text-base-content/60 mt-1">
          Register your workout session
        </p>
      </div>

      {/* Session Date Input */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-base-content/80 mb-2">
          Session Date
        </label>
        <input
          type="date"
          {...register("sessionDate")}
          max={new Date().toISOString().split("T")[0]}
          className="w-full input"
        />
        {errors.sessionDate && (
          <p className="text-error text-sm mt-1">{errors.sessionDate.message}</p>
        )}
      </div>

      {/* Add Exercise Section */}
      <div className="mb-6">
        {!isAddingExercise ? (
          <button
            onClick={() => setIsAddingExercise(true)}
            className="w-full py-2 border-2 border-dashed border-base-300 rounded-md text-base-content/70 hover:border-accent hover:text-accent transition-colors"
          >
            + Add Exercise
          </button>
        ) : (
          <div className="bg-base-300 rounded-md p-4 space-y-3">
            <select
              value={selectedExerciseId}
              onChange={(e) => setSelectedExerciseId(e.target.value)}
              className="w-full select"
            >
              <option value="">Select an exercise...</option>
              {exercisesNotInWorkout?.map((exercise) => (
                <option key={exercise.id} value={exercise.id}>
                  {exercise.title}
                </option>
              ))}
            </select>
            <div className="flex gap-2">
              <button
                onClick={handleAddExercise}
                disabled={!selectedExerciseId || addExerciseMutation.isPending}
                className="btn btn-accent flex-1"
              >
                {addExerciseMutation.isPending ? "Adding..." : "Add"}
              </button>
              <button
                onClick={() => {
                  setIsAddingExercise(false);
                  setSelectedExerciseId("");
                }}
                className="btn btn-soft"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {workout.exercises.length === 0 ? (
          <p className="text-center text-base-content/60 py-8">
            No exercises in this workout yet. Add some exercises to get started!
          </p>
        ) : (
          workout.exercises.map((workoutExercise, index) => (
            <div
              key={workoutExercise.id}
              className="bg-base-200 border border-base-300 rounded-md p-4"
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-semibold">
                  {workoutExercise.exercise.title}
                </h3>
                <button
                  type="button"
                  onClick={() => handleRemoveExercise(workoutExercise.id)}
                  disabled={removeExerciseMutation.isPending}
                  className="btn btn-sm btn-error btn-soft btn-circle"
                >
                  <Trash2Icon size={18} />
                </button>
              </div>

              <input
                type="hidden"
                {...register(`exercises.${index}.workoutExerciseId`)}
                value={workoutExercise.id}
              />

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-base-content/60 mb-1">
                    Load (kg)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    {...register(`exercises.${index}.load_in_kg`, {
                      valueAsNumber: true,
                    })}
                    defaultValue={workoutExercise.load_in_kg}
                    className="w-full input"
                  />
                  {errors.exercises?.[index]?.load_in_kg && (
                    <p className="text-error text-sm mt-1">
                      {errors.exercises[index]?.load_in_kg?.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-base-content/60 mb-1">
                    Details (optional)
                  </label>
                  <textarea
                    {...register(`exercises.${index}.details`)}
                    defaultValue={workoutExercise.details || ""}
                    rows={2}
                    placeholder="Notes, reps, sets, etc."
                    className="w-full textarea"
                  />
                </div>
              </div>
            </div>
          ))
        )}

        {workout.exercises.length > 0 && (
          <button
            type="submit"
            disabled={registerMutation.isPending}
            className="w-full btn btn-accent"
          >
            {registerMutation.isPending ? "Registering..." : "Complete Session"}
          </button>
        )}
      </form>
    </div>
  );
};
