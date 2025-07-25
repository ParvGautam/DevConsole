import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { AiOutlineSearch } from "react-icons/ai";
import { Loader } from "lucide-react";
import useFollow from "../../hooks/useFollow";
import { API_BASE_URL } from "../../config/api";

const SearchPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const { handleFollowAction, isPending: isFollowPending } = useFollow();

  // Debounce search query
  const handleSearch = (e) => { 
  
    setSearchQuery(e.target.value);
    clearTimeout(window.searchTimeout);
    window.searchTimeout = setTimeout(() => {
      setDebouncedQuery(e.target.value);
    }, 500);
  };

  const { data: authUser } = useQuery({ queryKey: ["authUser"] });

  const {
    data: searchResults,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["searchUsers", debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery.trim()) return [];
      const res = await fetch(`${API_BASE_URL}/api/users/search/${debouncedQuery}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      return data;
    },
    enabled: debouncedQuery.trim().length > 0,
  });

  // Filter out the logged-in user from the search results
  const filteredResults = searchResults?.filter(user => user._id !== authUser?._id);

  return (
    <div className="flex-[4_4_0] border-r border-gray-700 min-h-screen">
      {/* Search Header */}
      <div className="sticky top-0 bg-black/80 backdrop-blur-sm z-10 p-4 border-b border-gray-800">
        <div className="relative">
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={handleSearch}
            className="w-full bg-gray-900 rounded-full py-2 pl-12 pr-4 outline-none focus:border-primary border border-gray-800"
          />
          <AiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
        </div>
      </div>

      {/* Search Results */}
      <div className="p-4">
        {isLoading && (
          <div className="flex justify-center items-center mt-8">
            <Loader className="w-8 h-8 animate-spin" />
          </div>
        )}

        {error && (
          <div className="text-red-500 text-center mt-8">
            {error.message || "Something went wrong"}
          </div>
        )}

        {!isLoading && !error && filteredResults?.length === 0 && debouncedQuery && (
          <div className="text-center text-gray-500 mt-8">
            No users found matching `{debouncedQuery}`
          </div>
        )}

        {!isLoading && !error && filteredResults && (
          <div className="flex flex-col gap-4">
            {filteredResults.map((user) => {
              const isFollowing = authUser?.following?.includes(user._id);
              const isOwnProfile = authUser?._id === user._id;

              return (
                <div
                  key={user._id}
                  className="flex items-center justify-between p-4 hover:bg-gray-900/50 rounded-xl transition"
                >
                  <Link
                    to={`/profile/${user.username}`}
                    className="flex items-center flex-1 min-w-0"
                  >
                    <img
                      src={user.profileImg || "/avatar-placeholder.png"}
                      alt={`${user.username}'s avatar`}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className="ml-4 min-w-0">
                      <div className="font-bold truncate">{user.fullName}</div>
                      <div className="text-gray-500 text-sm truncate">
                        @{user.username}
                      </div>
                      {user.bio && (
                        <p className="text-sm text-gray-400 mt-1 truncate">
                          {user.bio}
                        </p>
                      )}
                    </div>
                  </Link>

                  {!isOwnProfile && (
                    <div className="ml-4 flex items-center justify-center">
                      {isFollowPending ? (
                        <Loader className="w-4 h-4 animate-spin" />
                      ) : isFollowing ? (
                        <span className="text-green-500 text-sm">Following</span>
                      ) : (
                        <span className="text-gray-500 text-sm">Not Following</span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
