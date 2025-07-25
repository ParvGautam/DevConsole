import { Link } from "react-router-dom";
import { useState } from "react";
import { MdOutlineMail } from "react-icons/md";
import { FaUser } from "react-icons/fa";
import { MdPassword, MdDriveFileRenameOutline } from "react-icons/md";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import AnimatedLogo from "../components/AnimatedLogo";
import { API_BASE_URL } from "../../../config/api";

const passwordRequirements = [
	"At least 8 characters",
	"At least 1 lowercase letter",
	"At least 1 uppercase letter",
	"At least 1 number",
	"At least 1 symbol (!@#$%^&*)",
];

const SignUpPage = () => {
	const [formData, setFormData] = useState({
		email: "",
		username: "",
		fullName: "",
		password: "",
	});
	const queryClient = useQueryClient();
	const { mutate, isError, isPending, error } = useMutation({
		mutationFn: async ({ email, username, fullName, password }) => {
			const res = await fetch(`${API_BASE_URL}/api/auth/signup`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email, username, fullName, password }),
			});
			const data = await res.json();
			if (!res.ok) throw new Error(data.error || "Failed to create account");
			return data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["authUser"] });
		},
	});
	const handleSubmit = (e) => {
		e.preventDefault();
		mutate(formData);
	};
	const handleInputChange = (e) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};
	return (
		<div className="min-h-screen flex bg-black">
			{/* Left: Animated Logo */}
			<div className="flex-1 flex items-center justify-center">
				<AnimatedLogo />
			</div>
			{/* Right: Signup Form */}
			<div className="flex-1 flex items-center justify-center">
				<div className="w-full max-w-lg flex flex-col items-center gap-8">
					<h1 className="text-4xl font-extrabold text-white mb-2">Create Account</h1>
					<form className="w-full flex flex-col gap-4" onSubmit={handleSubmit}>
						<label className="flex items-center gap-2 bg-[#181A20] text-white rounded-lg px-4 py-3 border border-[#23272F]">
							<MdOutlineMail />
							<input
								type="email"
								className="grow bg-transparent focus:outline-none text-white"
								placeholder="Email"
								name="email"
								onChange={handleInputChange}
								value={formData.email}
							/>
						</label>
						<div className="flex gap-4 flex-wrap">
							<label className="flex items-center gap-2 flex-1 bg-[#181A20] text-white rounded-lg px-4 py-3 border border-[#23272F]">
								<FaUser />
								<input
									type="text"
									className="grow bg-transparent focus:outline-none text-white"
									placeholder="Username"
									name="username"
									onChange={handleInputChange}
									value={formData.username}
								/>
							</label>
							<label className="flex items-center gap-2 flex-1 bg-[#181A20] text-white rounded-lg px-4 py-3 border border-[#23272F]">
								<MdDriveFileRenameOutline />
								<input
									type="text"
									className="grow bg-transparent focus:outline-none text-white"
									placeholder="Full Name"
									name="fullName"
									onChange={handleInputChange}
									value={formData.fullName}
								/>
							</label>
						</div>
						<div className="relative flex items-center gap-2">
							<label className="flex items-center gap-2 grow bg-[#181A20] text-white rounded-lg px-4 py-3 border border-[#23272F]">
								<MdPassword />
								<input
									type="password"
									className="grow bg-transparent focus:outline-none text-white"
									placeholder="Password"
									name="password"
									onChange={handleInputChange}
									value={formData.password}
								/>
							</label>
							<div className="relative group">
								<span className="flex items-center justify-center w-6 h-6 text-xs font-bold bg-gray-300 text-black rounded-full cursor-pointer">i</span>
								<div className="absolute hidden group-hover:flex flex-col w-72 bg-gray-700 text-white text-xs rounded-lg p-4 shadow-lg -right-2 top-8">
									<h3 className="font-bold mb-2">Password Requirements:</h3>
									<ul className="space-y-1">
										{passwordRequirements.map((req, idx) => (
											<li key={idx}>- {req}</li>
										))}
									</ul>
								</div>
							</div>
						</div>
						<button className="w-full py-3 rounded-full bg-[#FF5722] hover:bg-[#FF8A65] text-white font-bold text-lg transition">{isPending ? "Loading..." : "Sign up"}</button>
						<button
							type="button"
							className="w-full py-3 rounded-full bg-[#23272F] border border-[#FF5722] text-[#FF5722] hover:bg-[#FF8A65] hover:text-white font-bold text-lg transition"
							onClick={() => {
								// Redirect to login and auto-login as guest
								window.localStorage.setItem('autoGuestLogin', '1');
								window.location.href = '/login';
							}}
						>
							Login as Guest (Interviewer)
						</button>
						{isError && <p className="text-red-500">{error.message}</p>}
					</form>
					<div className="flex flex-col gap-2 w-full">
						<p className="text-white text-center text-lg">Already have an account?</p>
						<Link to="/login" className="w-full">
							<button className="w-full py-3 rounded-full border border-[#FF5722] text-[#FF5722] hover:bg-[#181A20] hover:text-white font-bold text-lg transition">Sign in</button>
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
};
export default SignUpPage;
