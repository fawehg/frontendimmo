import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import "./DetailEtageVilla.css";
import Header from "../../Header";
import Footer from "../../Footer";
import {
  FaRulerCombined,
  FaMapMarkerAlt,
  FaArrowLeft,
  FaHome,
  FaBuilding,
  FaCity,
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
  FaLayerGroup,
  FaParking,
  FaCalendarAlt,
} from "react-icons/fa";
import { IoIosArrowForward } from "react-icons/io";

interface Image {
  url: string;
  path: string;
}

interface Vendeur {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  phone?: string;
}

interface EtageVilla {
  id: number;
  titre: string;
  description: string;
  prix: number;
  superficie: number;
  adresse: string;
  type: string | null;
  categorie: string | null;
  ville: string | null;
  delegation: string | null;
  environnement: string | null;
  numero_etage: number;
  acces_independant: boolean;
  parking_inclus: boolean;
  annee_construction: number;
  images: Image[];
  created_at: string;
  vendeur: Vendeur | null;
}

interface SimilarProperty {
  id: number;
  titre: string;
  prix: number;
  adresse: string;
  ville: string;
  superficie: number;
  numero_etage: number;
  image: string;
}

interface Message {
  id: number;
  senderName: string;
  senderEmail: string;
  senderPhone: string;
  content: string;
  timestamp: string;
  response?: string;
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

const DetailEtageVilla = () => {
  const { id } = useParams<{ id: string }>();
  const [etageVilla, setEtageVilla] = useState<EtageVilla | null>(null);
  const [similarProperties, setSimilarProperties] = useState<SimilarProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showFullScreen, setShowFullScreen] = useState(false);
  const [currentFullScreenIndex, setCurrentFullScreenIndex] = useState(0);
  const [showVirtualTour, setShowVirtualTour] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  const carouselRef = useRef<HTMLDivElement>(null);
  const [, setCarouselScrollPosition] = useState(0);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -150]);
  const bgGradient = useTransform(scrollYProgress, [0, 1], [0, 90]);

  const defaultImage = "https://via.placeholder.com/800x450?text=Image+non+disponible";

  useEffect(() => {
    const fetchEtageVilla = async () => {
      try {
        const response = await axios.get<EtageVilla>(`http://localhost:8000/api/etage-villas/${id}`);
        const villaData = response.data;

        let images: Image[] = [];
        if (villaData.images && Array.isArray(villaData.images)) {
          villaData.images.forEach((img) => {
            if (img && typeof img === "object" && img.path) {
              try {
                let paths: string[] = [];
                if (typeof img.path === "string" && img.path.startsWith('[')) {
                  paths = JSON.parse(img.path);
                } else {
                  paths = [img.path];
                }
                paths.forEach((path) => {
                  if (typeof path === "string") {
                    images.push({
                      url: `http://localhost:8000/${path}`,
                      path: path,
                    });
                  }
                });
              } catch (e) {
                console.warn("Failed to parse image path:", img.path, e);
              }
            }
          });
        } else if (typeof villaData.images === "string") {
          try {
            const parsedImages = JSON.parse(villaData.images);
            if (Array.isArray(parsedImages)) {
              images = parsedImages.map((path: string) => ({
                url: `http://localhost:8000/${path}`,
                path: path,
              }));
            }
          } catch (e) {
            console.warn("Failed to parse images string:", villaData.images, e);
          }
        }

        images = images.filter(
          (img) => img && typeof img === "object" && img.url && typeof img.url === "string"
        );

        villaData.images = images;
        setEtageVilla(villaData);
        setLoading(false);

        const mockSimilarProperties: SimilarProperty[] = [
          {
            id: 1,
            titre: "Étage de villa moderne à Sousse",
            prix: 250000,
            adresse: "Sousse",
            ville: "Tunisie",
            superficie: 100,
            numero_etage: 1,
            image: "https://via.placeholder.com/300x200",
          },
          {
            id: 2,
            titre: "Étage spacieux à Tunis",
            prix: 320000,
            adresse: "Tunis",
            ville: "Tunisie",
            superficie: 130,
            numero_etage: 2,
            image: "https://via.placeholder.com/300x200",
          },
          {
            id: 3,
            titre: "Étage de luxe à Hammamet",
            prix: 400000,
            adresse: "Hammamet",
            ville: "Tunisie",
            superficie: 150,
            numero_etage: 1,
            image: "https://via.placeholder.com/300x200",
          },
          {
            id: 4,
            titre: "Étage compact à Sfax",
            prix: 200000,
            adresse: "Sfax",
            ville: "Tunisie",
            superficie: 80,
            numero_etage: 3,
            image: "https://via.placeholder.com/300x200",
          },
        ];
        setSimilarProperties(mockSimilarProperties);
      } catch (err) {
        console.error("Error fetching EtageVilla:", err);
        setError("Impossible de charger les détails de l'étage de villa");
        setLoading(false);
      }
    };
    fetchEtageVilla();
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
    if (!etageVilla || !etageVilla.images.length) return;

    if (direction === "prev") {
      setCurrentFullScreenIndex((prev) =>
        prev === 0 ? etageVilla.images.length - 1 : prev - 1
      );
    } else {
      setCurrentFullScreenIndex((prev) =>
        prev === etageVilla.images.length - 1 ? 0 : prev + 1
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");

    const { name, email, phone, message } = formData;

    if (!name || !email || !phone || !message) {
      setFormError("Veuillez remplir tous les champs.");
      return;
    }

    const newMessage: Message = {
      id: messages.length + 1,
      senderName: name,
      senderEmail: email,
      senderPhone: phone,
      content: message,
      timestamp: new Date().toISOString(),
    };

    try {
      // Mock API call
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            ...newMessage,
            response: "Merci pour votre message ! Je vous contacterai bientôt pour discuter des détails.",
          },
        ]);
      }, 2000);

      setMessages((prev) => [...prev, newMessage]);
      setFormSuccess("Message envoyé avec succès ! Le vendeur vous répondra bientôt.");
      setFormData({ name: "", email: "", phone: "", message: "" });
    } catch (err) {
      setFormError("Erreur lors de l'envoi du message. Veuillez réessayer.");
    }
  };

  const formatPhoneForLinks = (phone: string | undefined): string => {
    if (!phone) return "+21698765432";
    const cleanedPhone = phone.replace(/[^\d+]/g, "");
    return cleanedPhone.startsWith("+") ? cleanedPhone : `+216${cleanedPhone}`;
  };

  const formatEmailForMailto = (email: string | undefined): string => {
    return email || "contact@immobilier.tn";
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
        <p>Chargement de l'étage de villa...</p>
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

  if (!etageVilla)
    return (
      <motion.div
        className="ecran-non-trouve"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="contenu-non-trouve">
          <h3>Étage de villa non trouvé</h3>
          <p>L'étage de villa que vous recherchez n'existe pas ou a été supprimé.</p>
          <Link to="/" className="bouton-retour-accueil">
            <FaArrowLeft /> Retour à l'accueil
          </Link>
        </div>
      </motion.div>
    );

  const hasImages = etageVilla.images && etageVilla.images.length > 0;

  return (
    <div className="detail-etage-villa">
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
            backgroundImage: `url(${hasImages ? etageVilla.images[0]?.url : defaultImage})`,
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
            <Link to="/etage-villas">Étages de Villa</Link>
            <IoIosArrowForward />
            <span>{etageVilla.titre}</span>
          </motion.div>

          <motion.h1
            className="titre-parallaxe"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 1, ease: "easeOut" }}
          >
            {etageVilla.titre}
          </motion.h1>

          <motion.div
            className="etiquette-localisation"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7, duration: 1, ease: "easeOut" }}
          >
            <FaMapMarkerAlt />
            <span>
              {etageVilla.adresse}, {etageVilla.ville || "Non défini"} -{" "}
              {etageVilla.delegation || "Non défini"}
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
          <span className="prix">{etageVilla.prix.toLocaleString()} TND</span>
          <span className="type-transaction">{etageVilla.type || "Non défini"}</span>
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
            {hasImages ? (
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
                    src={etageVilla.images[activeImageIndex]?.url || defaultImage}
                    alt={`${etageVilla.titre} ${activeImageIndex + 1}`}
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.3 }}
                    onError={(e) => {
                      console.warn(`Failed to load image: ${etageVilla.images[activeImageIndex]?.url}`);
                      e.currentTarget.src = defaultImage;
                    }}
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
            ) : (
              <div className="no-images">
                <p>Aucune image disponible</p>
                <img src={defaultImage} alt="Placeholder" />
              </div>
            )}

            {hasImages && (
              <div className="controles-galerie">
                <motion.button
                  className="bouton-nav precedent"
                  onClick={() =>
                    handleThumbnailClick(
                      activeImageIndex === 0 ? etageVilla.images.length - 1 : activeImageIndex - 1
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
                      activeImageIndex === etageVilla.images.length - 1 ? 0 : activeImageIndex + 1
                    )
                  }
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {">"}
                </motion.button>
              </div>
            )}
          </div>

          {hasImages && (
            <div className="defileur-miniatures">
              {etageVilla.images.map((image, index) => (
                <motion.div
                  key={index}
                  className={`conteneur-miniature ${index === activeImageIndex ? "actif" : ""}`}
                  onClick={() => handleThumbnailClick(index)}
                  whileHover={{ scale: 1.1, boxShadow: "0 0 10px rgba(212, 175, 55, 0.5)" }}
                  transition={{ duration: 0.3 }}
                >
                  <img
                    src={image.url || defaultImage}
                    alt={`Miniature ${index + 1}`}
                    onError={(e) => {
                      console.warn(`Failed to load thumbnail: ${image.url}`);
                      e.currentTarget.src = defaultImage;
                    }}
                  />
                </motion.div>
              ))}
            </div>
          )}
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
                  {etageVilla.description.split("\n").map((paragraph, i) => (
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
                    <div className="icone-mise-en-valeur">🏡</div>
                    <span>Accès indépendant</span>
                  </motion.div>
                  <motion.div className="element-mise-en-valeur" whileHover={{ scale: 1.03 }}>
                    <div className="icone-mise-en-valeur">🚗</div>
                    <span>Parking inclus</span>
                  </motion.div>
                  <motion.div className="element-mise-en-valeur" whileHover={{ scale: 1.03 }}>
                    <div className="icone-mise-en-valeur">🌳</div>
                    <span>Environnement calme</span>
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
                      value={Math.min(etageVilla.superficie / 2, 100)}
                      label="Superficie"
                      icon={<FaRulerCombined />}
                      count={`${etageVilla.superficie}m²`}
                    />
                  </div>
                  <div className="element-visuel">
                    <CercleProgression
                      value={etageVilla.numero_etage * 20}
                      label="Étage"
                      icon={<FaLayerGroup />}
                      count={etageVilla.numero_etage}
                    />
                  </div>
                  <div className="element-visuel">
                    <CercleProgression
                      value={((etageVilla.annee_construction - 1900) / (new Date().getFullYear() - 1900)) * 100}
                      label="Construction"
                      icon={<FaCalendarAlt />}
                      count={etageVilla.annee_construction}
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
                      <span className="etiquette-caracteristique">Superficie</span>
                      <span className="valeur-caracteristique">
                        {etageVilla.superficie}m²
                      </span>
                    </div>
                  </div>
                  <div className="caracteristique">
                    <div className="icone-caracteristique">
                      <FaLayerGroup />
                    </div>
                    <div className="info-caracteristique">
                      <span className="etiquette-caracteristique">Numéro d'étage</span>
                      <span className="valeur-caracteristique">{etageVilla.numero_etage}</span>
                    </div>
                  </div>
                </div>
                <div className="rangee-caracteristiques">
                  <div className="caracteristique">
                    <div className="icone-caracteristique">
                      <FaParking />
                    </div>
                    <div className="info-caracteristique">
                      <span className="etiquette-caracteristique">Parking inclus</span>
                      <span className="valeur-caracteristique">{etageVilla.parking_inclus ? "Oui" : "Non"}</span>
                    </div>
                  </div>
                  <div className="caracteristique">
                    <div className="icone-caracteristique">
                      <FaCalendarAlt />
                    </div>
                    <div className="info-caracteristique">
                      <span className="etiquette-caracteristique">Année de construction</span>
                      <span className="valeur-caracteristique">{etageVilla.annee_construction}</span>
                    </div>
                  </div>
                </div>
                <div className="rangee-caracteristiques">
                  <div className="caracteristique pleine-largeur">
                    <div className="icone-caracteristique">
                      <FaHome />
                    </div>
                    <div className="info-caracteristique">
                      <span className="etiquette-caracteristique">Accès indépendant</span>
                      <span className="valeur-caracteristique">{etageVilla.acces_independant ? "Oui" : "Non"}</span>
                    </div>
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
                    src={`https://maps.google.com/maps?q=${etageVilla.ville || "Tunisie"},${etageVilla.delegation || "Tunisie"}&output=embed`}
                    frameBorder="0"
                    allowFullScreen
                  ></iframe>
                </div>
                <div className="superposition-carte">
                  <FaMapMarkerAlt className="pin-carte" />
                  <div className="infobulle-carte">
                    {etageVilla.adresse}, {etageVilla.ville || "Non défini"}
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
                    <p>{etageVilla.type || "Non spécifié"}</p>
                  </div>
                </div>
                <div className="element-info">
                  <div className="icone-info">
                    <FaHome />
                  </div>
                  <div className="texte-info">
                    <h4>Catégorie</h4>
                    <p>{etageVilla.categorie || "Non spécifié"}</p>
                  </div>
                </div>
                <div className="element-info">
                  <div className="icone-info">
                    <FaMapMarkerAlt />
                  </div>
                  <div className="texte-info">
                    <h4>Localisation</h4>
                    <p>
                      {etageVilla.delegation || "Non spécifié"}, {etageVilla.ville || "Non spécifié"}
                    </p>
                  </div>
                </div>
                <div className="element-info">
                  <div className="icone-info">
                    <FaCity />
                  </div>
                  <div className="texte-info">
                    <h4>Environnement</h4>
                    <p>{etageVilla.environnement || "Non spécifié"}</p>
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
              <h2>Le Vendeur</h2>
            </div>
            <div className="contenu-carte">
              <div className="profil-agent">
                <div className="icon-agent">
                  <FaUser />
                  <div className="badge-agent">
                    <span>⭐ 4.8/5</span>
                  </div>
                </div>
                <div className="details-agent">
                  <h3>{etageVilla.vendeur ? `${etageVilla.vendeur.prenom} ${etageVilla.vendeur.nom}` : "Vendeur non spécifié"}</h3>
                  <p className="titre-agent">Propriétaire</p>
                  <p className="experience-agent">Vendeur expérimenté</p>
                  <div className="stats-agent">
                    <div className="stat">
                      <span>20+</span>
                      <small>Annonces publiées</small>
                    </div>
                    <div className="stat">
                      <span>95%</span>
                      <small>Satisfaction</small>
                    </div>
                  </div>
                </div>
              </div>

              <div className="methodes-contact">
                <motion.div className="methode-contact" whileHover={{ y: -5 }}>
                  <a
                    href={`tel:${formatPhoneForLinks(etageVilla.vendeur?.phone)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="phone-link"
                  >
                    <div className="icone-methode telephone">
                      <FaPhone />
                    </div>
                    <div className="info-methode">
                      <h4>Appelez-moi</h4>
                      <p>{etageVilla.vendeur?.phone || "+216 98 765 432"}</p>
                    </div>
                  </a>
                </motion.div>
                <motion.div className="methode-contact" whileHover={{ y: -5 }}>
                  <a
                    href={`https://wa.me/${formatPhoneForLinks(etageVilla.vendeur?.phone)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="whatsapp-link"
                  >
                    <div className="icone-methode whatsapp">
                      <FaWhatsapp />
                    </div>
                    <div className="info-methode">
                      <h4>WhatsApp</h4>
                      <p>Envoyez un message</p>
                    </div>
                  </a>
                </motion.div>
                <motion.div className="methode-contact" whileHover={{ y: -5 }}>
                  <a
                    href={`mailto:${formatEmailForMailto(etageVilla.vendeur?.email)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="email-link"
                  >
                    <div className="icone-methode email">
                      <FaEnvelope />
                    </div>
                    <div className="info-methode">
                      <h4>Email</h4>
                      <p>{etageVilla.vendeur?.email || "contact@immobilier.tn"}</p>
                    </div>
                  </a>
                </motion.div>
              </div>

              <div className="conteneur-formulaire-contact">
                <h3 className="titre-formulaire">Envoyez un message au vendeur</h3>
                <form className="formulaire-contact" onSubmit={handleFormSubmit}>
                  <motion.div
                    className="groupe-formulaire"
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <input
                      type="text"
                      name="name"
                      placeholder="Votre nom complet"
                      value={formData.name}
                      onChange={handleInputChange}
                    />
                    <div className="decoration-input"></div>
                  </motion.div>
                  <motion.div
                    className="groupe-formulaire"
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <input
                      type="email"
                      name="email"
                      placeholder="Votre email"
                      value={formData.email}
                      onChange={handleInputChange}
                    />
                    <div className="decoration-input"></div>
                  </motion.div>
                  <motion.div
                    className="groupe-formulaire"
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <input
                      type="tel"
                      name="phone"
                      placeholder="Votre téléphone"
                      value={formData.phone}
                      onChange={handleInputChange}
                    />
                    <div className="decoration-input"></div>
                  </motion.div>
                  <motion.div
                    className="groupe-formulaire groupe-texte"
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <textarea
                      name="message"
                      placeholder="Votre message"
                      value={formData.message}
                      onChange={handleInputChange}
                    ></textarea>
                    <div className="decoration-input"></div>
                  </motion.div>
                  {formError && <p className="erreur-formulaire">{formError}</p>}
                  {formSuccess && <p className="succes-formulaire">{formSuccess}</p>}
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

              {messages.length > 0 && (
                <div className="historique-messages">
                  <h3>Vos messages</h3>
                  {messages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      className="message"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <p><strong>Vous:</strong> {msg.content}</p>
                      <p><small>Envoyé le: {new Date(msg.timestamp).toLocaleString()}</small></p>
                      {msg.response && (
                        <p><strong>Réponse du vendeur:</strong> {msg.response}</p>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
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

export default DetailEtageVilla;