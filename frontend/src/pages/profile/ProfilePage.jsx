import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";

import Posts from "../../components/common/Posts";
import ProfileHeaderSkeleton from "../../components/skeletons/ProfileHeaderSkeleton";
import EditProfileModal from "./EditProfileModal";

import { IoCalendarOutline } from "react-icons/io5";
import { FaLink } from "react-icons/fa";
import { MdEdit } from "react-icons/md";
import { useQuery } from "@tanstack/react-query";
import { formatMemberSinceDate } from "../../utils/date";

import useFollow from "../../hooks/useFollow";
import useUpdateUserProfile from "../../hooks/useUpdateUserProfile";
import { API_BASE_URL } from "../../config/api";

const ProfilePage = () => {
  const [coverImg, setCoverImg] = useState(null);
  const [profileImg, setProfileImg] = useState(null);
  const [feedType, setFeedType] = useState("posts");

  const coverImgRef = useRef(null);
  const profileImgRef = useRef(null);

  const { username } = useParams();

  const { follow, isPending } = useFollow();
  const { data: authUser } = useQuery({ queryKey: ["authUser"] });

  const {
    data: user,
    isLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["userProfile"],
    queryFn: async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/users/profile/${username}`, { credentials: 'include' });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Something went wrong");
        }
        return data;
      } catch (error) {
        throw new Error(error);
      }
    },
  });

  const { isUpdatingProfile, updateProfile } = useUpdateUserProfile();

  const isMyProfile = authUser._id === user?._id;
  const memberSinceDate = formatMemberSinceDate(user?.createdAt);
  const amIFollowing = authUser?.following.includes(user?._id);

  const handleImgChange = (e, state) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        state === "coverImg" && setCoverImg(reader.result);
        state === "profileImg" && setProfileImg(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    refetch();
  }, [username, refetch]);

  return (
    <>
      <div className="flex-[4_4_0] border-r border-[#23272F] min-h-screen bg-black">
        {/* HEADER */}
        {(isLoading || isRefetching) && <ProfileHeaderSkeleton />}
        {!isLoading && !isRefetching && !user && <p className="text-center text-lg mt-4 text-white">User not found</p>}
        <div className="flex flex-col">
          {!isLoading && !isRefetching && user && (
            <>
              {/* Banner */}
              <div className="relative w-full">
                <img
                  src={coverImg || user?.coverImg || "/cover.png"}
                  className="w-full h-56 object-cover"
                  alt="cover image"
                />
                {/* Edit cover button */}
                {isMyProfile && (
                  <button
                    className="absolute top-4 right-8 bg-[#FF5722] p-2 rounded-full shadow-lg hover:bg-[#00FFDD] transition z-20"
                    onClick={() => coverImgRef.current.click()}
                  >
                    <MdEdit className="w-5 h-5 text-white" />
                  </button>
                )}
                {/* Hidden file inputs for images */}
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  ref={coverImgRef}
                  onChange={(e) => handleImgChange(e, "coverImg")}
                />
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  ref={profileImgRef}
                  onChange={(e) => handleImgChange(e, "profileImg")}
                />
              </div>
              {/* Profile Section - DP left, info right */}
              <div className="flex flex-row items-start px-8 pt-4 pb-6 gap-8">
                {/* DP on the left, 35% on banner, 65% below */}
                <div className="relative -mt-14 z-20 flex-shrink-0">
                  <div className="relative w-56 h-56 rounded-3xl overflow-hidden">
                    {/* Blur background */}
                    <div 
                      className="absolute inset-0 rounded-3xl blur-2xl opacity-30"
                      style={{
                        backgroundImage: `url(${profileImg || user?.profileImg || "/avatar-placeholder.png"})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        transform: 'scale(1.2)'
                      }}
                    />
                    {/* Subtle overlay */}
                    <div className="absolute inset-0 rounded-3xl bg-white/5 backdrop-blur-sm" />
                    {/* Main profile image with padding */}
                    <div className="relative w-full h-full p-2 flex items-center justify-center">
                      <img
                        src={profileImg || user?.profileImg || "/avatar-placeholder.png"}
                        className="w-full h-full rounded-3xl object-cover shadow-2xl ring-1 ring-white/20"
                        alt="profile"
                      />
                    </div>
                  </div>
                  {isMyProfile && (
                    <button
                      className="absolute bottom-2 right-2 bg-[#FF5722] p-2 rounded-full shadow-lg hover:bg-[#00FFDD] transition"
                      onClick={() => profileImgRef.current.click()}
                    >
                      <MdEdit className="w-5 h-5 text-white" />
                    </button>
                  )}
                </div>
                {/* User info on the right - aligned with DP height */}
                <div className="flex flex-col flex-1 justify-start h-56 mt-10 gap-2">
                  {/* Top section - Name, username, and stats */}
                  <div className="flex flex-row items-start justify-between w-full">
                    <div className="flex flex-col gap-1">
                      <div className="flex flex-row items-center gap-3 flex-wrap">
                        <span className="font-extrabold text-2xl text-white">{user?.fullName}</span>
                        <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#FF5722] text-white">@{user?.username}</span>
                      </div>
                      {/* Bio */}
                      {user?.bio && <span className="text-gray-300 text-sm max-w-lg line-clamp-2">{user?.bio}</span>}
                    </div>
                    {/* Stats on the right side */}
                    <div className="flex flex-row gap-8 items-center">
                      <Link to={`/followFollowing/${user?.username}/followers`} className="flex flex-col items-center hover:opacity-80 transition-opacity cursor-pointer">
                        <span className="font-bold text-3xl text-[#FF5722]">{user?.followers.length}</span>
                        <span className="text-[#fff] text-sm font-medium">Followers</span>
                      </Link>
                      <Link to={`/followFollowing/${user?.username}/following`} className="flex flex-col items-center hover:opacity-80 transition-opacity cursor-pointer">
                        <span className="font-bold text-3xl text-[#FF5722]">{user?.following.length}</span>
                        <span className="text-[#FFF] text-sm font-medium">Following</span>
                      </Link>
                    </div>
                  </div>
                  {/* Middle section - Extra info */}
                  <div className="flex flex-row gap-4 items-center text-gray-400 text-xs flex-wrap">
                    {user?.link && (
                      <span className="flex gap-1 items-center">
                        <FaLink className="w-3 h-3" />
                        <a
                          href={user?.link}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#FF5722] hover:underline"
                        >
                          {user?.link}
                        </a>
                      </span>
                    )}
                    <span className="flex gap-1 items-center">
                      <IoCalendarOutline className="w-3 h-3" />
                      Joined {memberSinceDate}
                    </span>
              </div>
                  {/* Bottom section - Action buttons */}
                  <div className="flex flex-row gap-3">
                {isMyProfile && <EditProfileModal authUser={authUser} />}
                {!isMyProfile && (
                  <button
                        className="btn btn-outline rounded-full btn-sm border-[#FF5722] text-[#FF5722] hover:bg-[#FF5722] hover:text-white font-bold px-6"
                    onClick={() => follow(user?._id)}
                  >
                    {isPending && "Loading..."}
                    {!isPending && amIFollowing && "Unfollow"}
                    {!isPending && !amIFollowing && "Follow"}
                  </button>
                )}
                {(coverImg || profileImg) && (
                  <button
                        className="btn rounded-full btn-sm text-white px-6 bg-[#00FFDD] hover:bg-[#E8FFC2] border-0"
                    onClick={async () => {
                      await updateProfile({ coverImg, profileImg });
                      setProfileImg(null);
                      setCoverImg(null);
                    }}
                  >
                    {isUpdatingProfile ? "Updating..." : "Update"}
                  </button>
                )}
              </div>
                </div>
              </div>
              {/* Tabs for Posts/Likes */}
              <div className="flex w-full border-b border-[#23272F] mb-2">
                <div
                  className={`flex justify-center flex-1 p-3 cursor-pointer font-bold text-white transition relative ${feedType === "posts" ? "bg-[#181A20] rounded-t-2xl" : "hover:bg-[#23272F]"}`}
                  onClick={() => setFeedType("posts")}
                >
                  Posts
                  {feedType === "posts" && (
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-1 rounded-full bg-[#FF5722]" />
                  )}
                </div>
                <div
                  className={`flex justify-center flex-1 p-3 cursor-pointer font-bold text-white transition relative ${feedType === "likes" ? "bg-[#181A20] rounded-t-2xl" : "hover:bg-[#23272F]"}`}
                  onClick={() => setFeedType("likes")}
                >
                  Likes
                  {feedType === "likes" && (
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-1 rounded-full bg-[#00FFDD]" />
                  )}
                </div>
              </div>
            </>
          )}
          {/* User's Posts */}
          <div className="px-2 md:px-8">
            <Posts feedType={feedType} username={username} userId={user?._id} verticalList={true} />
          </div>
        </div>
      </div>
    </>
  );
};
export default ProfilePage;
