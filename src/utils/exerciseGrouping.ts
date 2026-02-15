import type { Exercise } from "../types/models";

export type ExercisesByEquipmentAndMuscle = {
  [equipmentType: string]: {
    [muscleGroup: string]: Exercise[];
  };
};

export const groupExercisesByEquipmentAndMuscle = (
  exercises: Exercise[]
): ExercisesByEquipmentAndMuscle => {
  const grouped: ExercisesByEquipmentAndMuscle = {};

  exercises.forEach((exercise) => {
    const equipment = exercise.equipment_type || "unknown";
    const muscle = exercise.muscle_group || "uncategorized";

    if (!grouped[equipment]) {
      grouped[equipment] = {};
    }

    if (!grouped[equipment][muscle]) {
      grouped[equipment][muscle] = [];
    }

    grouped[equipment][muscle].push(exercise);
  });

  return grouped;
};

export const exportExercisesAsJSON = (
  exercises: Exercise[]
): string => {
  const grouped = groupExercisesByEquipmentAndMuscle(exercises);
  return JSON.stringify(grouped, null, 2);
};

export const downloadExercisesJSON = (exercises: Exercise[]) => {
  const jsonString = exportExercisesAsJSON(exercises);
  const blob = new Blob([jsonString], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `exercises-${new Date().toISOString().split("T")[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
