import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { FaPlusCircle, FaUser, FaAngleDown } from "react-icons/fa"; // Ajout de l'icône de flèche
import "./Header.css";

const Header: React.FC<{ darkMode: boolean; toggleDarkMode: () => void; className?: string }> = ({}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      const heroSectionHeight = document.querySelector(".hero-section")?.clientHeight || 0;
      setIsScrolled(window.scrollY > heroSectionHeight);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isHomePage = location.pathname === "/";

  return (
    <nav className={`nav ${isScrolled ? "scrolled" : ""} ${isHomePage ? "" : "fixed-blue"}`}>
      <div className="logo-container">
      <Link to="/">
        <img src="/src/assets/Logo.png" alt="ImmoGo Logo" className="logo" /></Link>
      </div>

      <div className="nav-links">
  <Link to="/">Accueil</Link>
  <Link to="/about">Qui sommes-nous</Link>
  <Link to="/contact">Contact</Link>

  {/* Menu déroulant pour "Bien Immobilier" */}
  <div 
    className="dropdown" 
    onMouseEnter={() => setIsDropdownOpen(true)} 
    onMouseLeave={() => setIsDropdownOpen(false)}
  >
    <Link to="/bienimmoblier" className="dropdown-link">
      Bien Immobilier <FaAngleDown />
    </Link>
    {isDropdownOpen && (
      <div className="dropdown-menu">
        <Link className="liste" to="/bienimmoblier/villa">Villa</Link>
        <Link className="liste" to="/bienimmoblier/maison">Maison</Link>
        <Link className="liste" to="/bienimmoblier/terrain">Terrain</Link>
        <Link className="liste" to="/bienimmoblier/appartement">Appartement</Link>
      </div>
    )}
  </div>
</div>

      <div className="nav-buttons">
        <Link to="/loginvendeur" className="nav-button publish-button">
          <FaPlusCircle className="button-icon-publier" /> Publier une annonce
        </Link>
        <Link to="/login" className="nav-button login-button">
          <FaUser className="button-icon" /> Se connecter
        </Link>
      </div>
    </nav>
  );
};

export default Header;