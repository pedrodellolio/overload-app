-- Migration: Add equipment_type to exercises table

-- Add equipment_type column to exercises table
ALTER TABLE exercises
ADD COLUMN equipment_type TEXT
CHECK (equipment_type IN ('weight', 'machine', 'bodyweight'))
DEFAULT 'weight';

-- Create index for equipment_type for better query performance
CREATE INDEX idx_exercises_equipment_type ON exercises(equipment_type);

-- Update the personal records function to filter out 0kg and include equipment_type
CREATE OR REPLACE FUNCTION get_personal_records()
RETURNS TABLE (
  exercise_id UUID,
  exercise_title TEXT,
  equipment_type TEXT,
  max_load NUMERIC,
  workout_title TEXT,
  last_session_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT ON (e.id)
    e.id AS exercise_id,
    e.title AS exercise_title,
    e.equipment_type AS equipment_type,
    MAX(wse.load_in_kg) AS max_load,
    w.title AS workout_title,
    ws.session_date AS last_session_at
  FROM exercises e
  INNER JOIN workout_session_exercises wse ON e.id = wse.exercise_id
  INNER JOIN workout_sessions ws ON wse.session_id = ws.id
  INNER JOIN workouts w ON ws.workout_id = w.id
  WHERE ws.user_id = auth.uid()
    AND wse.load_in_kg > 0  -- Filter out 0kg PRs
  GROUP BY e.id, e.title, e.equipment_type, w.title, ws.session_date
  ORDER BY e.id, max_load DESC, ws.session_date DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update predefined exercises with equipment types
-- Chest exercises
UPDATE exercises SET equipment_type = 'weight' WHERE title IN ('Supino Reto', 'Supino Inclinado', 'Supino Declinado', 'Crucifixo Reto', 'Crucifixo Inclinado') AND user_id IS NULL;
UPDATE exercises SET equipment_type = 'machine' WHERE title IN ('Cross Over', 'Peck Deck', 'Supino na Máquina') AND user_id IS NULL;
UPDATE exercises SET equipment_type = 'bodyweight' WHERE title = 'Flexão de Braço' AND user_id IS NULL;

-- Back exercises
UPDATE exercises SET equipment_type = 'weight' WHERE title IN ('Remada Curvada', 'Remada Unilateral', 'Levantamento Terra', 'Barra Fixa', 'Pullover') AND user_id IS NULL;
UPDATE exercises SET equipment_type = 'machine' WHERE title IN ('Remada Baixa', 'Remada Alta', 'Pulldown', 'Puxada Frontal') AND user_id IS NULL;

-- Shoulders
UPDATE exercises SET equipment_type = 'weight' WHERE title IN ('Desenvolvimento com Halteres', 'Desenvolvimento com Barra', 'Elevação Lateral', 'Elevação Frontal', 'Remada Alta com Barra') AND user_id IS NULL;
UPDATE exercises SET equipment_type = 'machine' WHERE title IN ('Desenvolvimento na Máquina', 'Elevação Lateral na Máquina') AND user_id IS NULL;

-- Biceps
UPDATE exercises SET equipment_type = 'weight' WHERE title IN ('Rosca Direta', 'Rosca Alternada', 'Rosca Martelo', 'Rosca Scott', 'Rosca Concentrada') AND user_id IS NULL;
UPDATE exercises SET equipment_type = 'machine' WHERE title IN ('Rosca no Cabo', 'Rosca Scott na Máquina') AND user_id IS NULL;

-- Triceps
UPDATE exercises SET equipment_type = 'weight' WHERE title IN ('Tríceps Testa', 'Tríceps Francês', 'Mergulho', 'Kick Back') AND user_id IS NULL;
UPDATE exercises SET equipment_type = 'machine' WHERE title IN ('Tríceps Pulley', 'Tríceps Corda', 'Tríceps na Máquina') AND user_id IS NULL;

-- Legs
UPDATE exercises SET equipment_type = 'weight' WHERE title IN ('Agachamento Livre', 'Afundo', 'Levantamento Terra', 'Stiff', 'Passada') AND user_id IS NULL;
UPDATE exercises SET equipment_type = 'machine' WHERE title IN ('Leg Press', 'Cadeira Extensora', 'Cadeira Flexora', 'Agachamento na Máquina', 'Cadeira Abdutora', 'Cadeira Adutora', 'Panturrilha em Pé', 'Panturrilha Sentado') AND user_id IS NULL;

-- Core
UPDATE exercises SET equipment_type = 'bodyweight' WHERE title IN ('Abdominal Reto', 'Abdominal Oblíquo', 'Prancha', 'Elevação de Pernas') AND user_id IS NULL;
UPDATE exercises SET equipment_type = 'machine' WHERE title = 'Abdominal na Máquina' AND user_id IS NULL;
