import { FaRegComment } from "react-icons/fa";
import { FaRegHeart, FaHeart } from "react-icons/fa";
import { FaTrash, FaCopy, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dracula } from "react-syntax-highlighter/dist/esm/styles/prism";

import LoadingSpinner from "./LoadingSpinner";
import { formatPostDate } from "../../utils/date";
import { API_BASE_URL } from "../../config/api";

const Post = ({ post }) => {
  const [comment, setComment] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { data: authUser } = useQuery({ queryKey: ["authUser"] });
  const queryClient = useQueryClient();
  const postOwner = post.user;
  const isLiked = post.likes.includes(authUser._id);
  const isMyPost = authUser._id === post.user._id;
  const formattedDate = formatPostDate(post.createdAt);

  // Determine which images to display (backward compatibility)
  const displayImages = post.images && post.images.length > 0 ? post.images : (post.img ? [post.img] : []);

  // Carousel state for blocks
  const [blockIndex, setBlockIndex] = useState(0);

  // Add copied state for legacy code snippet
  const [copiedLegacy, setCopiedLegacy] = useState(false);
  // Add copied state for block code snippets (carousel)
  const [copiedBlock, setCopiedBlock] = useState({});

  const { mutate: deletePost, isPending: isDeleting } = useMutation({
    mutationFn: async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/posts/${post._id}`, {
          method: "DELETE",
        });
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Something went wrong");
        }
        return data;
      } catch (error) {
        throw new Error(error);
      }
    },
    onSuccess: () => {
      toast.success("Post deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  const { mutate: likePost, isPending: isLiking } = useMutation({
    mutationFn: async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/posts/like/${post._id}`, {
          method: "POST",
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Something went wrong");
        }
        return data;
      } catch (error) {
        throw new Error(error);
      }
    },
    onSuccess: (updatedLikes) => {
      // Update all posts queries in cache
      queryClient
        .getQueryCache()
        .findAll("posts")
        .forEach(({ queryKey }) => {
          queryClient.setQueryData(queryKey, (oldData) => {
            if (!Array.isArray(oldData)) return oldData;
            return oldData.map((p) =>
              p._id === post._id ? { ...p, likes: updatedLikes } : p
            );
          });
        });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const { mutate: commentPost, isPending: isCommenting } = useMutation({
    mutationFn: async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/posts/comment/${post._id}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text: comment }),
        });
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Something went wrong");
        }
        return data;
      } catch (error) {
        throw new Error(error);
      }
    },
    onSuccess: () => {
      toast.success("Comment posted successfully");
      setComment("");
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleDeletePost = () => {
    deletePost();
  };

  const handlePostComment = (e) => {
    e.preventDefault();
    if (isCommenting) return;
    commentPost();
  };

  const handleLikePost = () => {
    if (isLiking) return;
    likePost();
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(post.codeSnippet);
    setCopiedLegacy(true);
    setTimeout(() => setCopiedLegacy(false), 2000);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % displayImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + displayImages.length) % displayImages.length);
  };

  // Helper for rendering blocks as a horizontal carousel
  const renderBlocksCarousel = () => {
    if (!Array.isArray(post.blocks) || post.blocks.length === 0) return null;
    const currentBlock = post.blocks[blockIndex];
    const isCopied = copiedBlock[blockIndex] || false;
    const handleBlockCopy = () => {
      navigator.clipboard.writeText(currentBlock.codeSnippet);
      setCopiedBlock((prev) => ({ ...prev, [blockIndex]: true }));
      setTimeout(() => setCopiedBlock((prev) => ({ ...prev, [blockIndex]: false })), 2000);
    };
    return (
      <div className="relative w-full h-full flex flex-col items-center justify-center">
        {/* Carousel content */}
        <div className="w-full h-full flex items-center justify-center overflow-hidden">
          <div className="w-full h-full flex items-center justify-center">
            {currentBlock.type === "code" && (
              <div className="w-full h-full bg-black rounded-lg p-3 overflow-y-auto flex flex-col items-center">
                <div className="flex items-center justify-between mb-2 w-full max-w-2xl mx-auto">
                  <span className="text-sm text-gray-400">{currentBlock.language ? currentBlock.language.charAt(0).toUpperCase() + currentBlock.language.slice(1) : "Code"}</span>
                  <button
                    onClick={handleBlockCopy}
                    className={`flex items-center gap-1 px-2 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-all text-sm ${isCopied ? 'opacity-70 pointer-events-none' : ''}`}
                    disabled={isCopied}
                  >
                    <FaCopy className="w-3 h-3" /> {isCopied ? "Copied!" : "Copy"}
                  </button>
                </div>
                <div className="w-full max-w-2xl mx-auto overflow-x-auto">
                  <SyntaxHighlighter
                    language={currentBlock.language || "javascript"}
                    style={dracula}
                    customStyle={{ margin: 0, borderRadius: "0.5rem", fontSize: "0.95rem", maxHeight: 240, background: "#000" }}
                  >
                    {currentBlock.codeSnippet}
                  </SyntaxHighlighter>
                </div>
              </div>
            )}
            {currentBlock.type === "image" && (
              <div className="w-full h-full flex justify-center items-center">
                <img
                  src={currentBlock.imageUrl}
                  alt="Post block"
                  className="max-h-72 max-w-full rounded-lg border border-gray-700 bg-gray-900 object-contain"
                  style={{ margin: "auto" }}
                />
              </div>
            )}
          </div>
        </div>
        {/* Carousel navigation */}
        {post.blocks.length > 1 && (
          <>
            <button
              onClick={() => setBlockIndex((blockIndex - 1 + post.blocks.length) % post.blocks.length)}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-gray-800 bg-opacity-70 rounded-full p-2 text-white hover:bg-opacity-100 transition-all z-10"
            >
              <FaChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setBlockIndex((blockIndex + 1) % post.blocks.length)}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gray-800 bg-opacity-70 rounded-full p-2 text-white hover:bg-opacity-100 transition-all z-10"
            >
              <FaChevronRight className="w-4 h-4" />
            </button>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-gray-800 bg-opacity-70 rounded-full px-2 py-1 text-white text-xs">
              {blockIndex + 1} / {post.blocks.length}
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="bg-black border border-[#23272F] rounded-2xl shadow-2xl w-full mx-0 mb-8 overflow-hidden flex flex-col transition-all duration-200 hover:shadow-blue-700/30" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-6 pt-6 pb-2">
        <Link to={`/profile/${postOwner.username}`}> 
          <img src={postOwner.profileImg || "/avatar-placeholder.png"} className="w-12 h-12 rounded-full object-cover border-2 border-[#FF5722] shadow" alt={postOwner.username} />
        </Link>
        <div className="flex flex-col flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-white text-lg truncate drop-shadow">{postOwner.fullName || postOwner.username}</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#FF5722] text-white ml-1">@{postOwner.username}</span>
            <span className="text-xs text-gray-400 ml-2">{formattedDate}</span>
          </div>
        </div>
        {isMyPost && (
          <button className="ml-auto bg-transparent hover:bg-red-500/20 p-2 rounded-full" onClick={handleDeletePost}>
            {!isDeleting ? <FaTrash className="text-gray-400 hover:text-[#FF0060] w-4 h-4" /> : <LoadingSpinner size="sm" />}
          </button>
        )}
      </div>

      {/* Main Content */}
      <div className="px-6 pb-6 flex-1">
        {/* Post Title/Description */}
        {post.text && (
          <div className="mb-3">
            <p className="text-xl text-white leading-snug break-words drop-shadow">{post.text}</p>
          </div>
        )}
        {/* Render blocks as carousel if present, else fallback to legacy fields */}
        {Array.isArray(post.blocks) && post.blocks.length > 0 ? (
          renderBlocksCarousel()
        ) : (
          <>
            {/* Code Snippet Display (legacy) */}
            {post.codeSnippet && (
              <div className="bg-black rounded-xl p-4 mb-4 border border-[#31343C] relative overflow-x-auto shadow-inner">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#FF5722] text-white uppercase tracking-wide">{post.language ? post.language : "Code"}</span>
                  <button onClick={handleCopyCode} className={`flex items-center gap-1 px-2 py-1 rounded bg-[#00DFA2] text-black hover:bg-[#F6FA70] transition-all text-xs font-mono shadow ${copiedLegacy ? 'opacity-70 pointer-events-none' : ''}`} disabled={copiedLegacy}>
                    <FaCopy className="w-3 h-3" /> {copiedLegacy ? "Copied!" : "Copy"}
                  </button>
                </div>
                <SyntaxHighlighter
                  language={post.language || "javascript"}
                  style={dracula}
                  customStyle={{ margin: 0, borderRadius: "0.5rem", fontSize: "1rem", fontFamily: 'JetBrains Mono, Fira Code, Fira Mono, monospace', background: '#000' }}
                  codeTagProps={{ style: { fontFamily: 'JetBrains Mono, Fira Code, Fira Mono, monospace' } }}
                >
                  {post.codeSnippet}
                </SyntaxHighlighter>
              </div>
            )}
            {/* Multiple Images Display with Sliding (legacy) */}
            {displayImages.length > 0 && (
              <div className="w-full flex justify-center items-center relative mb-4">
                <img src={displayImages[currentImageIndex]} className="object-contain max-h-72 rounded-xl border-2 border-blue-600 bg-[#181A20] shadow-lg" alt={`Post image ${currentImageIndex + 1}`} />
                {displayImages.length > 1 && (
                  <>
                    <button onClick={prevImage} className="absolute left-2 top-1/2 -translate-y-1/2 bg-gradient-to-r from-blue-600 to-purple-500 rounded-full p-2 text-white hover:from-purple-500 hover:to-blue-600 transition-all shadow-lg">
                      <FaChevronLeft className="w-4 h-4" />
                    </button>
                    <button onClick={nextImage} className="absolute right-2 top-1/2 -translate-y-1/2 bg-gradient-to-r from-blue-600 to-purple-500 rounded-full p-2 text-white hover:from-purple-500 hover:to-blue-600 transition-all shadow-lg">
                      <FaChevronRight className="w-4 h-4" />
                    </button>
                  </>
                )}
                {displayImages.length > 1 && (
                  <div className="absolute top-2 right-2 bg-gradient-to-r from-blue-600 to-purple-500 rounded-full px-2 py-1 text-white text-xs font-mono shadow">
                    {currentImageIndex + 1} / {displayImages.length}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end px-6 py-4 border-t border-[#23272F] bg-black">
        <div className="flex items-center gap-6">
          {/* Like Button */}
          <div className="flex gap-1 items-center group cursor-pointer" onClick={handleLikePost}>
            {isLiking && <LoadingSpinner size="sm" />}
            {!isLiked && !isLiking && (
              <FaRegHeart className="w-5 h-5 cursor-pointer text-[#FF5722] group-hover:text-[#FF8A65] transition" />
            )}
            {isLiked && !isLiking && (
              <FaHeart className="w-5 h-5 cursor-pointer text-[#FF8A65]" />
            )}
            <span className={`text-sm group-hover:text-[#FF8A65] ${isLiked ? "text-[#FF8A65]" : "text-[#FF5722]"}`}>{post.likes.length}</span>
          </div>
          {/* Comment Button */}
          <div className="flex gap-1 items-center cursor-pointer group" onClick={() => document.getElementById(`comments_modal${post._id}`).showModal()}>
            <FaRegComment className="w-5 h-5 text-[#FF5722] group-hover:text-[#FF8A65] transition" />
            <span className="text-sm text-[#FF5722] group-hover:text-[#FF8A65]">{post.comments.length}</span>
          </div>
        </div>
      </div>
      {/* Comments Modal (unchanged) */}
      <dialog id={`comments_modal${post._id}`} className="modal border-none outline-none">
        <div className="modal-box rounded border border-gray-600">
          <h3 className="font-bold text-lg mb-4">CONSOLE YOUR COMMENTS</h3>
          <div className="flex flex-col gap-3 max-h-60 overflow-auto">
            {post.comments.length === 0 && (
              <p className="text-sm text-slate-500">
                No comments yet 🤔 Be the first one 😉
              </p>
            )}
            {post.comments.map((comment) => (
              <div key={comment._id} className="flex gap-2 items-start">
                <div className="avatar">
                  <div className="w-8 rounded-full">
                    <img
                      src={comment.user.profileImg || "/avatar-placeholder.png"}
                      alt={comment.user.username}
                    />
                  </div>
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-1">
                    <span className="font-bold">{comment.user.fullName}</span>
                    <span className="text-gray-700 text-sm">
                      @{comment.user.username}
                    </span>
                  </div>
                  <div className="text-sm">{comment.text}</div>
                </div>
              </div>
            ))}
          </div>
          <form
            className="flex gap-2 items-center mt-4 border-t border-gray-600 pt-2"
            onSubmit={handlePostComment}
          >
            <textarea
              className="textarea w-full p-1 rounded text-md resize-none border focus:outline-none border-gray-800"
              placeholder="Add a comment..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <button className="btn rounded-full btn-sm text-white px-4 bg-[#FF5722] hover:bg-[#FF8A65] border-0">
              {isCommenting ? <LoadingSpinner size="md" /> : "Console"}
            </button>
          </form>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button className="outline-none">close</button>
        </form>
      </dialog>
    </div>
  );
};

export default Post;