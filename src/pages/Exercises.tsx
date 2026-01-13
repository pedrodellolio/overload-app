import { useState } from "react";
import {
  useExercises,
  useCreateExercise,
  useDeleteExercise,
} from "../hooks/useExercises";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateExerciseSchema, type CreateExercise } from "../types/models";

export const Exercises = () => {
  console.log("oi");
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
        <p className="text-gray-600">Loading exercises...</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-6 pb-24">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Exercises</h1>
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
                placeholder="Exercise name (e.g., Bench Press, Squats)"
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
        {exercises && exercises.length === 0 ? (
          <p className="text-center text-gray-500 py-8">
            No exercises yet. Create your first exercise!
          </p>
        ) : (
          exercises?.map((exercise) => (
            <div
              key={exercise.id}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-center">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{exercise.title}</h3>
                  <p className="text-xs text-gray-400 mt-1">
                    Created:{" "}
                    {new Date(exercise.created_at).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(exercise.id)}
                  disabled={deleteMutation.isPending}
                  className="text-red-600 hover:bg-red-50 px-3 py-1 rounded text-sm transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
