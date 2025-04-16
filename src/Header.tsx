import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaPlusCircle, FaUser, FaAngleDown, FaSignOutAlt, FaCog } from "react-icons/fa";
import "./Header.css";

interface UserData {
  prenom: string;
  role: string;
  id?: string;
}

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [userProfileOpen, setUserProfileOpen] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Synchronise l'état avec le localStorage
  const syncAuthState = () => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const prenom = localStorage.getItem('prenom');
    const id = localStorage.getItem('userId');
    
    if (token && role && prenom) {
      setUserData({
        prenom,
        role,
        id: id || undefined
      });
    } else {
      setUserData(null);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const heroSectionHeight = document.querySelector(".hero-section")?.clientHeight || 0;
      setIsScrolled(window.scrollY > heroSectionHeight);
    };

    syncAuthState(); // Initial sync

    window.addEventListener('storage', syncAuthState);
    window.addEventListener("scroll", handleScroll);
    
    return () => {
      window.removeEventListener('storage', syncAuthState);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('prenom');
    localStorage.removeItem('nom');
    localStorage.removeItem('userId');
    window.dispatchEvent(new Event('storage'));
    navigate('/');
  };

  const isHomePage = location.pathname === "/";

  return (
    <nav className={`nav ${isScrolled ? "scrolled" : ""} ${isHomePage ? "" : "fixed-blue"}`}>
      <div className="logo-container">
        <Link to="/">
          <img src="/src/assets/ll.png" alt="ImmoGo Logo" className="logo" />
        </Link>
      </div>

      <div className="nav-links">
        <Link to="/">Accueil</Link>
        <Link to="/about">Qui sommes-nous</Link>
        <Link to="/contact">Contact</Link>

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
        {userData ? (
          <div 
            className="user-profile"
            onMouseEnter={() => setUserProfileOpen(true)}
            onMouseLeave={() => setUserProfileOpen(false)}
          >
            <span className="user-greeting">
              <FaUser className="button-icon" /> {userData.prenom}
            </span>
            
            {userProfileOpen && (
              <div className="user-dropdown">
                {/* Lien vers le profil adapté au rôle */}
                <Link 
                  to={userData.role === 'vendeur' ? '/profil-vendeur' : '/profil-client'} 
                  className="dropdown-item"
                >
                  <FaUser className="dropdown-icon" /> Mon Profil
                </Link>
                
                {userData.role === 'vendeur' && (
                  <>
                    <Link to="/vendeur-dashboard" className="dropdown-item">
                      <FaCog className="dropdown-icon" /> Tableau de bord
                    </Link>
                
                  </>
                )}
                
                <div className="dropdown-divider"></div>
                
                <button onClick={handleLogout} className="dropdown-item logout-item">
                  <FaSignOutAlt className="dropdown-icon" /> Déconnexion
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            <Link to="/loginvendeur" className="nav-button publish-button">
              <FaPlusCircle className="button-icon-publier" /> Publier une annonce
            </Link>
            <Link to="/login" className="nav-button login-button">
              <FaUser className="button-icon" /> Se connecter
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Header;