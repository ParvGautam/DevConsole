import { useState, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { IoImageOutline, IoCloseCircle, IoChevronUp, IoChevronDown } from "react-icons/io5";
import { BiSend } from "react-icons/bi";
import { FaCopy } from "react-icons/fa";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { tomorrow } from "react-syntax-highlighter/dist/esm/styles/prism";
import { API_BASE_URL } from "../../config/api";

const languages = [
  "javascript", "python", "java", "cpp", "csharp", "php", "ruby", "go", 
  "rust", "swift", "kotlin", "typescript", "html", "css", "sql", "bash"
];

const emptyCodeBlock = { type: "code", codeSnippet: "", language: "javascript" };
const emptyImageBlock = { type: "image", imageData: null, preview: null };

const CreatePost = () => {
  const [caption, setCaption] = useState("");
  const [blocks, setBlocks] = useState([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const imgInputRefs = useRef([]);

  const { data: authUser } = useQuery({ queryKey: ["authUser"] });
  const queryClient = useQueryClient();

  const { mutate: createPost, isPending, isError, error } = useMutation({
    mutationFn: async ({ text, blocks }) => {
      const blocksToSend = blocks.map((block) => {
        if (block.type === "image") {
          return { type: "image", imageData: block.imageData };
        } else if (block.type === "code") {
          return { type: "code", codeSnippet: block.codeSnippet, language: block.language };
        }
        return block;
      });
      const res = await fetch(`${API_BASE_URL}/api/posts/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, blocks: blocksToSend }),
        credentials: 'include'
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      return data;
    },
    onSuccess: () => {
      setCaption("");
      setBlocks([]);
      setIsExpanded(false);
      toast.success("Post created successfully");
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  const handleAddBlock = (type) => {
    setBlocks((prev) => [...prev, type === "code" ? { ...emptyCodeBlock } : { ...emptyImageBlock }]);
    setIsExpanded(true);
  };

  const handleRemoveBlock = (idx) => {
    setBlocks((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleMoveBlock = (idx, dir) => {
    setBlocks((prev) => {
      const arr = [...prev];
      const newIdx = dir === "up" ? idx - 1 : idx + 1;
      if (newIdx < 0 || newIdx >= arr.length) return arr;
      [arr[idx], arr[newIdx]] = [arr[newIdx], arr[idx]];
      return arr;
    });
  };

  const handleCodeChange = (idx, field, value) => {
    setBlocks((prev) => prev.map((b, i) => i === idx ? { ...b, [field]: value } : b));
  };

  const handleImageChange = (idx, e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setBlocks((prev) => prev.map((b, i) => i === idx ? { ...b, imageData: reader.result, preview: reader.result } : b));
    };
    reader.readAsDataURL(file);
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    toast.success("Code copied to clipboard!");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!blocks.length && !caption.trim()) return;
    if (blocks.some(b => b.type === "code" && !b.codeSnippet.trim())) {
      toast.error("Code block cannot be empty");
      return;
    }
    if (blocks.some(b => b.type === "image" && !b.imageData)) {
      toast.error("Please select an image for each image block");
      return;
    }
    createPost({ text: caption, blocks });
  };

  return (
    <div className="bg-black rounded-xl shadow-lg p-4 mb-6 transition-all duration-300 hover:shadow-xl">
      <form onSubmit={handleSubmit}>
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-[#FF5722] p-0.5">
            <img
              src={authUser?.profileImg || "/avatar-placeholder.png"}
              alt="Profile"
              className="w-full h-full object-cover rounded-full"
            />
          </div>
          <div className="w-full">
            {/* Caption Field */}
            <textarea
              className="w-full p-3 text-gray-800 dark:text-gray-200 bg-transparent resize-none focus:outline-none border border-gray-200 dark:border-gray-700 rounded mb-3"
              placeholder="What's on your mind? (Add a caption...)"
              rows={isExpanded ? 2 : 1}
              value={caption}
              onChange={e => setCaption(e.target.value)}
              onFocus={() => setIsExpanded(true)}
            />
            {/* Add Block Buttons */}
            <div className="flex gap-2 mb-3">
              <button type="button" onClick={() => handleAddBlock("code")}
                className="px-3 py-1 rounded-full text-sm font-medium transition-all bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600">
                + Code
              </button>
              <button type="button" onClick={() => handleAddBlock("image")}
                className="px-3 py-1 rounded-full text-sm font-medium transition-all bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600">
                + Image
              </button>
            </div>
            {/* Blocks List */}
            <div className="flex flex-col gap-4">
              {blocks.map((block, idx) => (
                <div key={idx} className="relative border border-gray-200 dark:border-gray-700 rounded-lg p-3 bg-gray-50 dark:bg-gray-800">
                  {/* Move/Remove Controls */}
                  <div className="absolute top-2 right-2 flex gap-1">
                    <button type="button" onClick={() => handleMoveBlock(idx, "up")}
                      disabled={idx === 0}
                      className="p-1 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-40">
                      <IoChevronUp />
                    </button>
                    <button type="button" onClick={() => handleMoveBlock(idx, "down")}
                      disabled={idx === blocks.length - 1}
                      className="p-1 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-40">
                      <IoChevronDown />
                    </button>
                    <button type="button" onClick={() => handleRemoveBlock(idx)}
                      className="p-1 rounded-full bg-red-500 text-white hover:bg-red-600">
                      <IoCloseCircle />
                    </button>
                  </div>
                  {/* Code Block */}
                  {block.type === "code" && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <select
                          value={block.language}
                          onChange={e => handleCodeChange(idx, "language", e.target.value)}
                          className="px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-sm"
                        >
                          {languages.map((lang) => (
                            <option key={lang} value={lang}>{lang.charAt(0).toUpperCase() + lang.slice(1)}</option>
                          ))}
                        </select>
                        <button type="button" onClick={() => handleCopyCode(block.codeSnippet)}
                          className="flex items-center gap-1 px-2 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-all text-sm">
                          <FaCopy className="w-3 h-3" /> Copy
                        </button>
                      </div>
                      <textarea
                        className="w-full p-3 text-gray-800 dark:text-gray-200 bg-transparent resize-none focus:outline-none border border-gray-300 dark:border-gray-600 rounded"
                        placeholder="Enter your code here..."
                        rows={6}
                        value={block.codeSnippet}
                        onChange={e => handleCodeChange(idx, "codeSnippet", e.target.value)}
                      />
                      {block.codeSnippet && (
                        <div className="mt-3 rounded overflow-hidden">
                          <SyntaxHighlighter
                            language={block.language}
                            style={tomorrow}
                            customStyle={{ margin: 0, borderRadius: "0.5rem", fontSize: "0.875rem" }}
                          >
                            {block.codeSnippet}
                          </SyntaxHighlighter>
                        </div>
                      )}
                    </div>
                  )}
                  {/* Image Block */}
                  {block.type === "image" && (
                    <div className="flex flex-col items-center">
                      {!block.preview && (
                        <button
                          type="button"
                          className="flex flex-col items-center justify-center border-2 border-dashed border-indigo-400 rounded-lg p-8 text-indigo-500 hover:bg-indigo-50 dark:hover:bg-gray-800 transition-all focus:outline-none"
                          onClick={() => imgInputRefs.current[idx].click()}
                        >
                          <IoImageOutline className="w-10 h-10 mb-2" />
                          <span className="font-semibold">Select Image</span>
                          <span className="text-xs text-gray-400 mt-1">(JPG, PNG, GIF, etc.)</span>
                        </button>
                      )}
                      {block.preview && (
                        <div className="relative w-full flex flex-col items-center">
                          <img
                            src={block.preview}
                            className="max-h-64 w-auto object-contain rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
                            alt="Preview"
                          />
                          <button
                            type="button"
                            className="absolute top-2 right-2 bg-gray-800 bg-opacity-70 rounded-full p-1 text-white hover:bg-opacity-100 transition-all"
                            onClick={() => handleCodeChange(idx, "preview", null)}
                          >
                            <IoCloseCircle className="w-5 h-5" />
                          </button>
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        hidden
                        ref={el => imgInputRefs.current[idx] = el}
                        onChange={e => handleImageChange(idx, e)}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
            {/* Submit Button */}
            {(blocks.length > 0 || caption.trim().length > 0) && (
              <div className="flex justify-end mt-4">
                <button
                  type="submit"
                  disabled={isPending || (!caption.trim() && blocks.length === 0)}
                  className={`px-4 py-2 rounded-full flex items-center gap-2 font-medium transition-all ${
                    isPending || (!caption.trim() && blocks.length === 0)
                      ? "bg-orange-200 text-gray-100 cursor-not-allowed"
                      : "bg-[#FF5722] hover:bg-[#FF8A65] text-white border-0"
                  }`}
                >
                  {isPending ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      <span>Posting...</span>
                    </>
                  ) : (
                    <>
                      <span>Console</span>
                      <BiSend className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            )}
            {isError && (
              <div className="mt-2 text-red-500 text-sm">{error.message}</div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreatePost;