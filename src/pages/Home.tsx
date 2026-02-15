import { PRCard } from "../components/PRCard";
import { Calendar } from "../components/Calendar";
import { ActiveWorkouts } from "../components/ActiveWorkouts";
import { useAuth } from "../contexts/AuthContext";

export const Home = () => {
  const { user, signOut } = useAuth();
  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Welcome Back!</h1>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-auto">
        {/* Stats Card */}
        <div className="md:col-span-1 lg:col-span-2">
          <PRCard />
        </div>
        
        {/* Calendar - Largest, most prominent */}
        <div className="md:col-span-1 lg:row-span-2">
          <Calendar />
          <div className="mt-4">
            <ActiveWorkouts />
          </div>
        </div>
      </div>

      {/* <p className="mt-8 text-sm text-base-content/60 text-center">
        Logged in as{" "}
        <span className="font-semibold text-base-content">{user?.email}</span>
      </p>
      <button onClick={handleSignOut} className="mt-6 w-full btn btn-soft">
        <LogOutIcon size={16} />
        Sign Out
      </button> */}
    </div>
  );
};
