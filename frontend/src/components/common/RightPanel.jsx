import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import useFollow from "../../hooks/useFollow";
import { API_BASE_URL } from "../../config/api";

import RightPanelSkeleton from "../skeletons/RightPanelSkeleton";
import LoadingSpinner from "./LoadingSpinner";

const RightPanel = () => {
  const { data: suggestedUsers, isLoading, refetch } = useQuery({
    queryKey: ["suggestedUsers"],
    queryFn: async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/users/suggested`, { credentials: 'include' });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Something went wrong!");
        }
        return data;
      } catch (error) {
        throw new Error(error.message);
      }
    },
  });

  const { follow, isPending } = useFollow();

  const handleFollow = async (userId, e) => {
    e.preventDefault();
    await follow(userId);
    // Refetch suggested users after following
    refetch();
  };

  if (suggestedUsers?.length === 0) return <div className='md:w-64 w-0'></div>;

  return (
    <div className="w-full border border-gray-800 bg-transparent p-0 mt-2 sticky top-20">
      {/* Header with title */}
      <div className="px-4 pt-4 pb-2 border-b border-gray-800">
        <p className="font-bold text-base text-white">Suggested Developers</p>
      </div>
      {/* Loading Skeletons */}
      {isLoading && (
        <div className="flex flex-col gap-4 p-4">
          <RightPanelSkeleton />
          <RightPanelSkeleton />
          <RightPanelSkeleton />
        </div>
      )}
      {/* Vertical List of Suggested Users */}
      {!isLoading && (
        <div className="flex flex-col gap-1 px-2 py-2">
          {suggestedUsers?.slice(0, 5).map((user) => (
            <div
              key={user._id}
              className="flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-[#222b36] transition"
            >
              {/* Profile Image */}
              <Link to={`/profile/${user.username}`}> 
                <img
                  src={user.profileImg || "/avatar-placeholder.png"}
                  alt={user.username}
                  className="w-11 h-11 rounded-full object-cover border-2 border-[#FF5722]"
                />
              </Link>
              {/* Name and Username */}
              <div className="flex-1 min-w-0">
                <Link to={`/profile/${user.username}`}> 
                  <p className="font-semibold text-white text-sm truncate">{user.fullName}</p>
                  <p className="text-xs text-gray-400 truncate">@{user.username}</p>
                </Link>
              </div>
              {/* Follow Button */}
              <button
                onClick={(e) => handleFollow(user._id, e)}
                disabled={isPending}
                className={`ml-2 px-4 py-1 text-xs font-medium text-white rounded-full transition
                  bg-[#FF5722] hover:bg-[#FF8A65] 
                  ${isPending ? 'bg-[#FF8A65] cursor-not-allowed' : ''}`}
              >
                {isPending ? <LoadingSpinner size="xs" /> : "Follow"}
              </button>
            </div>
          ))}
          {/* See all button */}
          <Link
            to="/followPage"
            className="block w-full mt-2 mb-2 text-center text-sm font-semibold text-[#FF5722] hover:underline py-2 border-t border-gray-800"
          >
            See all
          </Link>
        </div>
      )}
    </div>
  );
};

export default RightPanel;