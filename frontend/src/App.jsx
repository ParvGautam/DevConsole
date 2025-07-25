import { Navigate, Route, Routes, useLocation } from "react-router-dom"
import HomePage from "./pages/home/HomePage"
import SignUpPage from "./pages/auth/signup/SignUpPage"
import LoginPage from "./pages/auth/login/LoginPage"
import Sidebar from "./components/common/Sidebar"
import NotificationPage from "./pages/notificaiton/NotificationPage"
import ProfilePage from "./pages/profile/ProfilePage"
import { Toaster } from "react-hot-toast"
import { useQuery } from "@tanstack/react-query"
import LoadingSpinner from "./components/common/LoadingSpinner"
import FollowPage from "./pages/home/FollowPage"
import FollowersFollowing from "./pages/profile/FollowersFollowing"
import SearchPage from "./pages/Search/SearchPage"
import Navbar from "./components/common/Navbar";
import { API_BASE_URL } from "./config/api";

function App() {
  const { pathname } = useLocation();
  const {data:authUser, isLoading}=useQuery({
    queryKey:['authUser'],
      queryFn: async()=>{
        try{
          const res= await fetch(`${API_BASE_URL}/api/auth/me`, { credentials: 'include' });
          const data= await res.json();
          if(data.error) return null;
          if(!res.ok) {
            throw new Error(data.error || "Something went wrong")
          }
          return data;
        }
        catch(error){
          throw new Error(error)
        }
      },
      retry: false,
  });

  if(isLoading){
     return (
     <div className="h-screen flex justify-center items-center">
      <LoadingSpinner size='lg'/>
     </div>
    )
  }
  
  return (
    <div className="flex flex-col w-full bg-black min-h-screen">
      {authUser && <Navbar />}
      <div className="flex flex-1 w-full">
        {authUser && <Sidebar />}
        <div className="flex-1">
          <Routes>
            <Route path='/' element={authUser ? <HomePage /> : <Navigate to="/login" />} />
            <Route path='/login' element={!authUser ? <LoginPage /> : <Navigate to="/" />} />
            <Route path='/signup' element={!authUser ? <SignUpPage />: <Navigate to="/" />} />
            <Route path='/notifications' element={authUser ? <NotificationPage /> : <Navigate to="/login" />} />
            <Route path='/profile/:username' element={authUser ? <ProfilePage />: <Navigate to="/login" />} />
            <Route path='/followPage' element={authUser ? <FollowPage /> : <Navigate to="/login" />} />
            <Route path="/followFollowing/:username/:type" element={authUser ? <FollowersFollowing /> : <Navigate to="/login" />} />
            <Route path="/search" element={authUser ? <SearchPage /> : <Navigate to="/login" />} />
          </Routes>
        </div>
      </div>
      <Toaster />
    </div>
  )
}

export default App

