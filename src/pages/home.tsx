import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import {
  FaArrowUp,
  FaFacebook,
  FaInstagram,
  FaLinkedin,
  FaBuilding,
  FaCity,
  FaMapMarkerAlt,
  FaSearch,
  FaHome,
  FaHandshake,
  FaKey,
  FaHouseUser,
  FaStore,
  FaFilter,
  FaRedoAlt,
  FaChevronLeft,
  FaChevronRight,
  FaBoxes,
  FaTrashAlt,
  FaSearchPlus,
  FaSearchDollar,
  FaBars,
  FaTag
} from "react-icons/fa";
import "./home.css";
import Header from "../Header";
import Footer from "../Footer";
import { HiOfficeBuilding } from "react-icons/hi";

interface Ville {
  id: number;
  nom: string;
}

interface Delegation {
  id: number;
  nom: string;
  ville_id: number;
}

interface Categorie {
  id: number;
  nom: string;
}

interface Type {
  id: number;
  nom: string;
}

const Home: React.FC = () => {
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [, setNavVisible] = useState(true);
  const [darkMode] = useState(false);
  const [, setDropdownOpen] = useState(false);
  const [villes, setVilles] = useState<Ville[]>([]);
  const [delegations, setDelegations] = useState<Delegation[]>([]);
  const [categories, setCategories] = useState<Categorie[]>([]);
  const [types, setTypes] = useState<Type[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const propertyListRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const scrollToCard = (index: number) => {
    if (propertyListRef.current) {
      const cardWidth = 220; // Largeur de carte + marge
      propertyListRef.current.scrollTo({
        left: index * cardWidth,
        behavior: 'smooth'
      });
      setCurrentIndex(index);
    }
  };

  const handleNext = () => {
    const nextIndex = Math.min(currentIndex + 1, 4); // 5 éléments (0-4)
    scrollToCard(nextIndex);
  };

  const handlePrev = () => {
    const prevIndex = Math.max(currentIndex - 1, 0);
    scrollToCard(prevIndex);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!(event.target as HTMLElement).closest(".dropdown")) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const heroSectionHeight =
        document.querySelector(".hero-section")?.clientHeight || 0;
      if (window.scrollY > heroSectionHeight) {
        setNavVisible(false);
        setShowBackToTop(true);
      } else {
        setNavVisible(true);
        setShowBackToTop(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    axios
      .get<Ville[]>("http://localhost:8000/api/villes")
      .then((response) => {
        setVilles(response.data);
      })
      .catch((error) => console.error("Erreur lors de la récupération des villes :", error));
  }, []);

  useEffect(() => {
    axios
      .get<Categorie[]>("http://localhost:8000/api/categories")
      .then((response) => {
        setCategories(response.data);
      })
      .catch((error) => console.error("Erreur lors de la récupération des catégories :", error));
  }, []);

  useEffect(() => {
    axios
      .get<Type[]>("http://localhost:8000/api/types")
      .then((response) => {
        setTypes(response.data);
      })
      .catch((error) => console.error("Erreur lors de la récupération des types :", error));
  }, []);

  const fetchDelegations = async (villeId: number) => {
    try {
      const response = await axios.get<Delegation[]>(
        `http://localhost:8000/api/delegations/${villeId}`
      );
      setDelegations(response.data);
    } catch (error) {
      console.error("Erreur lors de la récupération des délégations :", error);
    }
  };

  return (
    <div className={darkMode ? "dark-mode" : ""}>
      <Header />

      <div className="hero-section">
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="overlay"
        >
          <h2>On Veille Attentivement Sur Votre Affaire !</h2>

          <div className="search-form-hero">
            <form className="search-form">
              <div className="form-group">
                <label htmlFor="type">
                <FaTag className="icon" /> Vente
                </label>
                <select id="type" name="type">
                  <option value="">Sélectionnez un type</option>
                  {types.map((type) => (
                    <option key={type.id} value={type.nom}>
                      {type.nom}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="type-categorie">
                  <FaCity  className="icon" /> Type Catégorie
                </label>
                <select id="type-categorie" name="type-categorie">
                  <option value="">Sélectionnez une catégorie</option>
                  {categories.map((categorie) => (
                    <option key={categorie.id} value={categorie.nom}>
                      {categorie.nom}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="ville">
                  <HiOfficeBuilding  className="icon" /> Ville
                </label>
                <select
                  id="ville"
                  name="ville"
                  onChange={(e) => fetchDelegations(Number(e.target.value))}
                >
                  <option value="">Sélectionnez une ville</option>
                  {villes.map((ville) => (
                    <option key={ville.id} value={ville.id}>
                      {ville.nom}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="delegation">
                  <FaMapMarkerAlt className="icon" /> Délégation
                </label>
                <select id="delegation" name="delegation">
                  <option value="">Sélectionnez une délégation</option>
                  {delegations.map((delegation) => (
                    <option key={delegation.id} value={delegation.nom}>
                      {delegation.nom}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-groupe">
                <button
                  type="button"
                  className="filter-button"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <FaBars      className="icon" /> 
                </button>
              </div>

              {showFilters && (
                <div className="advanced-filters">
                  <div className="filters-row">
                    <div className="form-group">
                      <label>Chambre</label>
                      <select>
                        <option>Non défini</option>
                        <option>1</option>
                        <option>2</option>
                        <option>3+</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Salle de bain</label>
                      <select>
                        <option>Non défini</option>
                        <option>1</option>
                        <option>2</option>
                        <option>3+</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Salles d'eau</label>
                      <select>
                        <option>Non défini</option>
                        <option>1</option>
                        <option>2</option>
                        <option>3+</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Prix Entre :</label>
                      <div className="filters-range">
                        <input type="number" placeholder="0" />
                        <span>Et</span>
                        <input type="number" placeholder="100000" />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Superficie Entre :</label>
                      <div className="filters-range">
                        <input type="number" placeholder="0" />
                        <span>Et</span>
                        <input type="number" placeholder="100000" />
                      </div>
                    </div>
                  </div>

                  <div className="form-group-roww">
                    <button type="submit" className="search-button">
                      <FaSearch className="icon" /> APPLIQUER LE FILTRE
                    </button>
                    <button type="reset" className="reset-button">
                      <FaRedoAlt className="icon" /> RÉINITIALISER LE FILTRE
                    </button>
                  </div>
                </div>
              )}

              <div className="form-group-row">
                <button type="submit" className="search-button">
                  <FaSearch className="icon" /> RECHERCHE
                </button>
              </div>
            </form>
          </div>

          <div className="hero-text">
            <p>Nous avons plus de 1683 appartements, maisons et terrains...</p>
          </div>
        </motion.div>

        <div className="social-iconss">
          <a
            href="https://www.facebook.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="facebook"
          >
            <FaFacebook className="social-icon" />
          </a>
          <a
            href="https://www.instagram.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="instagram"
          >
            <FaInstagram className="social-icon" />
          </a>
          <a
            href="https://linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
            className="linkedin"
          >
            <FaLinkedin className="social-icon" />
          </a>
        </div>
      </div>

      <div className="section services-section">
        <h2>Services</h2>
        <div className="services-grid">
          <div className="service-card">
            <div className="service-icon-container">
              <FaHome className="service-icon" />
            </div>
            <h3>Achat</h3>
            <p>
              Nous cherchons et dénichons pour vous le bien immobilier le plus conforme à vos besoins dans les meilleurs délais.
            </p>
          </div>

          <div className="service-card">
            <div className="service-icon-container">
              <FaHandshake className="service-icon" />
            </div>
            <h3>Vente</h3>
            <p>
              Nous nous tenons à vos côtés jusqu'à la concrétisation de l'acte de vente de votre bien immobilier.
            </p>
          </div>

          <div className="service-card">
            <div className="service-icon-container">
              <FaKey className="service-icon" />
            </div>
            <h3>Location</h3>
            <p>
              Nos agents immobiliers mettent tout en œuvre pour trouver le bon locataire ou la location qui vous convient.
            </p>
          </div>
        </div>
      </div>

      <div className="explore-section">
      <h2 className="section-title">Explorons par type de propriété</h2>
      
      <div className="explore-container">
        <button 
          className={`arrow-left ${currentIndex === 0 ? 'disabled' : ''}`} 
          onClick={handlePrev}
        >
          <FaChevronLeft />
        </button>

        <div className="horizontal-property-list" ref={propertyListRef}>
          {[{ name: "Maison", icon: FaHome, iconClass: "home-icon" },
            { name: "Villa", icon: FaHouseUser, iconClass: "villa-icon" },
            { name: "Appartement", icon: FaBuilding, iconClass: "apartment-icon" },
            { name: "Commercial", icon: FaStore, iconClass: "commercial-icon" },
            { name: "Bureau", icon: FaCity, iconClass: "office-icon" }]
            .map((item, index) => (
              <motion.div
                key={index}
                className={`property-item ${index === currentIndex ? 'active' : ''}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
              >
                <div className={`property-icon ${item.iconClass}`}>
                  <item.icon size={28} />
                </div>
                <span>{item.name}</span>
              </motion.div>
            ))}
        </div>

        <button 
          className={`arrow-right ${currentIndex === 4 ? 'disabled' : ''}`} 
          onClick={handleNext}
        >
          <FaChevronRight />
        </button>
      </div>
    </div>

      <Footer />

      <div
        className={`back-to-top ${showBackToTop ? "show" : ""}`}
        onClick={scrollToTop}
      >
        <FaArrowUp />
      </div>
    </div>
  );
};

export default Home;