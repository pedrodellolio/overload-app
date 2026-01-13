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
import { Trash2Icon } from "lucide-react";

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
        <p className="text-base-content/70">Loading workouts...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Workouts</h1>
        <button onClick={() => setIsCreating(true)} className="btn btn-accent">
          + New
        </button>
      </div>

      {isCreating && (
        <div className="mb-6 p-4 bg-base-300 rounded-md">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            <div>
              <input
                {...register("title")}
                placeholder="Workout name (e.g., A, B, Chest & Triceps)"
                className={`input w-full ${errors.title && "input-error"}`}
              />
              {errors.title && (
                <p className="text-error text-sm mt-1">
                  {errors.title.message}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="btn btn-accent flex-1"
              >
                {createMutation.isPending ? "Creating..." : "Create Workout"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsCreating(false);
                  reset();
                }}
                className="btn btn-soft"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-3">
        {workouts && workouts.length === 0 ? (
          <p className="text-center text-base-content/60 py-8">
            No workouts yet. Create your first workout!
          </p>
        ) : (
          workouts?.map((workout) => (
            <div
              key={workout.id}
              className="bg-base-200 border border-base-300 rounded-md p-4 transition-shadow"
            >
              <div className="flex justify-between items-center">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{workout.title}</h3>
                  {/* <p className="text-sm text-base-content/60 mt-1">
                    Created: {new Date(workout.created_at).toLocaleDateString()}
                  </p> */}
                  {workout.last_session_at && (
                    <p className="text-sm text-accent mt-1">
                      Last session:{" "}
                      {new Date(workout.last_session_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/workout/${workout.id}`}
                    className="btn btn-sm btn-accent btn-outline"
                  >
                    Register
                  </Link>
                  <button
                    onClick={() => handleDelete(workout.id)}
                    disabled={deleteMutation.isPending}
                    className="btn btn-sm btn-error btn-soft btn-circle"
                  >
                    <Trash2Icon size={20} />
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
