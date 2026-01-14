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
  muscle_group TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
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

-- Create workout_sessions table to log each workout session
CREATE TABLE workout_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workout_id UUID NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
  session_date TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create workout_session_exercises to log exercise data per session
CREATE TABLE workout_session_exercises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES workout_sessions(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
  load_in_kg NUMERIC(6, 2) NOT NULL CHECK (load_in_kg >= 0),
  details TEXT
);

-- Create indexes for better performance
CREATE INDEX idx_workouts_user_id ON workouts(user_id);
CREATE INDEX idx_workouts_created_at ON workouts(created_at DESC);
CREATE INDEX idx_workouts_last_session_at ON workouts(last_session_at DESC);
CREATE INDEX idx_exercises_user_id ON exercises(user_id);
CREATE INDEX idx_exercises_muscle_group ON exercises(muscle_group);
CREATE INDEX idx_workouts_exercises_workout_id ON workouts_exercises(workout_id);
CREATE INDEX idx_workouts_exercises_exercise_id ON workouts_exercises(exercise_id);
CREATE INDEX idx_workout_sessions_user_id ON workout_sessions(user_id);
CREATE INDEX idx_workout_sessions_workout_id ON workout_sessions(workout_id);
CREATE INDEX idx_workout_sessions_session_date ON workout_sessions(session_date DESC);
CREATE INDEX idx_workout_session_exercises_session_id ON workout_session_exercises(session_id);
CREATE INDEX idx_workout_session_exercises_exercise_id ON workout_session_exercises(exercise_id);

-- Enable Row Level Security (RLS)
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE workouts_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_session_exercises ENABLE ROW LEVEL SECURITY;

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
-- All authenticated users can view exercises (predefined exercises are available to all)
CREATE POLICY "All users can view exercises"
  ON exercises
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Prevent modification of predefined exercises (user_id IS NULL)
CREATE POLICY "Prevent modification of predefined exercises"
  ON exercises
  FOR ALL
  USING (user_id IS NOT NULL AND auth.uid() = user_id);

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

-- RLS Policies for workout_sessions table
CREATE POLICY "Users can view own workout sessions"
  ON workout_sessions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own workout sessions"
  ON workout_sessions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own workout sessions"
  ON workout_sessions
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own workout sessions"
  ON workout_sessions
  FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for workout_session_exercises table
CREATE POLICY "Users can view own workout session exercises"
  ON workout_session_exercises
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM workout_sessions
      WHERE workout_sessions.id = workout_session_exercises.session_id
      AND workout_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create own workout session exercises"
  ON workout_session_exercises
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workout_sessions
      WHERE workout_sessions.id = workout_session_exercises.session_id
      AND workout_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own workout session exercises"
  ON workout_session_exercises
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM workout_sessions
      WHERE workout_sessions.id = workout_session_exercises.session_id
      AND workout_sessions.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workout_sessions
      WHERE workout_sessions.id = workout_session_exercises.session_id
      AND workout_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own workout session exercises"
  ON workout_session_exercises
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM workout_sessions
      WHERE workout_sessions.id = workout_session_exercises.session_id
      AND workout_sessions.user_id = auth.uid()
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

-- Optional: Create a function to automatically set user_id on workout_sessions creation
CREATE OR REPLACE FUNCTION set_user_id_on_workout_session()
RETURNS TRIGGER AS $$
BEGIN
  NEW.user_id := auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Optional: Create a trigger to automatically set user_id on workout_sessions
CREATE TRIGGER trigger_set_user_id_on_workout_session
  BEFORE INSERT ON workout_sessions
  FOR EACH ROW
  EXECUTE FUNCTION set_user_id_on_workout_session();

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
  SELECT DISTINCT ON (e.id)
    e.id AS exercise_id,
    e.title AS exercise_title,
    MAX(wse.load_in_kg) AS max_load,
    w.title AS workout_title,
    ws.session_date AS last_session_at
  FROM exercises e
  INNER JOIN workout_session_exercises wse ON e.id = wse.exercise_id
  INNER JOIN workout_sessions ws ON wse.session_id = ws.id
  INNER JOIN workouts w ON ws.workout_id = w.id
  WHERE ws.user_id = auth.uid()
  GROUP BY e.id, e.title, w.title, ws.session_date
  ORDER BY e.id, max_load DESC, ws.session_date DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert predefined exercises available to all users

