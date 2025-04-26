import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FaPlusCircle,
  FaUser,
  FaAngleDown,
  FaSignOutAlt,
  FaCog,
  FaHeart,
  FaMapMarkerAlt,
} from "react-icons/fa";
import axios from "axios";
import { motion } from "framer-motion";
import { useFavorites } from "././context/FavoritesContext";
import "./Header.css";

interface Image {
  url: string;
  path: string;
}

interface Property {
  id: number;
  type: "maison" | "appartement" | "villa" | "bureau" | "ferme" | "terrain" | "etage-villa";
  titre: string;
  adresse: string;
  prix: number;
  images: Image[];
}

interface UserData {
  prenom: string;
  role: string;
  id?: string;
}

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [userProfileOpen, setUserProfileOpen] = useState(false);
  const [favoritesOpen, setFavoritesOpen] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [favoriteProperties, setFavoriteProperties] = useState<Property[]>([]);
  const [loadingFavorites, setLoadingFavorites] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { favorites, toggleFavorite } = useFavorites();

  const syncAuthState = () => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    const prenom = localStorage.getItem("prenom");
    const id = localStorage.getItem("userId");

    if (token && role && prenom) {
      setUserData({ prenom, role, id: id || undefined });
    } else {
      setUserData(null);
    }
  };

  useEffect(() => {
    if (favoritesOpen && favorites.length > 0) {
      const fetchFavoriteProperties = async () => {
        try {
          setLoadingFavorites(true);
          const [
            maisonsResponse,
            appartementsResponse,
            villasResponse,
            bureauxResponse,
            fermesResponse,
            terrainsResponse,
            etageVillasResponse,
          ] = await Promise.all([
            axios.get("http://localhost:8000/api/maisons"),
            axios.get("http://localhost:8000/api/appartements"),
            axios.get("http://localhost:8000/api/villas"),
            axios.get("http://localhost:8000/api/bureaux"),
            axios.get("http://localhost:8000/api/fermes"),
            axios.get("http://localhost:8000/api/terrains"),
            axios.get("http://localhost:8000/api/etage-villas"),
          ]);

          const allProperties: Property[] = [
            ...maisonsResponse.data.map((maison: any) => ({
              id: maison.id,
              type: "maison" as const,
              titre: maison.titre,
              adresse: maison.adresse,
              prix: maison.prix,
              images: maison.images,
            })),
            ...appartementsResponse.data.map((appartement: any) => ({
              id: appartement.id,
              type: "appartement" as const,
              titre: appartement.titre,
              adresse: appartement.adresse,
              prix: appartement.prix,
              images: appartement.images,
            })),
            ...villasResponse.data.map((villa: any) => ({
              id: villa.id,
              type: "villa" as const,
              titre: villa.titre,
              adresse: villa.adresse,
              prix: villa.prix,
              images: villa.images,
            })),
            ...bureauxResponse.data.map((bureau: any) => ({
              id: bureau.id,
              type: "bureau" as const,
              titre: bureau.titre,
              adresse: bureau.adresse,
              prix: bureau.prix,
              images: bureau.images,
            })),
            ...fermesResponse.data.map((ferme: any) => ({
              id: ferme.id,
              type: "ferme" as const,
              titre: ferme.titre,
              adresse: ferme.adresse,
              prix: ferme.prix,
              images: ferme.images,
            })),
            ...terrainsResponse.data.map((terrain: any) => ({
              id: terrain.id,
              type: "terrain" as const,
              titre: terrain.titre,
              adresse: terrain.adresse,
              prix: terrain.prix,
              images: terrain.images,
            })),
            ...etageVillasResponse.data.map((etage: any) => ({
              id: etage.id,
              type: "etage-villa" as const,
              titre: etage.titre,
              adresse: etage.adresse,
              prix: etage.prix,
              images: etage.images,
            })),
          ];

          const filteredProperties = allProperties.filter((property) =>
            favorites.includes(property.id)
          );
          setFavoriteProperties(filteredProperties);
        } catch (error) {
          console.error("Error fetching favorite properties:", error);
        } finally {
          setLoadingFavorites(false);
        }
      };

      fetchFavoriteProperties();
    }
  }, [favoritesOpen, favorites]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollThreshold = 50;
      setIsScrolled(window.scrollY > scrollThreshold);
    };

    syncAuthState();
    window.addEventListener("storage", syncAuthState);
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("storage", syncAuthState);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("prenom");
    localStorage.removeItem("nom");
    localStorage.removeItem("userId");
    window.dispatchEvent(new Event("storage"));
    navigate("/");
  };

  const isHomePage = location.pathname === "/";

  return (
    <nav className={`nav ${isScrolled ? "scrolled" : ""} ${isHomePage ? "" : "fixed-blue"}`}>
      <div className="logo-container">
        <Link to="/">
          <img
            src={isScrolled || !isHomePage ? "/src/assets/hh.png" : "/src/assets/hhh.png"}
            alt="ImmoGo Logo"
            className="logo"
          />
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
          <Link to="/all-properties" className="dropdown-link">
            Bien Immobilier <FaAngleDown />
          </Link>
          {isDropdownOpen && (
            <div className="dropdown-menu">
              <Link className="liste" to="/all-properties?categorie=Villa">
                Villa
              </Link>
              <Link className="liste" to="/all-properties?categorie=Maison">
                Maison
              </Link>
              <Link className="liste" to="/all-properties?categorie=Terrain">
                Terrain
              </Link>
              <Link className="liste" to="/all-properties?categorie=Appartement">
                Appartement
              </Link>
            </div>
          )}
        </div>
      </div>

      <div className="nav-buttons">
        <div className="favorite-button-wrapper">
          <button
            className="nav-button favorite-button"
            onClick={() => setFavoritesOpen(!favoritesOpen)}
          >
            <FaHeart
              className="button-icon"
              style={{ color: isScrolled ? "#ffffff" : "#090536" }}
            />
            {favorites.length > 0 && (
              <span className="favorite-count">{favorites.length}</span>
            )}
          </button>

          {favoritesOpen && (
            <motion.div
              className="favorites-dropdown"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <div className="favorites-header">
                <h3>Mes Favoris ({favorites.length})</h3>
                <button
                  className="close-favorites"
                  onClick={() => setFavoritesOpen(false)}
                >
                  ×
                </button>
              </div>

              <div className="favorites-list">
                {loadingFavorites ? (
                  <div className="favorites-loading">Chargement...</div>
                ) : favorites.length === 0 ? (
                  <div className="no-favorites">
                    Aucune propriété favorite. Ajoutez-en depuis la page d'accueil.
                  </div>
                ) : (
                  favoriteProperties.map((property) => (
                    <div
                      key={`${property.type}-${property.id}`}
                      className="favorite-item"
                    >
                      <div className="favorite-image">
                        {property.images && property.images.length > 0 ? (
                          <img
                            src={property.images[0].url}
                            alt={property.titre}
                            onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                              const target = e.target as HTMLImageElement;
                              target.onerror = null;
                              target.src = "/placeholder-image.jpg";
                            }}
                          />
                        ) : (
                          <div className="no-image">Pas d'image</div>
                        )}
                      </div>
                      <div className="favorite-details">
                        <h4>{property.titre}</h4>
                        <p className="favorite-address">
                          <FaMapMarkerAlt /> {property.adresse}
                        </p>
                        <p className="favorite-price">
                          {property.prix.toLocaleString()} TND
                        </p>
                        <Link
                          to={`/${property.type}/${property.id}`}
                          className="favorite-view-details"
                          onClick={() => setFavoritesOpen(false)}
                        >
                          Voir les détails
                        </Link>
                      </div>
                      <button
                        className={`favorite-toggle ${
                          favorites.includes(property.id) ? "active" : ""
                        }`}
                        onClick={() => toggleFavorite(property.id, property.type)}
                      >
                        <FaHeart />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </div>

        {userData ? (
          <div
            className="user-profile-wrapper"
            onMouseEnter={() => setUserProfileOpen(true)}
            onMouseLeave={() => setUserProfileOpen(false)}
          >
            <div className={`user-profile ${userData.role === "vendeur" ? "seller" : "client"}`}>
              <span className="user-greeting">
                <FaUser className="button-icon" /> {userData.prenom}
              </span>

              {userProfileOpen && (
                <div className="user-dropdown">
                  <Link
                    to={userData.role === "vendeur" ? "/profil-vendeur" : "/profil-client"}
                    className="dropdown-item"
                  >
                    <FaUser className="dropdown-icon" /> Mon Profil
                  </Link>

                  {userData.role === "vendeur" && (
                    <Link to="/vendeur-dashboard" className="dropdown-item">
                      <FaCog className="dropdown-icon" /> Tableau de bord
                    </Link>
                  )}

                  <div className="dropdown-divider"></div>

                  <button onClick={handleLogout} className="dropdown-item logout-item">
                    <FaSignOutAlt className="dropdown-icon" /> Déconnexion
                  </button>
                </div>
              )}
            </div>
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