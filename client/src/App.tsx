import { Routes, Route, useLocation } from "react-router-dom";
import './App.css'

import Navbar from './components/Navbar/Navbar';
import Home from './components/Home/Home';
function App() {
  const location = useLocation();

  const hideNavRoutes = ["/login", "/register"];
  const shouldHideNav = hideNavRoutes.includes(location.pathname);

  return (
    <>
      <header>
        {!shouldHideNav && <Navbar />}
      </header>
      <div className="App">
          <Routes>
              <Route path="/" element={<Home />} />
          </Routes>
      </div>
    </>
  )
}

export default App
