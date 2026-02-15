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
import {
  ChevronDown,
  ChevronUp,
  MoreVertical,
  FileEdit,
  Trash2,
} from "lucide-react";

export const Workouts = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [expandedWorkoutId, setExpandedWorkoutId] = useState<string | null>(
    null,
  );
  const [selectedWorkout, setSelectedWorkout] = useState<{
    id: string;
    title: string;
  } | null>(null);
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

  const handleDelete = async () => {
    if (selectedWorkout) {
      try {
        await deleteMutation.mutateAsync(selectedWorkout.id);
        setSelectedWorkout(null);
        // Close drawer
        const drawer = document.getElementById(
          "workout-actions-drawer",
        ) as HTMLInputElement;
        if (drawer) drawer.checked = false;
      } catch (error) {
        console.error("Failed to delete workout:", error);
      }
    }
  };

  const openActionsDrawer = (workout: { id: string; title: string }) => {
    setSelectedWorkout(workout);
    const drawer = document.getElementById(
      "workout-actions-drawer",
    ) as HTMLInputElement;
    if (drawer) drawer.checked = true;
  };

  const closeActionsDrawer = () => {
    const drawer = document.getElementById(
      "workout-actions-drawer",
    ) as HTMLInputElement;
    if (drawer) drawer.checked = false;
    setTimeout(() => setSelectedWorkout(null), 300);
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
              className="bg-base-200 rounded-md p-4 transition-shadow"
            >
              <div className="flex justify-between items-center">
                <div
                  className="flex-1 cursor-pointer"
                  onClick={() =>
                    setExpandedWorkoutId(
                      expandedWorkoutId === workout.id ? null : workout.id,
                    )
                  }
                >
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-lg">{workout.title}</h3>
                    {expandedWorkoutId === workout.id ? (
                      <ChevronUp size={20} className="text-base-content/60" />
                    ) : (
                      <ChevronDown size={20} className="text-base-content/60" />
                    )}
                  </div>
                  {workout.last_session_at && (
                    <p className="text-sm text-accent mt-1">
                      Last session:{" "}
                      {new Date(workout.last_session_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <button
                  onClick={() =>
                    openActionsDrawer({ id: workout.id, title: workout.title })
                  }
                  className="btn btn-sm btn-ghost btn-circle"
                >
                  <MoreVertical size={20} />
                </button>
              </div>

              {expandedWorkoutId === workout.id &&
                workout.exercises &&
                workout.exercises.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-base-300">
                    <h4 className="text-sm font-medium text-base-content/60 mb-2">
                      Exercises:
                    </h4>
                    <div className="space-y-2">
                      {workout.exercises.map((we) => (
                        <div
                          key={we.id}
                          className="flex justify-between items-center text-sm bg-base-300 rounded px-3 py-2"
                        >
                          <span className="font-medium">
                            {we.exercise.title}
                          </span>
                          <span className="text-base-content/70">
                            {we.load_in_kg} kg
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          ))
        )}
      </div>

      {/* Bottom Sheet Drawer */}
      <div className="drawer">
        <input
          id="workout-actions-drawer"
          type="checkbox"
          className="drawer-toggle"
        />
        <div className="drawer-side z-50">
          <label
            htmlFor="workout-actions-drawer"
            className="drawer-overlay"
          ></label>
          <div className="bg-base-100 w-full absolute bottom-0 rounded-t-2xl shadow-xl pb-safe">
            {selectedWorkout && (
              <>
                <div className="px-4 py-3 border-b border-base-300">
                  <h3 className="font-semibold text-lg">
                    {selectedWorkout.title}
                  </h3>
                  <p className="text-sm text-base-content/60">
                    Choose an action
                  </p>
                </div>
                <ul className="menu w-full p-2">
                  <li>
                    <Link
                      href={`/workout/${selectedWorkout.id}`}
                      onClick={closeActionsDrawer}
                      className="flex items-center gap-3 py-4 text-base"
                    >
                      <FileEdit size={20} className="text-accent" />
                      <span>Register Session</span>
                    </Link>
                  </li>
                  <li className="w-full">
                    <button
                      onClick={handleDelete}
                      disabled={deleteMutation.isPending}
                      className="flex items-center gap-3 py-4 text-base text-error w-full"
                    >
                      <Trash2 size={20} />
                      <span>
                        {deleteMutation.isPending
                          ? "Deleting..."
                          : "Delete Workout"}
                      </span>
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
