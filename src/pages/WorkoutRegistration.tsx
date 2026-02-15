import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useWorkout, useRegisterWorkout } from "../hooks/useWorkouts";
import {
  useExercises,
  useAddExerciseToWorkout,
  useRemoveExerciseFromWorkout,
} from "../hooks/useExercises";
import { useWorkoutSessions } from "../hooks/useSessions";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Trash2Icon, ArrowLeft } from "lucide-react";

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
    { message: "Session date cannot be in the future" },
  ),
});

type WorkoutRegistrationForm = z.infer<typeof WorkoutRegistrationSchema>;

type WorkoutRegistrationProps = {
  sessionId?: string;
  viewMode?: boolean;
};

export const WorkoutRegistration = ({
  sessionId,
  viewMode = false,
}: WorkoutRegistrationProps = {}) => {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const [isAddingExercise, setIsAddingExercise] = useState(false);
  const [selectedExerciseId, setSelectedExerciseId] = useState("");
  const [exerciseSearchQuery, setExerciseSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(true);

  // Fetch session data if in view mode
  const { data: sessions, isLoading: sessionsLoading } =
    useWorkoutSessions(1000);
  const session =
    viewMode && sessionId ? sessions?.find((s) => s.id === sessionId) : null;

  const { data: workout, isLoading: workoutLoading } = useWorkout(
    viewMode ? session?.workout_id || "" : id || "",
  );
  const { data: availableExercises } = useExercises();
  const registerMutation = useRegisterWorkout();
  const addExerciseMutation = useAddExerciseToWorkout();
  const removeExerciseMutation = useRemoveExerciseFromWorkout();

  const isLoading = viewMode
    ? sessionsLoading || workoutLoading
    : workoutLoading;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<WorkoutRegistrationForm>({
    resolver: zodResolver(WorkoutRegistrationSchema),
    defaultValues: {
      exercises: [],
      sessionDate: new Date().toISOString().split("T")[0],
    },
  });

  // Reset form when workout/session data loads
  useEffect(() => {
    if (viewMode && session && workout) {
      // In view mode, populate with session data
      reset({
        exercises: session.exercises.map((ex) => ({
          workoutExerciseId: ex.id,
          load_in_kg: ex.load_in_kg,
          details: ex.details || "",
        })),
        sessionDate: session.session_date.split("T")[0],
      });
    } else if (!viewMode && workout) {
      // In edit mode, populate with workout defaults
      reset({
        exercises: workout.exercises.map((ex) => ({
          workoutExerciseId: ex.id,
          load_in_kg: ex.load_in_kg,
          details: ex.details || "",
        })),
        sessionDate: new Date().toISOString().split("T")[0],
      });
    }
  }, [viewMode, session, workout, reset]);

  const onSubmit = async (data: WorkoutRegistrationForm) => {
    if (!id || !workout) return;

    try {
      await registerMutation.mutateAsync({
        workoutId: id,
        sessionDate: data.sessionDate,
        exerciseUpdates: data.exercises.map((ex) => {
          const workoutExercise = workout.exercises.find(
            (we) => we.id === ex.workoutExerciseId,
          );
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
    (ex) => !workout?.exercises.some((we) => we.exercise_id === ex.id),
  );

  const filteredExercises = exercisesNotInWorkout?.filter((ex) => {
    const query = exerciseSearchQuery.toLowerCase();
    return (
      ex.title.toLowerCase().includes(query) ||
      (ex.muscle_group && ex.muscle_group.toLowerCase().includes(query))
    );
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-base-content/70">
          {viewMode ? "Loading session..." : "Loading workout..."}
        </p>
      </div>
    );
  }

  if (viewMode && !session) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-4">Session Not Found</h1>
        <p className="text-base-content/60 mb-6">
          The workout session you're looking for doesn't exist.
        </p>
        <button onClick={() => setLocation("/")} className="btn btn-accent">
          <ArrowLeft size={20} />
          Back to Home
        </button>
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

  const sessionDate =
    viewMode && session ? new Date(session.session_date) : null;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => setLocation("/")}
          className="btn btn-link btn-sm btn-accent mb-4 -ml-4"
        >
          <ArrowLeft size={18} />
          Back
        </button>
        <h1 className="text-2xl font-bold mb-2">{workout.title}</h1>
        {viewMode && sessionDate ? (
          <p className="text-base-content/60">
            {sessionDate.toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        ) : (
          <p className="text-sm text-base-content/60">
            Register your workout session
          </p>
        )}
      </div>

      {/* Session Date Input - Hidden in view mode */}
      {!viewMode && (
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
            <p className="text-error text-sm mt-1">
              {errors.sessionDate.message}
            </p>
          )}
        </div>
      )}

      {/* Add Exercise Section - Hidden in view mode */}
      {!viewMode && (
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
              <div className="form-control">
                <input
                  type="text"
                  placeholder="Search by exercise name or muscle group..."
                  value={exerciseSearchQuery}
                  onChange={(e) => {
                    setExerciseSearchQuery(e.target.value);
                    setShowSuggestions(true);
                  }}
                  className="w-full input"
                  autoFocus
                />
                {exerciseSearchQuery &&
                  showSuggestions &&
                  filteredExercises &&
                  filteredExercises.length > 0 && (
                    <div className="mt-2 max-h-64 overflow-y-auto bg-base-100 rounded-md border border-base-300 shadow-lg">
                      <ul className="menu p-0 w-full">
                        {filteredExercises.map((exercise) => (
                          <li key={exercise.id}>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedExerciseId(exercise.id);
                                setExerciseSearchQuery(exercise.title);
                                setShowSuggestions(false);
                              }}
                              className={`flex justify-between items-center px-4 py-3 ${
                                selectedExerciseId === exercise.id
                                  ? "active"
                                  : ""
                              }`}
                            >
                              <span className="font-medium">
                                {exercise.title}
                              </span>
                              {exercise.muscle_group && (
                                <span className="text-sm opacity-60">
                                  {exercise.muscle_group}
                                </span>
                              )}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                {exerciseSearchQuery &&
                  filteredExercises &&
                  filteredExercises.length === 0 && (
                    <div className="mt-2 p-4 bg-base-100 rounded-md border border-base-300 text-center text-base-content/60">
                      No exercises found
                    </div>
                  )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleAddExercise}
                  disabled={
                    !selectedExerciseId || addExerciseMutation.isPending
                  }
                  className="btn btn-accent flex-1"
                >
                  {addExerciseMutation.isPending ? "Adding..." : "Add"}
                </button>
                <button
                  onClick={() => {
                    setIsAddingExercise(false);
                    setSelectedExerciseId("");
                    setExerciseSearchQuery("");
                    setShowSuggestions(true);
                  }}
                  className="btn btn-soft"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {viewMode && session ? (
          // View mode: Display session exercises as readonly
          session.exercises.length === 0 ? (
            <p className="text-center text-base-content/60 py-8">
              No exercises logged for this session
            </p>
          ) : (
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-4">Workout Summary</h2>
              <div className="space-y-2">
                {session.exercises.map((exercise, index) => (
                  <div
                    key={exercise.id}
                    className="bg-base-200 rounded-md p-4"
                  >
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-semibold text-base-content/40 w-6">
                            {index + 1}.
                          </span>
                          <h3 className="font-semibold text-lg">
                            {exercise.exercise.title}
                          </h3>
                        </div>
                        {exercise.exercise.muscle_group && (
                          <p className="text-sm text-base-content/60 ml-8">
                            {exercise.exercise.muscle_group}
                          </p>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-2xl font-bold text-accent">
                          {exercise.load_in_kg}
                          <span className="text-base font-semibold ml-1">
                            kg
                          </span>
                        </p>
                      </div>
                    </div>

                    {exercise.details && (
                      <div className="ml-8">
                        <p className="text-sm text-base-content/60">
                          Notes: {exercise.details}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )
        ) : // Edit mode: Display workout exercises with inputs
        workout.exercises.length === 0 ? (
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

        {!viewMode && workout.exercises.length > 0 && (
          <button
            type="submit"
            disabled={registerMutation.isPending}
            className="w-full btn btn-accent"
          >
            {registerMutation.isPending ? "Registering..." : "Complete Session"}
          </button>
        )}
      </form>

      {/* Summary Stats - Only in view mode */}
      {/* {viewMode && session && (
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-base-200 rounded-md p-4 border border-base-300">
            <p className="text-sm text-base-content/60 mb-1">Total Exercises</p>
            <p className="text-2xl font-bold">{session.exercises.length}</p>
          </div>
          <div className="bg-base-200 rounded-md p-4 border border-base-300">
            <p className="text-sm text-base-content/60 mb-1">Total Load</p>
            <p className="text-2xl font-bold">
              {session.exercises.reduce((sum, ex) => sum + ex.load_in_kg, 0)} kg
            </p>
          </div>
        </div>
      )} */}
    </div>
  );
};
