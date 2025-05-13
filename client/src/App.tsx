import { Routes, Route, useLocation } from "react-router-dom";
import './App.css'
import { useState, useEffect } from "react";
import axios from "axios";

import Navbar from './components/Navbar/Navbar';
import Home from './components/Home/Home';
import AuthPage from "./components/Auth/AuthPage";
import userContext from "./context/userContext";
import { User } from './context/userContext';
import GuestOnly from "./components/GuestOnly";
import PostList from "./components/Posts/PostList";
import ConventionsPage from "./pages/ConventionsPage";
import ConventionDetailPage from "./pages/ConventionDetailPage";
import Profile from './components/Profile/Profile';
import DetailPostView from "./components/Posts/DetailPostView";
import AddFundsPage from "./components/Payment/AddFundsPage";
import { API_BASE } from './api';

function App() {
  const location = useLocation();

  const hideNavRoutes = ["/login", "/register"];
  const shouldHideNav = hideNavRoutes.includes(location.pathname);

  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(`${API_BASE}/checkSession`, {
          withCredentials: true
        });
        if (response.data && Object.keys(response.data).length > 0) {
          setUser(response.data);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.log('Not logged in');
        setUser(null);
      }
    };

    fetchUser();
  }, []);

  return (
    <>
      <userContext.Provider value={{user, setUser}}>
        <div className="App">
            <header>
              {!shouldHideNav && <Navbar />}
            </header>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/auth" element={<GuestOnly><AuthPage /></GuestOnly>} />
                <Route path="/posts" element={<PostList />} />
                <Route path="/posts/:id" element={<DetailPostView />} />
                <Route path="/conventions" element={<ConventionsPage />} />
                <Route path="/conventions/:id" element={<ConventionDetailPage />} />
                <Route path="/user/:id" element={<Profile/>} />
                <Route path="/add-funds" element={<AddFundsPage />} />
            </Routes>
        </div>
      </userContext.Provider>
    </>
  )
}

export default App
