import { useParams } from "wouter";
import { WorkoutRegistration } from "./WorkoutRegistration";

export const SessionView = () => {
  const { sessionId } = useParams();

  return <WorkoutRegistration sessionId={sessionId} viewMode={true} />;
};
