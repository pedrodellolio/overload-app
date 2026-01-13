import { useState } from "react";
import { Link } from "wouter";
import {
  useWorkouts,
  useCreateWorkout,
  useDeleteWorkout,
} from "../hooks/useWorkouts";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateWorkoutSchema, type CreateWorkout } from "../types/models";

export const Home = () => {
  const [isCreating, setIsCreating] = useState(false);
  const { data: workouts, isLoading } = useWorkouts();
  const createMutation = useCreateWorkout();
  const deleteMutation = useDeleteWorkout();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateWorkout>({
    resolver: zodResolver(CreateWorkoutSchema),
  });

  const onSubmit = async (data: CreateWorkout) => {
    try {
      await createMutation.mutateAsync(data);
      reset();
      setIsCreating(false);
    } catch (error) {
      console.error("Failed to create workout:", error);
    }
  };

  const handleDelete = async (workoutId: string) => {
    if (confirm("Are you sure you want to delete this workout?")) {
      try {
        await deleteMutation.mutateAsync(workoutId);
      } catch (error) {
        console.error("Failed to delete workout:", error);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-gray-600">Loading workouts...</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-6 pb-24">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Workouts</h1>
        <button
          onClick={() => setIsCreating(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          + New
        </button>
      </div>

      {isCreating && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            <div>
              <input
                {...register("title")}
                placeholder="Workout title"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.title && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.title.message}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
              >
                {createMutation.isPending ? "Creating..." : "Create"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsCreating(false);
                  reset();
                }}
                className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-3">
        {workouts && workouts.length === 0 ? (
          <p className="text-center text-gray-500 py-8">
            No workouts yet. Create your first workout!
          </p>
        ) : (
          workouts?.map((workout) => (
            <div
              key={workout.id}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{workout.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Created: {new Date(workout.created_at).toLocaleDateString()}
                  </p>
                  {workout.last_session_at && (
                    <p className="text-sm text-green-600 mt-1">
                      Last session:{" "}
                      {new Date(workout.last_session_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Link href={`/workout/${workout.id}`}>
                    <span className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors">
                      Register
                    </span>
                  </Link>
                  <button
                    onClick={() => handleDelete(workout.id)}
                    disabled={deleteMutation.isPending}
                    className="text-red-600 hover:bg-red-50 px-3 py-1 rounded text-sm transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
