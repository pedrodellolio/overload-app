-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create workouts table
CREATE TABLE workouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_session_at TIMESTAMPTZ,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create exercises table
CREATE TABLE exercises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create workouts_exercises join table
CREATE TABLE workouts_exercises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workout_id UUID NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
  load_in_kg NUMERIC(6, 2) NOT NULL DEFAULT 0 CHECK (load_in_kg >= 0),
  details TEXT,
  UNIQUE(workout_id, exercise_id)
);

-- Create indexes for better performance
CREATE INDEX idx_workouts_user_id ON workouts(user_id);
CREATE INDEX idx_workouts_created_at ON workouts(created_at DESC);
CREATE INDEX idx_workouts_last_session_at ON workouts(last_session_at DESC);
CREATE INDEX idx_exercises_user_id ON exercises(user_id);
CREATE INDEX idx_workouts_exercises_workout_id ON workouts_exercises(workout_id);
CREATE INDEX idx_workouts_exercises_exercise_id ON workouts_exercises(exercise_id);

-- Enable Row Level Security (RLS)
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE workouts_exercises ENABLE ROW LEVEL SECURITY;

-- RLS Policies for workouts table
-- Users can view only their own workouts
CREATE POLICY "Users can view own workouts"
  ON workouts
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own workouts
CREATE POLICY "Users can create own workouts"
  ON workouts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update only their own workouts
CREATE POLICY "Users can update own workouts"
  ON workouts
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete only their own workouts
CREATE POLICY "Users can delete own workouts"
  ON workouts
  FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for exercises table
-- Users can view only their own exercises
CREATE POLICY "Users can view own exercises"
  ON exercises
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own exercises
CREATE POLICY "Users can create own exercises"
  ON exercises
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update only their own exercises
CREATE POLICY "Users can update own exercises"
  ON exercises
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete only their own exercises
CREATE POLICY "Users can delete own exercises"
  ON exercises
  FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for workouts_exercises table
-- Users can only view workout_exercises for their own workouts
CREATE POLICY "Users can view own workout exercises"
  ON workouts_exercises
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM workouts
      WHERE workouts.id = workouts_exercises.workout_id
      AND workouts.user_id = auth.uid()
    )
  );

-- Users can insert workout_exercises only for their own workouts
CREATE POLICY "Users can create own workout exercises"
  ON workouts_exercises
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workouts
      WHERE workouts.id = workouts_exercises.workout_id
      AND workouts.user_id = auth.uid()
    )
  );

-- Users can update workout_exercises only for their own workouts
CREATE POLICY "Users can update own workout exercises"
  ON workouts_exercises
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM workouts
      WHERE workouts.id = workouts_exercises.workout_id
      AND workouts.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workouts
      WHERE workouts.id = workouts_exercises.workout_id
      AND workouts.user_id = auth.uid()
    )
  );

-- Users can delete workout_exercises only for their own workouts
CREATE POLICY "Users can delete own workout exercises"
  ON workouts_exercises
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM workouts
      WHERE workouts.id = workouts_exercises.workout_id
      AND workouts.user_id = auth.uid()
    )
  );

-- Optional: Create a function to automatically set user_id on workout creation
-- This ensures the user_id is always set correctly from the auth context
CREATE OR REPLACE FUNCTION set_user_id_on_workout()
RETURNS TRIGGER AS $$
BEGIN
  NEW.user_id := auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Optional: Create a trigger to automatically set user_id on workouts
CREATE TRIGGER trigger_set_user_id_on_workout
  BEFORE INSERT ON workouts
  FOR EACH ROW
  EXECUTE FUNCTION set_user_id_on_workout();

-- Optional: Create a function to automatically set user_id on exercise creation
CREATE OR REPLACE FUNCTION set_user_id_on_exercise()
RETURNS TRIGGER AS $$
BEGIN
  NEW.user_id := auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Optional: Create a trigger to automatically set user_id on exercises
CREATE TRIGGER trigger_set_user_id_on_exercise
  BEFORE INSERT ON exercises
  FOR EACH ROW
  EXECUTE FUNCTION set_user_id_on_exercise();

-- Create function to get personal records (max load per exercise)
CREATE OR REPLACE FUNCTION get_personal_records()
RETURNS TABLE (
  exercise_id UUID,
  exercise_title TEXT,
  max_load NUMERIC,
  workout_title TEXT,
  last_session_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    e.id AS exercise_id,
    e.title AS exercise_title,
    MAX(we.load_in_kg) AS max_load,
    w.title AS workout_title,
    w.last_session_at
  FROM exercises e
  INNER JOIN workouts_exercises we ON e.id = we.exercise_id
  INNER JOIN workouts w ON we.workout_id = w.id
  WHERE e.user_id = auth.uid()
    AND w.last_session_at IS NOT NULL
  GROUP BY e.id, e.title, w.title, w.last_session_at, we.load_in_kg
  HAVING we.load_in_kg = MAX(we.load_in_kg)
  ORDER BY max_load DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
