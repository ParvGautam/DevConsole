import Post from "./Post";
import PostSkeleton from "../skeletons/PostSkeleton";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { API_BASE_URL } from "../../config/api";

const Posts = ({ feedType, username, userId, verticalList }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  // Determine the endpoint based on feedType
  const getPostEndpoint = () => {
    switch (feedType) {
      case "forYou":
        return "/api/posts/all";
      case "following":
        return "/api/posts/following";
      case "newest":
        return "/api/posts/all?sort=newest";
      case "popular":
        return "/api/posts/all?sort=popular";
      case "posts":
        return `/api/posts/user/${username}`;
      case "likes":
        return `/api/posts/likes/${userId}`;
      default:
        return "/api/posts/all";
    }
  };

  const POST_ENDPOINT = getPostEndpoint();
  
  const {
    data: posts,
    isLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["posts", feedType, username, userId],
    queryFn: async () => {
      try {
        const res = await fetch(POST_ENDPOINT.startsWith('http') ? POST_ENDPOINT : `${API_BASE_URL}${POST_ENDPOINT}`);
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Something went wrong");
        }
        return data;
      } catch (error) {
        throw new Error(error.message);
      }
    },
  });

  useEffect(() => {
    refetch();
    setCurrentIndex(0); // Reset to first post on feed change
  }, [feedType, refetch, username, userId]);

  // Grid skeleton loading style with three columns
  const GridSkeleton = () => (
    <div className={verticalList ? "flex flex-col gap-4" : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"}>
      {[1, 2, 3, 4, 5, 6].map((item) => (
        <PostSkeleton key={item} />
      ))}
    </div>
  );

  if (isLoading || isRefetching) return <GridSkeleton />;
  if (!posts?.length) return <div className="text-center text-gray-500">No posts available. Check back later.</div>;

  // Vertical list mode
  if (verticalList) {
    return (
      <div className="flex flex-col gap-4">
        {posts.map((post) => (
          <Post key={post._id} post={post} refetch={refetch} />
        ))}
      </div>
    );
  }

  // Default: grid layout
  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {posts.map((post) => (
          <Post 
            key={post._id} 
            post={post} 
            refetch={refetch}
          />
        ))}
      </div>
    </div>
  );
};

export default Posts;