import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import "./DetailAppartement.css";
import Header from "../../Header";
import Footer from "../../Footer";
import {
  FaBed,
  FaRulerCombined,
  FaMapMarkerAlt,
  FaArrowLeft,
  FaHome,
  FaBuilding,
  FaCity,
  FaChair,
  FaHeart,
  FaShare,
  FaPhone,
  FaWhatsapp,
  FaEnvelope,
  FaExpand,
  FaArrowRight,
  FaArrowLeft as FaArrowLeftIcon,
  FaStreetView,
  FaUser,
  FaTree,
} from "react-icons/fa";
import { IoIosArrowForward } from "react-icons/io";

interface Image {
  url: string;
  path: string;
}

interface Appartement {
  id: number;
  titre: string;
  description: string;
  prix: number;
  superficie: number;
  superficie_couvert: number | null;
  etage: number | null;
  meuble: boolean;
  adresse: string;
  ville: string;
  delegation: string;
  categorie: string;
  type: string;
  environnements: string[];
  images: Image[];
  created_at: string;
  updated_at: string;
}

interface SimilarProperty {
  id: number;
  titre: string;
  prix: number;
  adresse: string;
  ville: string;
  superficie: number;
  etage: number | null;
  image: string;
}

const CercleProgression: React.FC<{
  value: number;
  label: string;
  icon: React.ReactNode;
  count: string | number;
}> = ({ value, label, icon, count }) => {
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  return (
    <motion.div
      className="cercle-progression"
      initial={{ scale: 0.8, opacity: 0 }}
      whileInView={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <svg viewBox="0 0 100 100">
        <circle
          className="fond-progression"
          cx="50"
          cy="50"
          r={radius}
          strokeWidth="8"
        />
        <circle
          className="barre-progression"
          cx="50"
          cy="50"
          r={radius}
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{ "--value": value } as React.CSSProperties}
        />
      </svg>
      <div className="contenu-progression">
        <div className="icone-progression">{icon}</div>
        <div className="compteur-progression">{count}</div>
        <div className="etiquette-progression">{label}</div>
      </div>
    </motion.div>
  );
};

