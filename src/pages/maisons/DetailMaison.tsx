import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import "./DetailMaison.css";
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
  FaCalendarAlt,
  FaTree,
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
} from "react-icons/fa";
import { IoIosArrowForward } from "react-icons/io";

// Interface pour les images
interface Image {
  url: string;
  path: string;
}

// Interface pour le vendeur
interface Vendeur {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  phone?: string;
}

// Interface pour la maison
interface Maison {
  id: number;
  type_transaction_id: number;
  categorie_id: number;
  ville_id: number;
  delegation_id: number;
  adresse: string;
  titre: string;
  description: string;
  prix: number;
  superficie: number;
  nombre_chambres: number;
  nombre_pieces: number;
  annee_construction: number;
  environnement_id: number | null;
  meuble: boolean;
  images: Image[];
  type_transaction?: { id: number; nom: string };
  categorie?: { id: number; nom: string };
  ville?: { id: number; nom: string };
  delegation?: { id: number; nom: string };
  environnement?: { id: number; nom: string };
  vendeur: Vendeur | null;
}

// Interface pour les propriétés similaires
interface SimilarProperty {
  id: number;
  titre: string;
  prix: number;
  adresse: string;
  ville: string;
  nombre_chambres: number;
  superficie: number;
  nombre_pieces: number;
  image: string;
}

// Interface pour les messages
interface Message {
  id: number;
  senderName: string;
  senderEmail: string;
  senderPhone: string;
  content: string;
  timestamp: string;
  response?: string;
}

// Composant CercleProgression
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
        <circle className="fond-progression" cx="50" cy="50" r={radius} strokeWidth="8" />
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

