import { useState } from "react";
import Posts from "../../components/common/Posts";
import CreatePost from "./CreatePost";
import RightPanel from "../../components/common/RightPanel";

const HomePage = () => {
  const [feedType, setFeedType] = useState("all");
  return (
    <div className="flex min-h-screen bg-black">
      {/* Left (empty for now, or add Sidebar if needed) */}
      <div className="hidden lg:block w-0"></div>
      {/* Center */}
      <div className="flex-1 flex flex-col min-h-screen border-x border-gray-800">
        <div className="sticky top-0 bg-black z-10 pb-2 border-b border-gray-700">
          <div className="flex justify-start px-4 py-3">
            <div className="inline-flex bg-[#23272F] rounded-full p-1 gap-2 shadow">
              <button
                className={`px-6 py-2 rounded-full text-sm font-semibold transition-colors duration-150 focus:outline-none ${feedType === "all" ? "bg-[#FF5722] text-white shadow" : "text-gray-400 hover:bg-[#181C23] hover:text-white"}`}
                onClick={() => setFeedType("all")}
              >
                All
              </button>
              <button
                className={`px-6 py-2 rounded-full text-sm font-semibold transition-colors duration-150 focus:outline-none ${feedType === "following" ? "bg-[#FF5722] text-white shadow" : "text-gray-400 hover:bg-[#181C23] hover:text-white"}`}
                onClick={() => setFeedType("following")}
              >
                Following
              </button>
            </div>
          </div>
        </div>
        <CreatePost />
        <Posts feedType={feedType === "all" ? "forYou" : feedType} verticalList={true} />
      </div>
      {/* Right: Suggested Users as horizontal row at the top, flush with posts */}
      <div className="hidden lg:flex flex-col w-72 pt-6">
        <RightPanel />
      </div>
    </div>
  );
};

export default HomePage;