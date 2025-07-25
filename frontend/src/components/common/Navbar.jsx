import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { BiLogOut } from "react-icons/bi";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { API_BASE_URL } from "../../config/api";

const Navbar = () => {
  const queryClient = useQueryClient();
  const { data: authUser } = useQuery({ queryKey: ["authUser"] });

  const { mutate: logout } = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${API_BASE_URL}/api/auth/logout`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["authUser"] }),
  });

  return (
    <nav className="w-full h-16 bg-black flex items-center px-8 shadow z-50 sticky top-0 left-0 border-b border-[#23272F]">
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2 mr-8">
        <img src="/Logo.svg" alt="Logo" className="w-8 h-8" />
        <span className="font-bold text-xl tracking-wide hidden md:block uppercase font-mono">
          <span className="text-[#FF5722]">DEV</span>
          <span className="text-[#00FFDD]">CON</span>
          <span className="text-[#E8FFC2]">SOLE</span>
        </span>
      </Link>
      {/* User Avatar & Logout */}
      <div className="flex items-center gap-4 ml-auto">
        {authUser && (
          <>
            <img
              src={authUser.profileImg || "/avatar-placeholder.png"}
              alt={authUser.username}
              className="w-9 h-9 rounded-full object-cover border border-gray-700"
            />
            <button
              onClick={logout}
              className="p-2 rounded-full hover:bg-[#181C23] text-gray-400 hover:text-[#FF1E1E] transition"
              title="Logout"
            >
              <BiLogOut className="w-6 h-6" />
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar; 