-- PEITO (Chest)
INSERT INTO exercises (title, muscle_group, user_id) VALUES
('Supino Reto', 'Peito', NULL),
('Supino Inclinado', 'Peito', NULL),
('Supino Declinado', 'Peito', NULL),
('Crucifixo', 'Peito', NULL),
('Crucifixo Inclinado', 'Peito', NULL),
('Peck Deck', 'Peito', NULL),
('Flexão', 'Peito', NULL);

-- COSTAS (Back)
INSERT INTO exercises (title, muscle_group, user_id) VALUES
('Puxada Frontal', 'Costas', NULL),
('Puxada Triângulo', 'Costas', NULL),
('Remada Curvada', 'Costas', NULL),
('Remada Cavalinho', 'Costas', NULL),
('Remada Unilateral', 'Costas', NULL),
('Pullover', 'Costas', NULL),
('Barra Fixa', 'Costas', NULL),
('Levantamento Terra', 'Costas', NULL);

-- OMBROS (Shoulders)
INSERT INTO exercises (title, muscle_group, user_id) VALUES
('Desenvolvimento', 'Ombros', NULL),
('Desenvolvimento Arnold', 'Ombros', NULL),
('Elevação Lateral', 'Ombros', NULL),
('Elevação Frontal', 'Ombros', NULL),
('Elevação Posterior', 'Ombros', NULL),
('Remada Alta', 'Ombros', NULL),
('Encolhimento', 'Ombros', NULL);

-- BÍCEPS (Biceps)
INSERT INTO exercises (title, muscle_group, user_id) VALUES
('Rosca Direta', 'Bíceps', NULL),
('Rosca Alternada', 'Bíceps', NULL),
('Rosca Martelo', 'Bíceps', NULL),
('Rosca Concentrada', 'Bíceps', NULL),
('Rosca Scott', 'Bíceps', NULL),
('Rosca Inversa', 'Bíceps', NULL),
('Rosca 21', 'Bíceps', NULL);

-- TRÍCEPS (Triceps)
INSERT INTO exercises (title, muscle_group, user_id) VALUES
('Tríceps Testa', 'Tríceps', NULL),
('Tríceps Francês', 'Tríceps', NULL),
('Tríceps Pulley', 'Tríceps', NULL),
('Tríceps Corda', 'Tríceps', NULL),
('Tríceps Coice', 'Tríceps', NULL),
('Supino Fechado', 'Tríceps', NULL),
('Mergulho', 'Tríceps', NULL);

-- PERNAS (Legs)
INSERT INTO exercises (title, muscle_group, user_id) VALUES
('Agachamento', 'Pernas', NULL),
('Agachamento Sumô', 'Pernas', NULL),
('Leg Press', 'Pernas', NULL),
('Cadeira Extensora', 'Pernas', NULL),
('Cadeira Flexora', 'Pernas', NULL),
('Mesa Flexora', 'Pernas', NULL),
('Stiff', 'Pernas', NULL),
('Afundo', 'Pernas', NULL),
('Cadeira Adutora', 'Pernas', NULL),
('Cadeira Abdutora', 'Pernas', NULL),
('Panturrilha Sentado', 'Pernas', NULL),
('Panturrilha em Pé', 'Pernas', NULL),
('Glúteo 4 Apoios', 'Pernas', NULL),
('Glúteo Caneleira', 'Pernas', NULL);

-- ABDÔMEN (Core/Abs)
INSERT INTO exercises (title, muscle_group, user_id) VALUES
('Abdominal Reto', 'Abdômen', NULL),
('Abdominal Canivete', 'Abdômen', NULL),
('Abdominal Infra', 'Abdômen', NULL),
('Prancha', 'Abdômen', NULL),
('Prancha Lateral', 'Abdômen', NULL),
('Abdominal Bicicleta', 'Abdômen', NULL),
('Elevação de Pernas', 'Abdômen', NULL),
('Abdominal Supra', 'Abdômen', NULL),
('Russian Twist', 'Abdômen', NULL);
