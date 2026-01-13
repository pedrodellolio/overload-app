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

const ExerciseInputSchema = z.object({
  workoutExerciseId: z.string(),
  load_in_kg: z.number().min(0),
  details: z.string().optional(),
});

const WorkoutRegistrationSchema = z.object({
  exercises: z.array(ExerciseInputSchema),
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
    },
  });

  const onSubmit = async (data: WorkoutRegistrationForm) => {
    if (!id) return;

    try {
      await registerMutation.mutateAsync({
        workoutId: id,
        exerciseUpdates: data.exercises.map((ex) => ({
          workoutExerciseId: ex.workoutExerciseId,
          load_in_kg: ex.load_in_kg,
          details: ex.details || undefined,
        })),
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
        <p className="text-gray-600">Loading workout...</p>
      </div>
    );
  }

  if (!workout) {
    return (
      <div className="max-w-md mx-auto px-4 py-6">
        <p className="text-red-600">Workout not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-6 pb-24">
      <div className="mb-6">
        <button
          onClick={() => setLocation("/")}
          className="text-blue-600 hover:underline mb-2"
        >
          ← Back
        </button>
        <h1 className="text-2xl font-bold">{workout.title}</h1>
        <p className="text-sm text-gray-500 mt-1">
          Register your workout session
        </p>
      </div>

      {/* Add Exercise Section */}
      <div className="mb-6">
        {!isAddingExercise ? (
          <button
            onClick={() => setIsAddingExercise(true)}
            className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors"
          >
            + Add Exercise
          </button>
        ) : (
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <select
              value={selectedExerciseId}
              onChange={(e) => setSelectedExerciseId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
              >
                {addExerciseMutation.isPending ? "Adding..." : "Add"}
              </button>
              <button
                onClick={() => {
                  setIsAddingExercise(false);
                  setSelectedExerciseId("");
                }}
                className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {workout.exercises.length === 0 ? (
          <p className="text-center text-gray-500 py-8">
            No exercises in this workout yet. Add some exercises to get started!
          </p>
        ) : (
          workout.exercises.map((workoutExercise, index) => (
            <div
              key={workoutExercise.id}
              className="bg-white border border-gray-200 rounded-lg p-4"
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-semibold">{workoutExercise.exercise.title}</h3>
                <button
                  type="button"
                  onClick={() => handleRemoveExercise(workoutExercise.id)}
                  disabled={removeExerciseMutation.isPending}
                  className="text-red-600 hover:bg-red-50 px-2 py-1 rounded text-sm transition-colors"
                >
                  Remove
                </button>
              </div>

              <input
                type="hidden"
                {...register(`exercises.${index}.workoutExerciseId`)}
                value={workoutExercise.id}
              />

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Load (kg)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    {...register(`exercises.${index}.load_in_kg`, {
                      valueAsNumber: true,
                    })}
                    defaultValue={workoutExercise.load_in_kg}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.exercises?.[index]?.load_in_kg && (
                    <p className="text-red-600 text-sm mt-1">
                      {errors.exercises[index]?.load_in_kg?.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Details (optional)
                  </label>
                  <textarea
                    {...register(`exercises.${index}.details`)}
                    defaultValue={workoutExercise.details || ""}
                    rows={2}
                    placeholder="Notes, reps, sets, etc."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors font-semibold"
          >
            {registerMutation.isPending ? "Registering..." : "Complete Session"}
          </button>
        )}
      </form>
    </div>
  );
};
