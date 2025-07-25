import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { MdOutlineMail, MdPassword } from "react-icons/md";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import AnimatedLogo from "../components/AnimatedLogo";
import { API_BASE_URL } from "../../../config/api";

const LoginPage = () => {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const queryClient = useQueryClient();
  const { mutate: loginMutatioan, isPending, isError, error } = useMutation({
    mutationFn: async ({ username, password }) => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
          credentials: 'include'
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to login");
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    }
  });

  useEffect(() => {
    if (window.localStorage.getItem('autoGuestLogin')) {
      window.localStorage.removeItem('autoGuestLogin');
      loginMutatioan({ username: 'guest_interviewer', password: 'guest1234' });
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    loginMutatioan(formData);
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
      {/* Right: Login Form */}
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-md flex flex-col items-center gap-8">
          <h1 className="text-4xl font-extrabold text-white mb-2">Welcome Back</h1>
          <form className="w-full flex flex-col gap-4" onSubmit={handleSubmit}>
            <label className="flex items-center gap-2 bg-[#181A20] text-white rounded-lg px-4 py-3 border border-[#23272F]">
              <MdOutlineMail />
              <input
                type='text'
                className='grow bg-transparent focus:outline-none text-white'
                placeholder='Username'
                name='username'
                onChange={handleInputChange}
                value={formData.username}
              />
            </label>
            <label className="flex items-center gap-2 bg-[#181A20] text-white rounded-lg px-4 py-3 border border-[#23272F]">
              <MdPassword />
              <input
                type='password'
                className='grow bg-transparent focus:outline-none text-white'
                placeholder='Password'
                name='password'
                onChange={handleInputChange}
                value={formData.password}
              />
            </label>
            <button className='w-full py-3 rounded-full bg-[#FF5722] hover:bg-[#FF8A65] text-white font-bold text-lg transition'>{isPending ? "Loading..." : "Login"}</button>
            <button
              type="button"
              className="w-full py-3 rounded-full bg-[#23272F] border border-[#FF5722] text-[#FF5722] hover:bg-[#FF8A65] hover:text-white font-bold text-lg transition"
              onClick={() => loginMutatioan({ username: 'guest_interviewer', password: 'guest1234' })}
              disabled={isPending}
            >
              {isPending ? "Loading..." : "Login as Guest (Interviewer)"}
            </button>
            {isError && <p className='text-red-500'>{error.message}</p>}
          </form>
          <div className='flex flex-col gap-2 w-full'>
            <p className='text-white text-center text-lg'>Don't have an account?</p>
            <Link to='/signup' className='w-full'>
              <button className='w-full py-3 rounded-full border border-[#FF5722] text-[#FF5722] hover:bg-[#181A20] hover:text-white font-bold text-lg transition'>Sign up</button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
export default LoginPage;