// Composant principal
const DetailMaison = () => {
  const { id } = useParams<{ id: string }>();
  const [maison, setMaison] = useState<Maison | null>(null);
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
  const [carouselScrollPosition, setCarouselScrollPosition] = useState(0);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -150]);
  const bgGradient = useTransform(scrollYProgress, [0, 1], [0, 90]);

  // Récupération des données de la maison
  useEffect(() => {
    const fetchMaison = async () => {
      try {
        const response = await axios.get<Maison>(`http://localhost:8000/api/maisons/${id}`);
        setMaison(response.data);
        setLoading(false);
      } catch (err) {
        setError("Impossible de charger les détails de la propriété");
        setLoading(false);
      }
    };

    const fetchSimilarProperties = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/api/maisons`);
        // Simulation de propriétés similaires
        const similar = response.data
          .filter((item: Maison) => item.id !== Number(id))
          .slice(0, 4)
          .map((item: Maison) => ({
            id: item.id,
            titre: item.titre,
            prix: item.prix,
            adresse: item.adresse,
            ville: item.ville?.nom || "Non défini",
            nombre_chambres: item.nombre_chambres,
            superficie: item.superficie,
            nombre_pieces: item.nombre_pieces,
            image: item.images[0]?.url || "/placeholder-image.jpg",
          }));
        setSimilarProperties(similar);
      } catch (err) {
        console.error("Erreur lors du chargement des propriétés similaires", err);
      }
    };

    fetchMaison();
    fetchSimilarProperties();
  }, [id]);

  // Gestion du clic sur les miniatures
  const handleThumbnailClick = (index: number) => {
    setActiveImageIndex(index);
  };

  // Gestion des favoris
  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  // Gestion de l'affichage en plein écran
  const openFullScreen = (index: number) => {
    setCurrentFullScreenIndex(index);
    setShowFullScreen(true);
  };

  const closeFullScreen = () => {
    setShowFullScreen(false);
  };

  const navigateFullScreen = (direction: "prev" | "next") => {
    if (!maison) return;

    if (direction === "prev") {
      setCurrentFullScreenIndex((prev) =>
        prev === 0 ? maison.images.length - 1 : prev - 1
      );
    } else {
      setCurrentFullScreenIndex((prev) =>
        prev === maison.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  // Gestion du défilement du carrousel
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

  // Gestion des entrées du formulaire
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Gestion de la soumission du formulaire
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
      // Mock API call to send message
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

  // Format phone number for WhatsApp and tel links
  const formatPhoneForLinks = (phone: string | undefined): string => {
    if (!phone) return ""; // Retourne vide si pas de numéro
    const cleanedPhone = phone.replace(/[^\d+]/g, ""); // Nettoie les caractères non numériques sauf +
    return cleanedPhone.startsWith("+") ? cleanedPhone : `+216${cleanedPhone}`; // Ajoute +216 si nécessaire
  };

  // Format email for mailto links
  const formatEmailForMailto = (email: string | undefined): string => {
    return email || "contact@immobilier.tn"; // Fallback email
  };

  // Validation du numéro de téléphone
  const isValidPhone = (phone: string | undefined): boolean => {
    return !!phone && /^[0-9\s\-\+\(\)]{10,15}$/.test(phone);
  };

  // Gestion du chargement
  if (loading)
    return (
      <motion.div
        className="ecran-chargement"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="spinner-chargement"></div>
        <p>Chargement de la propriété...</p>
      </motion.div>
    );

  // Gestion des erreurs
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

  // Gestion de l'absence de maison
  if (!maison)
    return (
      <motion.div
        className="ecran-non-trouve"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="contenu-non-trouve">
          <h3>Propriété non trouvée</h3>
          <p>La propriété que vous recherchez n'existe pas ou a été supprimée.</p>
          <Link to="/" className="bouton-retour-accueil">
            <FaArrowLeft /> Retour à l'accueil
          </Link>
        </div>
      </motion.div>
    );

  return (
    <div className="detail-maison">
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
            backgroundImage: `url(${maison.images[0]?.url || "/placeholder-image.jpg"})`,
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
            <Link to="/maisons">Propriétés</Link>
            <IoIosArrowForward />
            <span>{maison.titre}</span>
          </motion.div>

          <motion.h1
            className="titre-parallaxe"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 1, ease: "easeOut" }}
          >
            {maison.titre}
          </motion.h1>

          <motion.div
            className="etiquette-localisation"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7, duration: 1, ease: "easeOut" }}
          >
            <FaMapMarkerAlt />
            <span>
              {maison.adresse}, {maison.ville?.nom || "Non défini"} -{" "}
              {maison.delegation?.nom || "Non défini"}
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
          <span className="prix">{maison.prix.toLocaleString()} TND</span>
          {maison.type_transaction?.nom && (
            <span className="type-transaction">{maison.type_transaction.nom}</span>
          )}
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
                  src={maison.images[activeImageIndex]?.url || "/placeholder-image.jpg"}
                  alt={`${maison.titre} ${activeImageIndex + 1}`}
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                  onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                    const target = e.target as HTMLImageElement;
                    target.onerror = null;
                    target.src = "/placeholder-image.jpg";
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

            <div className="controles-galerie">
              <motion.button
                className="bouton-nav precedent"
                onClick={() =>
                  handleThumbnailClick(
                    activeImageIndex === 0 ? maison.images.length - 1 : activeImageIndex - 1
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
                    activeImageIndex === maison.images.length - 1 ? 0 : activeImageIndex + 1
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
            {maison.images.map((image, index) => (
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
                  onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                    const target = e.target as HTMLImageElement;
                    target.onerror = null;
                    target.src = "/placeholder-image.jpg";
                  }}
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
                  {maison.description.split("\n").map((paragraph, i) => (
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
                    <span>Vue panoramique</span>
                  </motion.div>
                  <motion.div className="element-mise-en-valeur" whileHover={{ scale: 1.03 }}>
                    <div className="icone-mise-en-valeur">🌞</div>
                    <span>Exposition Sud</span>
                  </motion.div>
                  <motion.div className="element-mise-en-valeur" whileHover={{ scale: 1.03 }}>
                    <div className="icone-mise-en-valeur">🔇</div>
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
                      value={maison.nombre_chambres * 20}
                      label="Chambres"
                      icon={<FaBed />}
                      count={maison.nombre_chambres}
                    />
                  </div>
                  <div className="element-visuel">
                    <CercleProgression
                      value={Math.min(maison.superficie / 2, 100)}
                      label="Superficie"
                      icon={<FaRulerCombined />}
                      count={`${maison.superficie}m²`}
                    />
                  </div>
                  <div className="element-visuel">
                    <CercleProgression
                      value={maison.nombre_pieces * 15}
                      label="Pièces"
                      icon={<FaHome />}
                      count={maison.nombre_pieces}
                    />
                  </div>
                </div>
              </div>
              <div className="details-caracteristiques">
                <div className="rangee-caracteristiques">
                  <div className="caracteristique">
                    <div className="icone-caracteristique">
                      <FaCalendarAlt />
                    </div>
                    <div className="info-caracteristique">
                      <span className="etiquette-caracteristique">Année de construction</span>
                      <span className="valeur-caracteristique">{maison.annee_construction}</span>
                    </div>
                  </div>
                  <div className="caracteristique">
                    <div className="icone-caracteristique">
                      <FaChair />
                    </div>
                    <div className="info-caracteristique">
                      <span className="etiquette-caracteristique">Meublé</span>
                      <span className="valeur-caracteristique">{maison.meuble ? "Oui" : "Non"}</span>
                    </div>
                  </div>
                </div>
                {maison.environnement && (
                  <div className="caracteristique pleine-largeur">
                    <div className="icone-caracteristique">
                      <FaTree />
                    </div>
                    <div className="info-caracteristique">
                      <span className="etiquette-caracteristique">Environnement</span>
                      <span className="valeur-caracteristique">{maison.environnement.nom}</span>
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
                    src={`https://maps.google.com/maps?q=${maison.ville?.nom},${maison.delegation?.nom}&output=embed`}
                    frameBorder="0"
                    allowFullScreen
                  ></iframe>
                </div>
                <div className="superposition-carte">
                  <FaMapMarkerAlt className="pin-carte" />
                  <div className="infobulle-carte">
                    {maison.adresse}, {maison.ville?.nom}
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
                    <p>{maison.type_transaction?.nom || "Non spécifié"}</p>
                  </div>
                </div>
                <div className="element-info">
                  <div className="icone-info">
                    <FaHome />
                  </div>
                  <div className="texte-info">
                    <h4>Catégorie</h4>
                    <p>{maison.categorie?.nom || "Non spécifié"}</p>
                  </div>
                </div>
                <div className="element-info">
                  <div className="icone-info">
                    <FaMapMarkerAlt />
                  </div>
                  <div className="texte-info">
                    <h4>Localisation</h4>
                    <p>
                      {maison.delegation?.nom}, {maison.ville?.nom}
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
                  <h3>{maison.vendeur ? `${maison.vendeur.prenom} ${maison.vendeur.nom}` : "Vendeur non spécifié"}</h3>
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
                {isValidPhone(maison.vendeur?.phone) ? (
                  <>
                    <motion.div className="methode-contact" whileHover={{ y: -5 }}>
                      <a
                        href={`tel:${formatPhoneForLinks(maison.vendeur?.phone)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="phone-link"
                      >
                        <div className="icone-methode telephone">
                          <FaPhone />
                        </div>
                        <div className="info-methode">
                          <h4>Appelez-moi</h4>
                          <p>{maison.vendeur?.phone}</p>
                        </div>
                      </a>
                    </motion.div>
                    <motion.div className="methode-contact" whileHover={{ y: -5 }}>
                      <a
                        href={`https://wa.me/${formatPhoneForLinks(maison.vendeur?.phone)}`}
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
                  </>
                ) : (
                  <p className="no-phone">Numéro de téléphone non disponible</p>
                )}
                <motion.div className="methode-contact" whileHover={{ y: -5 }}>
                  <a
                    href={`mailto:${formatEmailForMailto(maison.vendeur?.email)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="email-link"
                  >
                    <div className="icone-methode email">
                      <FaEnvelope />
                    </div>
                    <div className="info-methode">
                      <h4>Email</h4>
                      <p>{maison.vendeur?.email || "contact@immobilier.tn"}</p>
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
                src={maison.images[currentFullScreenIndex]?.url || "/placeholder-image.jpg"}
                alt={`Plein écran ${currentFullScreenIndex + 1}`}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                  const target = e.target as HTMLImageElement;
                  target.onerror = null;
                  target.src = "/placeholder-image.jpg";
                }}
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
              {maison.images.map((image, index) => (
                <motion.img
                  key={index}
                  src={image.url}
                  alt={`Miniature ${index + 1}`}
                  className={index === currentFullScreenIndex ? "actif" : ""}
                  onClick={() => setCurrentFullScreenIndex(index)}
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.3 }}
                  onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                    const target = e.target as HTMLImageElement;
                    target.onerror = null;
                    target.src = "/placeholder-image.jpg";
                  }}
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

export default DetailMaison;