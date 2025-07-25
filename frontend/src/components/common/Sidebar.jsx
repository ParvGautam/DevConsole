import { MdHomeFilled } from "react-icons/md";
import { IoNotifications } from "react-icons/io5";
import { FaUser } from "react-icons/fa";
import { BiLogOut } from "react-icons/bi";
import { AiOutlineSearch } from "react-icons/ai";
import { Link, useLocation } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { API_BASE_URL } from "../../config/api";
// import XSvg from "../svgs/X";

const Sidebar = () => {
    const queryClient = useQueryClient();
    const location = useLocation();
    
    const { mutate: logout } = useMutation({
        mutationFn: async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/api/auth/logout`, { method: "POST", credentials: 'include' });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || "Something went wrong");
            } catch (error) {
                throw new Error(error.message);
            }
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["authUser"] }),
        onError: () => toast.error("Logout Failed"),
    });

    const { data: authUser } = useQuery({ queryKey: ["authUser"] });
    
    const menuItems = [
        { name: "Home", path: "/", icon: <MdHomeFilled className="w-6 h-6" />, color: "#FF5722" },
        { name: "Messages", path: "/notifications", icon: <IoNotifications className="w-6 h-6" />, color: "#FF5722" },
        { name: "Profile", path: `/profile/${authUser?.username}`, icon: <FaUser className="w-6 h-6" />, color: "#FF5722" },
        { name: "Search", path: "/search", icon: <AiOutlineSearch className="w-6 h-6" />, color: "#FF5722" },
    ];

    return (
        <div className="w-64 h-full bg-black flex flex-col pt-0 sticky top-16 left-0 z-10 font-sans border-r border-[#23272F]">
            <nav className="flex flex-col gap-2 mt-8 px-4">
                {menuItems.map(({ name, path, icon, color }) => (
                    <Link
                        key={name}
                        to={path}
                        className={`flex items-center gap-4 px-4 py-3 rounded-lg text-lg font-medium transition-all duration-150
                            ${location.pathname === path ? `text-white shadow` : "text-gray-300 hover:bg-[#181C23] hover:text-white"}`}
                        style={location.pathname === path ? { backgroundColor: color } : {}}
                    >
                        {icon}
                        <span>{name}</span>
                    </Link>
                ))}
            </nav>
            <div className="mt-auto flex flex-col items-center mb-8 px-4">
                <button
                    aria-label="Logout"
                    className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-gray-300 hover:bg-[#181C23] hover:text-[#FF1E1E] transition text-lg font-medium"
                    onClick={(e) => {
                        e.preventDefault();
                        logout();
                    }}
                >
                    <BiLogOut className="w-6 h-6" />
                    <span>Logout</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;