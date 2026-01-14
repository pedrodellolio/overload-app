import { useState } from "react";
import {
  useExercises,
  useCreateExercise,
  useDeleteExercise,
} from "../hooks/useExercises";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateExerciseSchema, type CreateExercise } from "../types/models";
import { MoreVertical, Trash2 } from "lucide-react";

export const Exercises = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<{ id: string; title: string } | null>(null);
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

  const handleDelete = async () => {
    if (selectedExercise) {
      try {
        await deleteMutation.mutateAsync(selectedExercise.id);
        setSelectedExercise(null);
        // Close drawer
        const drawer = document.getElementById('exercise-actions-drawer') as HTMLInputElement;
        if (drawer) drawer.checked = false;
      } catch (error) {
        console.error("Failed to delete exercise:", error);
      }
    }
  };

  const openActionsDrawer = (exercise: { id: string; title: string }) => {
    setSelectedExercise(exercise);
    const drawer = document.getElementById('exercise-actions-drawer') as HTMLInputElement;
    if (drawer) drawer.checked = true;
  };

  const closeActionsDrawer = () => {
    const drawer = document.getElementById('exercise-actions-drawer') as HTMLInputElement;
    if (drawer) drawer.checked = false;
    setTimeout(() => setSelectedExercise(null), 300);
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
                autoFocus
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
                </div>
                <button
                  onClick={() => openActionsDrawer({ id: exercise.id, title: exercise.title })}
                  className="btn btn-sm btn-ghost btn-circle"
                >
                  <MoreVertical size={20} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Bottom Sheet Drawer */}
      <div className="drawer">
        <input id="exercise-actions-drawer" type="checkbox" className="drawer-toggle" />
        <div className="drawer-side z-50">
          <label htmlFor="exercise-actions-drawer" className="drawer-overlay"></label>
          <div className="bg-base-100 w-full absolute bottom-0 rounded-t-2xl shadow-xl pb-safe">
            {selectedExercise && (
              <>
                <div className="px-4 py-3 border-b border-base-300">
                  <h3 className="font-semibold text-lg">{selectedExercise.title}</h3>
                  <p className="text-sm text-base-content/60">Choose an action</p>
                </div>
                <ul className="menu p-2">
                  <li className="w-full">
                    <button
                      onClick={handleDelete}
                      disabled={deleteMutation.isPending}
                      className="flex items-center gap-3 py-4 text-base text-error w-full"
                    >
                      <Trash2 size={20} />
                      <span>{deleteMutation.isPending ? "Deleting..." : "Delete Exercise"}</span>
                    </button>
                  </li>
                </ul>
                <div className="p-2">
                  <button
                    onClick={closeActionsDrawer}
                    className="btn btn-block btn-ghost"
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
