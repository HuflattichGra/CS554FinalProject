import React from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import reactLogo from '../../assets/react.svg'
import "./Navbar.css";
import axios from "axios";

import { useContext } from "react";
import userContext from "../../context/userContext";


// Navbar items type
interface NavItemType {
  label: string;
  href: string;
  icon?: React.ReactNode;
}


const navItems: NavItemType[] = [
  { label: "Home", href: "/" },
  { label: "Page1", href: "/" },
  { label: "Page2", href: "/" },
];

// Navbar item
const NavItem: React.FC<{ item: NavItemType }> = ({ item }) => (
  <NavLink
    to={item.href}
    className={({ isActive }) =>
      `nav-item ${isActive ? "nav-item-active" : ""}`
    }
  >
    {item.label}
  </NavLink>
);

// Navbar 
const Navbar: React.FC = () => {
  const { user, setUser } = useContext(userContext);
  const navigate = useNavigate();

  const logout = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {        
      // for local testing
      const response = await axios.get('http://localhost:3000/logout',{withCredentials: true});
      console.log('logout Success:', response.data);

      setUser(null);
      navigate('/auth');
    } catch (error: any) {
      console.error(error.response?.data?.error || error.message);
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="left-section">
          {/* Logo */}
          <img src={reactLogo} alt="React Logo" className="logo" />
          <div className="nav-items">
            {navItems.map((item, index) => (
              <NavItem key={index} item={item} />
            ))}
          </div>
        </div>


        <div className="right-section">
          <input type="text" placeholder="Search..." className="search-input" />
          
          {user ? (
            <div className="auth-buttons">
              <button className="logout-button" onClick={logout}>Logout</button>
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/auth">Sign In / Sign Up</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
