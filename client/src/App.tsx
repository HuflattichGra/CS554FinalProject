import { Routes, Route, useLocation } from "react-router-dom";
import './App.css'
import { useState } from "react";

import Navbar from './components/Navbar/Navbar';
import Home from './components/Home/Home';
import AuthPage from "./components/Auth/AuthPage";
import userContext from "./context/userContext";
import { User } from './context/userContext';


function App() {
  const location = useLocation();

  const hideNavRoutes = ["/login", "/register"];
  const shouldHideNav = hideNavRoutes.includes(location.pathname);

  const [user, setUser] = useState<User | null>(null);

  return (
    <>
      <userContext.Provider value={{user, setUser}}>
        <div className="App">
            <header>
              {!shouldHideNav && <Navbar />}
            </header>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/auth" element={<AuthPage />} />
            </Routes>
        </div>
      </userContext.Provider>
    </>
  )
}

export default App