const DetailAppartement = () => {
  const { id } = useParams<{ id: string }>();
  const [appartement, setAppartement] = useState<Appartement | null>(null);
  const [similarProperties, setSimilarProperties] = useState<SimilarProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showFullScreen, setShowFullScreen] = useState(false);
  const [currentFullScreenIndex, setCurrentFullScreenIndex] = useState(0);
  const [showVirtualTour, setShowVirtualTour] = useState(false);

  const carouselRef = useRef<HTMLDivElement>(null);
  const [carouselScrollPosition, setCarouselScrollPosition] = useState(0);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -150]);
  const bgGradient = useTransform(scrollYProgress, [0, 1], [0, 90]);

  useEffect(() => {
    const fetchAppartement = async () => {
      try {
        const response = await axios.get<Appartement>(`http://localhost:8000/api/appartements/${id}`);
        setAppartement(response.data);
        setLoading(false);

        const mockSimilarProperties: SimilarProperty[] = [
          {
            id: 1,
            titre: "Appartement moderne à Sousse",
            prix: 250000,
            adresse: "Sousse",
            ville: "Tunisie",
            superficie: 100,
            etage: 2,
            image: "https://via.placeholder.com/300x200",
          },
          {
            id: 2,
            titre: "Appartement spacieux",
            prix: 320000,
            adresse: "Tunis",
            ville: "Tunisie",
            superficie: 120,
            etage: 3,
            image: "https://via.placeholder.com/300x200",
          },
          {
            id: 3,
            titre: "Appartement de luxe",
            prix: 450000,
            adresse: "Hammamet",
            ville: "Tunisie",
            superficie: 150,
            etage: 5,
            image: "https://via.placeholder.com/300x200",
          },
          {
            id: 4,
            titre: "Appartement cosy",
            prix: 200000,
            adresse: "Sfax",
            ville: "Tunisie",
            superficie: 80,
            etage: 1,
            image: "https://via.placeholder.com/300x200",
          },
        ];
        setSimilarProperties(mockSimilarProperties);
      } catch (err) {
        setError("Impossible de charger les détails de l'appartement");
        setLoading(false);
      }
    };
    fetchAppartement();
  }, [id]);

  const handleThumbnailClick = (index: number) => {
    setActiveImageIndex(index);
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  const openFullScreen = (index: number) => {
    setCurrentFullScreenIndex(index);
    setShowFullScreen(true);
  };

  const closeFullScreen = () => {
    setShowFullScreen(false);
  };

  const navigateFullScreen = (direction: "prev" | "next") => {
    if (!appartement) return;

    if (direction === "prev") {
      setCurrentFullScreenIndex((prev) =>
        prev === 0 ? appartement.images.length - 1 : prev - 1
      );
    } else {
      setCurrentFullScreenIndex((prev) =>
        prev === appartement.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const handleCarouselScroll = (direction: "left" | "right") => {
    if (!carouselRef.current) return;

    const container = carouselRef.current;
    const scrollAmount = container.clientWidth * 0.8;
    const maxScroll = container.scrollWidth - container.clientWidth;

    if (direction === "left") {
      container.scrollBy({ left: -scrollAmount, behavior: "smooth" });
    } else {
      container.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }

    setTimeout(() => {
      const newPosition = container.scrollLeft;
      setCarouselScrollPosition(newPosition);
      setShowLeftArrow(newPosition > 0);
      setShowRightArrow(newPosition < maxScroll - 1);
    }, 300);
  };

  if (loading)
    return (
      <motion.div
        className="ecran-chargement"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="spinner-chargement"></div>
        <p>Chargement de l'appartement...</p>
      </motion.div>
    );

  if (error)
    return (
      <motion.div
        className="ecran-erreur"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="contenu-erreur">
          <h3>Erreur</h3>
          <p>{error}</p>
          <Link to="/" className="bouton-retour-accueil">
            <FaArrowLeft /> Retour à l'accueil
          </Link>
        </div>
      </motion.div>
    );

  if (!appartement)
    return (
      <motion.div
        className="ecran-non-trouve"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="contenu-non-trouve">
          <h3>Appartement non trouvé</h3>
          <p>L'appartement que vous recherchez n'existe pas ou a été supprimé.</p>
          <Link to="/" className="bouton-retour-accueil">
            <FaArrowLeft /> Retour à l'accueil
          </Link>
        </div>
      </motion.div>
    );

  return (
    <div className="detail-appartement">
      <Header />

      {/* Section Héros Parallaxe */}
      <motion.section
        className="section-heros-parallaxe"
        style={{
          y,
          background: `linear-gradient(${bgGradient}deg, #0a1a2b, #1a2a3b)`,
        }}
      >
        <div className="particules"></div>
        <div
          className="fond-parallaxe"
          style={{
            backgroundImage: `url(${appartement.images[0]?.url || "https://via.placeholder.com/1920x1080"})`,
            backgroundAttachment: "fixed",
          }}
        />
        <div className="superposition-parallaxe" />
        <div className="contenu-parallaxe">
          <motion.div
            className="fil-ariane"
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
          >
            <Link to="/">Accueil</Link>
            <IoIosArrowForward />
            <Link to="/appartements">Appartements</Link>
            <IoIosArrowForward />
            <span>{appartement.titre}</span>
          </motion.div>

          <motion.h1
            className="titre-parallaxe"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 1, ease: "easeOut" }}
          >
            {appartement.titre}
          </motion.h1>

          <motion.div
            className="etiquette-localisation"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7, duration: 1, ease: "easeOut" }}
          >
            <FaMapMarkerAlt />
            <span>
              {appartement.adresse}, {appartement.ville} - {appartement.delegation}
            </span>
          </motion.div>

          <motion.div
            className="boutons-action"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 1 }}
          >
            <motion.button
              className={`bouton-favori ${isFavorite ? "actif" : ""}`}
              onClick={toggleFavorite}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaHeart /> {isFavorite ? "Favori" : "Ajouter aux favoris"}
            </motion.button>
            <motion.button
              className="bouton-partager"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaShare /> Partager
            </motion.button>
            <motion.button
              className="bouton-visite-virtuelle"
              onClick={() => setShowVirtualTour(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaStreetView /> Visite Virtuelle
            </motion.button>
          </motion.div>
        </div>

        <motion.div
          className="bulle-prix"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 1.1, duration: 0.8, ease: "backOut" }}
        >
          <span className="prix">{appartement.prix.toLocaleString()} TND</span>
          <span className="type-transaction">{appartement.type}</span>
        </motion.div>
      </motion.section>

      {/* Séparateur de Section */}
      <div className="separateur-section">
        <div className="ligne-separateur"></div>
        <div className="diamant-separateur"></div>
        <div className="ligne-separateur"></div>
      </div>

      {/* Section Galerie */}
      <section className="section-galerie">
        <div className="conteneur-galerie">
          <div className="galerie-principale">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeImageIndex}
                className="conteneur-image-principale"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.5 }}
              >
                <motion.img
                  src={appartement.images[activeImageIndex]?.url || "https://via.placeholder.com/800x450"}
                  alt={`${appartement.titre} ${activeImageIndex + 1}`}
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                />
                <motion.button
                  className="bouton-agrandir"
                  onClick={() => openFullScreen(activeImageIndex)}
                  whileHover={{ scale: 1.1, rotate: 90 }}
                >
                  <FaExpand />
                </motion.button>
              </motion.div>
            </AnimatePresence>

            <div className="controles-galerie">
              <motion.button
                className="bouton-nav precedent"
                onClick={() =>
                  handleThumbnailClick(
                    activeImageIndex === 0 ? appartement.images.length - 1 : activeImageIndex - 1
                  )
                }
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                {"<"}
              </motion.button>
              <motion.button
                className="bouton-nav suivant"
                onClick={() =>
                  handleThumbnailClick(
                    activeImageIndex === appartement.images.length - 1 ? 0 : activeImageIndex + 1
                  )
                }
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                {">"}
              </motion.button>
            </div>
          </div>

          <div className="defileur-miniatures">
            {appartement.images.map((image, index) => (
              <motion.div
                key={index}
                className={`conteneur-miniature ${index === activeImageIndex ? "actif" : ""}`}
                onClick={() => handleThumbnailClick(index)}
                whileHover={{ scale: 1.1, boxShadow: "0 0 10px rgba(212, 175, 55, 0.5)" }}
                transition={{ duration: 0.3 }}
              >
                <img
                  src={image.url}
                  alt={`Miniature ${index + 1}`}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Séparateur de Section */}
      <div className="separateur-section">
        <div className="ligne-separateur"></div>
        <div className="diamant-separateur"></div>
        <div className="ligne-separateur"></div>
      </div>

      {/* Section Détails Propriété */}
      <section className="section-details-propriete">
        <div className="grille-details">
          {/* Carte Description */}
          <motion.div
            className="carte-detail carte-description"
            initial={{ y: 100, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true, margin: "-100px" }}
          >
            <div className="entete-carte">
              <div className="decoration-entete">
                <div className="ligne-decoration"></div>
                <FaHome className="icone-entete" />
                <div className="ligne-decoration"></div>
              </div>
              <h2>Description</h2>
            </div>
            <div className="contenu-carte">
              <div className="onglets-description">
                <button className="onglet actif">Description</button>
                <button className="onglet">Détails Techniques</button>
                <button className="onglet">Environnement</button>
              </div>
              <div className="contenu-description">
                <div className="texte-riche">
                  {appartement.description.split("\n").map((paragraph, i) => (
                    <motion.p
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1, duration: 0.5 }}
                    >
                      {paragraph}
                    </motion.p>
                  ))}
                </div>
                <div className="caracteristiques-mises-en-valeur">
                  <motion.div className="element-mise-en-valeur" whileHover={{ scale: 1.03 }}>
                    <div className="icone-mise-en-valeur">🏙</div>
                    <span>Vues sur la ville</span>
                  </motion.div>
                  <motion.div className="element-mise-en-valeur" whileHover={{ scale: 1.03 }}>
                    <div className="icone-mise-en-valeur">🛗</div>
                    <span>Ascenseur disponible</span>
                  </motion.div>
                  <motion.div className="element-mise-en-valeur" whileHover={{ scale: 1.03 }}>
                    <div className="icone-mise-en-valeur">🔒</div>
                    <span>Sécurité 24/7</span>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
          {/* Séparateur de Section */}
          <div className="separateur-section">
            <div className="ligne-separateur"></div>
            <div className="diamant-separateur"></div>
            <div className="ligne-separateur"></div>
          </div>
          {/* Carte Caractéristiques */}
          <motion.div
            className="carte-detail carte-caracteristiques"
            initial={{ y: 100, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            viewport={{ once: true, margin: "-100px" }}
          >
            <div className="entete-carte">
              <div className="decoration-entete">
                <div className="ligne-decoration"></div>
                <FaBuilding className="icone-entete" />
                <div className="ligne-decoration"></div>
              </div>
              <h2>Caractéristiques</h2>
            </div>
            <div className="contenu-carte">
              <div className="visuel-caracteristiques">
                <div className="grille-visuelle">
                  <div className="element-visuel">
                    <CercleProgression
                      value={Math.min(appartement.superficie / 2, 100)}
                      label="Superficie"
                      icon={<FaRulerCombined />}
                      count={`${appartement.superficie}m²`}
                    />
                  </div>
                  <div className="element-visuel">
                    <CercleProgression
                      value={(appartement.etage || 0) * 10}
                      label="Étage"
                      icon={<FaBuilding />}
                      count={appartement.etage || "RDC"}
                    />
                  </div>
                  <div className="element-visuel">
                    <CercleProgression
                      value={appartement.meuble ? 100 : 50}
                      label="Meublé"
                      icon={<FaChair />}
                      count={appartement.meuble ? "Oui" : "Non"}
                    />
                  </div>
                </div>
              </div>
              <div className="details-caracteristiques">
                <div className="rangee-caracteristiques">
                  <div className="caracteristique">
                    <div className="icone-caracteristique">
                      <FaRulerCombined />
                    </div>
                    <div className="info-caracteristique">
                      <span className="etiquette-caracteristique">Superficie couverte</span>
                      <span className="valeur-caracteristique">
                        {appartement.superficie_couvert ? `${appartement.superficie_couvert}m²` : "Non spécifié"}
                      </span>
                    </div>
                  </div>
                  <div className="caracteristique">
                    <div className="icone-caracteristique">
                      <FaChair />
                    </div>
                    <div className="info-caracteristique">
                      <span className="etiquette-caracteristique">Meublé</span>
                      <span className="valeur-caracteristique">{appartement.meuble ? "Oui" : "Non"}</span>
                    </div>
                  </div>
                </div>
                {appartement.environnements && appartement.environnements.length > 0 && (
                  <div className="caracteristique pleine-largeur">
                    <div className="icone-caracteristique">
                      <FaTree />
                    </div>
                    <div className="info-caracteristique">
                      <span className="etiquette-caracteristique">Environnements</span>
                      <span className="valeur-caracteristique">{appartement.environnements.join(", ")}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
          {/* Séparateur de Section */}
          <div className="separateur-section">
            <div className="ligne-separateur"></div>
            <div className="diamant-separateur"></div>
            <div className="ligne-separateur"></div>
          </div>
          {/* Carte Info */}
          <motion.div
            className="carte-detail carte-info"
            initial={{ y: 100, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            viewport={{ once: true, margin: "-100px" }}
          >
            <div className="entete-carte">
              <div className="decoration-entete">
                <div className="ligne-decoration"></div>
                <FaCity className="icone-entete" />
                <div className="ligne-decoration"></div>
              </div>
              <h2>Infos Générales</h2>
            </div>
            <div className="contenu-carte">
              <div className="mini-carte">
                <div className="apercu-carte">
                  <iframe
                    src={`https://maps.google.com/maps?q=${appartement.ville},${appartement.delegation}&output=embed`}
                    frameBorder="0"
                    allowFullScreen
                  ></iframe>
                </div>
                <div className="superposition-carte">
                  <FaMapMarkerAlt className="pin-carte" />
                  <div className="infobulle-carte">
                    {appartement.adresse}, {appartement.ville}
                  </div>
                </div>
              </div>
              <div className="elements-info">
                <div className="element-info">
                  <div className="icone-info">
                    <FaBuilding />
                  </div>
                  <div className="texte-info">
                    <h4>Type de transaction</h4>
                    <p>{appartement.type}</p>
                  </div>
                </div>
                <div className="element-info">
                  <div className="icone-info">
                    <FaHome />
                  </div>
                  <div className="texte-info">
                    <h4>Catégorie</h4>
                    <p>{appartement.categorie}</p>
                  </div>
                </div>
                <div className="element-info">
                  <div className="icone-info">
                    <FaMapMarkerAlt />
                  </div>
                  <div className="texte-info">
                    <h4>Localisation</h4>
                    <p>
                      {appartement.delegation}, {appartement.ville}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
          {/* Séparateur de Section */}
          <div className="separateur-section">
            <div className="ligne-separateur"></div>
            <div className="diamant-separateur"></div>
            <div className="ligne-separateur"></div>
          </div>
          {/* Carte Contact */}
          <motion.div
            className="carte-detail carte-contact"
            initial={{ y: 100, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
            viewport={{ once: true, margin: "-100px" }}
          >
            <div className="entete-carte">
              <div className="decoration-entete">
                <div className="ligne-decoration"></div>
                <FaUser className="icone-entete" />
                <div className="ligne-decoration"></div>
              </div>
              <h2>Votre Agent Immobilier</h2>
            </div>
            <div className="contenu-carte">
              <div className="profil-agent">
                <div className="photo-agent">
                  <img src="https://randomuser.me/api/portraits/women/68.jpg" alt="Agent" />
                  <div className="badge-agent">
                    <span>⭐ 4.9/5</span>
                  </div>
                </div>
                <div className="details-agent">
                  <h3>Sophie Martin</h3>
                  <p className="titre-agent">Agent Immobilier Senior</p>
                  <p className="experience-agent">10+ ans d'expérience</p>
                  <div className="stats-agent">
                    <div className="stat">
                      <span>50+</span>
                      <small>Transactions</small>
                    </div>
                    <div className="stat">
                      <span>98%</span>
                      <small>Satisfaction</small>
                    </div>
                  </div>
                </div>
              </div>

              <div className="methodes-contact">
                <motion.div className="methode-contact" whileHover={{ y: -5 }}>
                  <div className="icone-methode telephone">
                    <FaPhone />
                  </div>
                  <div className="info-methode">
                    <h4>Appelez-moi</h4>
                    <p>+216 12 345 678</p>
                  </div>
                </motion.div>
                <motion.div className="methode-contact" whileHover={{ y: -5 }}>
                  <div className="icone-methode whatsapp">
                    <FaWhatsapp />
                  </div>
                  <div className="info-methode">
                    <h4>WhatsApp</h4>
                    <p>Envoyez un message</p>
                  </div>
                </motion.div>
                <motion.div className="methode-contact" whileHover={{ y: -5 }}>
                  <div className="icone-methode email">
                    <FaEnvelope />
                  </div>
                  <div className="info-methode">
                    <h4>Email</h4>
                    <p>sophie@immobilier.tn</p>
                  </div>
                </motion.div>
              </div>

              <div className="conteneur-formulaire-contact">
                <h3 className="titre-formulaire">Ou envoyez un message</h3>
                <form className="formulaire-contact">
                  <motion.div
                    className="groupe-formulaire"
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <input type="text" placeholder="Votre nom complet" />
                    <div className="decoration-input"></div>
                  </motion.div>
                  <motion.div
                    className="groupe-formulaire"
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <input type="email" placeholder="Votre email" />
                    <div className="decoration-input"></div>
                  </motion.div>
                  <motion.div
                    className="groupe-formulaire"
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <input type="tel" placeholder="Votre téléphone" />
                    <div className="decoration-input"></div>
                  </motion.div>
                  <motion.div
                    className="groupe-formulaire groupe-texte"
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <textarea placeholder="Votre message"></textarea>
                    <div className="decoration-input"></div>
                  </motion.div>
                  <motion.button
                    type="submit"
                    className="bouton-soumettre"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    Envoyer le message
                    <div className="decoration-bouton"></div>
                  </motion.button>
                </form>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Séparateur de Section */}
      <div className="separateur-section">
        <div className="ligne-separateur"></div>
        <div className="diamant-separateur"></div>
        <div className="ligne-separateur"></div>
      </div>

      {/* Section Propriétés Similaires */}
      <section className="section-proprietes-similaires">
        <motion.div
          className="entete-section"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2>Appartements Similaires</h2>
          <Link to="/appartements" className="voir-tout">
            Voir tous <IoIosArrowForward />
          </Link>
        </motion.div>

        <div className="conteneur-carrousel">
          {showLeftArrow && (
            <motion.button
              className="fleche-carrousel gauche"
              onClick={() => handleCarouselScroll("left")}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <FaArrowLeftIcon />
            </motion.button>
          )}
          <div className="carrousel-proprietes" ref={carouselRef}>
            {similarProperties.map((property, index) => (
              <motion.div
                key={property.id}
                className="carte-propriete"
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                viewport={{ once: true }}
                whileHover={{
                  y: -10,
                  rotateY: 5,
                  rotateX: 5,
                  boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3)",
                }}
              >
                <div className="image-propriete">
                  <motion.img
                    src={property.image}
                    alt={property.titre}
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.3 }}
                  />
                  <span className="prix-propriete">{property.prix.toLocaleString()} TND</span>
                </div>
                <div className="details-propriete">
                  <h3>{property.titre}</h3>
                  <p className="localisation-propriete">
                    <FaMapMarkerAlt /> {property.adresse}, {property.ville}
                  </p>
                  <div className="caracteristiques-propriete">
                    <span>
                      <FaRulerCombined /> {property.superficie}m²
                    </span>
                    <span>
                      <FaBuilding /> Étage {property.etage || "RDC"}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          {showRightArrow && (
            <motion.button
              className="fleche-carrousel droite"
              onClick={() => handleCarouselScroll("right")}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <FaArrowRight />
            </motion.button>
          )}
        </div>
      </section>

      {/* Visionneuse Plein Écran */}
      <AnimatePresence>
        {showFullScreen && (
          <motion.div
            className="visionneuse-plein-ecran"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.button
              className="bouton-fermer"
              onClick={closeFullScreen}
              whileHover={{ scale: 1.1, rotate: 90 }}
            >
              ×
            </motion.button>

            <div className="conteneur-image-plein-ecran">
              <motion.img
                src={appartement.images[currentFullScreenIndex]?.url || "https://via.placeholder.com/1200x800"}
                alt={`Plein écran ${currentFullScreenIndex + 1}`}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
              />
              <motion.button
                className="bouton-nav precedent"
                onClick={() => navigateFullScreen("prev")}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                {"<"}
              </motion.button>
              <motion.button
                className="bouton-nav suivant"
                onClick={() => navigateFullScreen("next")}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                {">"}
              </motion.button>
            </div>

            <div className="miniatures-plein-ecran">
              {appartement.images.map((image, index) => (
                <motion.img
                  key={index}
                  src={image.url}
                  alt={`Miniature ${index + 1}`}
                  className={index === currentFullScreenIndex ? "actif" : ""}
                  onClick={() => setCurrentFullScreenIndex(index)}
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.3 }}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Visite Virtuelle */}
      <AnimatePresence>
        {showVirtualTour && (
          <motion.div
            className="modal-visite-virtuelle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="contenu-modal"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
            >
              <motion.button
                className="bouton-fermer"
                onClick={() => setShowVirtualTour(false)}
                whileHover={{ scale: 1.1, rotate: 90 }}
              >
                ×
              </motion.button>
              <h2>Visite Virtuelle</h2>
              <div className="espace-visite">
                <p>Visite virtuelle à venir (Placeholder)</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
};

export default DetailAppartement;