import { useState } from "react";
import {
  useExercises,
  useCreateExercise,
  useDeleteExercise,
} from "../hooks/useExercises";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateExerciseSchema, type CreateExercise } from "../types/models";
import { Trash2Icon } from "lucide-react";

export const Exercises = () => {
  const [isCreating, setIsCreating] = useState(false);
  const { data: exercises, isLoading } = useExercises();
  const createMutation = useCreateExercise();
  const deleteMutation = useDeleteExercise();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateExercise>({
    resolver: zodResolver(CreateExerciseSchema),
  });

  const onSubmit = async (data: CreateExercise) => {
    try {
      await createMutation.mutateAsync(data);
      reset();
      setIsCreating(false);
    } catch (error) {
      console.error("Failed to create exercise:", error);
    }
  };

  const handleDelete = async (exerciseId: string) => {
    if (confirm("Are you sure you want to delete this exercise?")) {
      try {
        await deleteMutation.mutateAsync(exerciseId);
      } catch (error) {
        console.error("Failed to delete exercise:", error);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-base-content/70">Loading exercises...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Exercises</h1>
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
                placeholder="Exercise name (e.g., Bench Press, Squats)"
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
                {createMutation.isPending ? "Creating..." : "Create"}
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
        {exercises && exercises.length === 0 ? (
          <p className="text-center text-base-content/60 py-8">
            No exercises yet. Create your first exercise!
          </p>
        ) : (
          exercises?.map((exercise) => (
            <div
              key={exercise.id}
              className="bg-base-200 border border-base-300 rounded-md p-4 transition-shadow"
            >
              <div className="flex justify-between items-center">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{exercise.title}</h3>
                  {/* <p className="text-xs text-base-content/50 mt-1">
                    Created:{" "}
                    {new Date(exercise.created_at).toLocaleDateString()}
                  </p> */}
                </div>
                <button
                  onClick={() => handleDelete(exercise.id)}
                  disabled={deleteMutation.isPending}
                  className="btn btn-sm btn-error btn-soft btn-circle"
                >
                  <Trash2Icon size={20} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
