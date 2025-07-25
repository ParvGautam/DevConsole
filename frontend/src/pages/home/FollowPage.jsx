import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import useFollow from "../../hooks/useFollow";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { API_BASE_URL } from "../../config/api";

const FollowPageSkeleton = () => (
  <div className="flex items-center justify-between p-4 bg-[#16181C] rounded-md shadow-md max-w-[600px] mx-auto">
    <div className="flex gap-4 items-center flex-1">
      <div className="avatar">
        <div className="w-10 h-10 rounded-full bg-slate-700 animate-pulse"></div>
      </div>
      <div className="flex flex-col gap-1">
        <div className="h-4 w-24 bg-slate-700 rounded animate-pulse"></div>
        <div className="h-3 w-16 bg-slate-600 rounded animate-pulse"></div>
        <div className="h-3 w-40 bg-slate-600 rounded animate-pulse mt-2"></div>
      </div>
    </div>
    <div className="btn-sm h-8 w-16 bg-slate-700 rounded-full animate-pulse"></div>
  </div>
);

const FollowPage = () => {
  const queryClient = useQueryClient();

  // Fetching users
  const { data: users, isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/api/users/followPage`, { credentials: 'include' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong!");
      return data;
    },
  });

  // Using follow hook
  const { follow, isPending } = useFollow({
    onSuccess: () => {
      // After successful follow, invalidate the users query to refetch the data
      queryClient.invalidateQueries(["users"]);
    },
    onError: (error) => {
      // Optionally, handle the error if needed
      console.error(error);
    },
  });

  return (
    <div className="flex w-[65%] min-h-screen mx-auto">
      <div className="flex-[4_4_0] p-4">
        <h1 className="text-2xl text-center font-semibold mb-4">All Users</h1>

        {/* Skeletons while loading */}
        {isLoading ? (
          <div className="flex flex-col gap-4">
            {[...Array(4)].map((_, idx) => (
              <FollowPageSkeleton key={idx} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {users?.map((user) => (
              <div
                key={user._id}
                className="flex items-center justify-between p-4 bg-[#16181C] rounded-md shadow-md w-[600px] mx-auto"
              >
                <Link to={`/profile/${user.username}`} className="flex gap-4 items-center flex-1">
                  <div className="avatar">
                    <div className="w-10 h-10 rounded-full">
                      <img src={user.profileImg || "/avatar-placeholder.png"} alt={user.username} />
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-white">{user.fullName}</span>
                    <span className="text-sm text-slate-500">@{user.username}</span>
                    {user.bio && (
                      <p className="text-xs text-slate-400 mt-1 max-w-[400px] truncate">{user.bio}</p>
                    )}
                    <div className="flex gap-4 text-xs text-slate-500 mt-2">
                      <span>{user.followers.length || 0} Followers</span>
                      <span>{user.following.length || 0} Following</span>
                    </div>
                  </div>
                </Link>
                <button
                  className="btn bg-white text-black hover:bg-white hover:opacity-90 rounded-full btn-sm"
                  onClick={(e) => {
                    e.preventDefault();
                    follow(user._id);
                  }}
                >
                  {isPending ? <LoadingSpinner size="sm" /> : "Follow"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FollowPage;
