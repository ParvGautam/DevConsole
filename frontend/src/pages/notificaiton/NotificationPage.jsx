import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

import LoadingSpinner from "../../components/common/LoadingSpinner";
import { API_BASE_URL } from "../../config/api";

import { IoSettingsOutline } from "react-icons/io5";
import { FaUser } from "react-icons/fa";
import { FaHeart } from "react-icons/fa6";

const NotificationPage = () => {
	const queryClient = useQueryClient();
	const { data: notifications, isLoading } = useQuery({
		queryKey: ["notifications"],
		queryFn: async () => {
			try {
				const res = await fetch(`${API_BASE_URL}/api/notifications`);
				const data = await res.json();
				if (!res.ok) throw new Error(data.error || "Something went wrong");
				return data;
			} catch (error) {
				throw new Error(error);
			}
		},
	});

	const { mutate: deleteNotifications } = useMutation({
		mutationFn: async () => {
			try {
				const res = await fetch(`${API_BASE_URL}/api/notifications`, {
					method: "DELETE",
				});
				const data = await res.json();

				if (!res.ok) throw new Error(data.error || "Something went wrong");
				return data;
			} catch (error) {
				throw new Error(error);
			}
		},
		onSuccess: () => {
			toast.success("Notifications deleted successfully");
			queryClient.invalidateQueries({ queryKey: ["notifications"] });
		},
		onError: (error) => {
			toast.error("Something Went Wrong");
			console.error(error.message);
		},
	});

	return (
		<div className="flex-[4_4_0] min-h-screen bg-black">
			{/* Sticky Header */}
			<div className="sticky top-0 z-10 bg-black flex justify-between items-center p-6 border-b border-gray-700">
				<p className="font-bold text-2xl text-white">Notifications</p>
				<div className="dropdown dropdown-end">
					<div tabIndex={0} role='button' className='m-1 p-2 rounded-full hover:bg-[#23272F] transition'>
						<IoSettingsOutline className='w-6 h-6 text-gray-400' />
					</div>
					<ul
						tabIndex={0}
						className='dropdown-content z-[1] menu p-2 shadow-lg bg-[#23272F] rounded-xl w-56 border border-gray-700'
					>
						<li>
							<a onClick={deleteNotifications} className="text-red-500 font-semibold cursor-pointer">Delete all notifications</a>
						</li>
					</ul>
				</div>
			</div>
			{isLoading && (
				<div className='flex justify-center h-full items-center py-16'>
					<LoadingSpinner size='lg' />
				</div>
			)}
			{notifications?.length === 0 && <div className='text-center p-8 font-bold text-gray-400 text-lg'>No notifications 🤔</div>}
			<div className="flex flex-col gap-4 p-4">
			{notifications?.map((notification) => (
				<div className='bg-[#23272F] rounded-xl shadow border border-gray-800 p-4 flex items-center gap-4' key={notification._id}>
					{/* Icon */}
					{notification.type === "follow" && <FaUser className='w-7 h-7 text-[#FF5722]' />}
					{notification.type === "like" && <FaHeart className='w-7 h-7 text-[#FF0060]' />}
					{/* Avatar */}
					<Link to={`/profile/${notification.from.username}`}> 
						<img src={notification.from.profileImg || "/avatar-placeholder.png"} className="w-10 h-10 rounded-full object-cover border-2 border-[#FF5722]" alt={notification.from.username} />
					</Link>
					{/* Info */}
					<div className='flex flex-col'>
						<Link to={`/profile/${notification.from.username}`} className="flex items-center gap-2">
							<span className='font-bold text-white'>@{notification.from.username}</span>
							<span className='text-gray-400 text-sm'>
								{notification.type === "follow" ? "followed you" : "liked your post"}
							</span>
						</Link>
					</div>
				</div>
			))}
			</div>
		</div>
	);
};
export default NotificationPage;
