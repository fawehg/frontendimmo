import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
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
  
} from "react-icons/fa";

interface Maison {
  type: any;
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
  images: string[];
  type_transaction?: { id: number; nom: string };
  categorie?: { id: number; nom: string };
  ville?: { id: number; nom: string };
  delegation?: { id: number; nom: string };
  environnement?: { id: number; nom: string };
}

const DetailMaison = () => {
  const { id } = useParams<{ id: string }>();
  const [maison, setMaison] = useState<Maison | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeImageIndex, setActiveImageIndex] = useState(0);

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

    fetchMaison();
  }, [id]);

  const handleNextImage = () => {
    if (maison && maison.images) {
      setActiveImageIndex(prev => 
        prev === maison.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const handlePrevImage = () => {
    if (maison && maison.images) {
      setActiveImageIndex(prev => 
        prev === 0 ? maison.images.length - 1 : prev - 1
      );
    }
  };

  if (loading) return <div className="loading-state">Chargement...</div>;
  if (error) return <div className="error-state">{error}</div>;
  if (!maison) return <div className="not-found-state">Propriété non trouvée</div>;

  return (
    <>
      <div className="property-page">
        <Header />
        <div className="property-header">
          <Link to="/" className="return-btn">
            <FaArrowLeft /> Retour
          </Link>
          <h1>{maison.titre}</h1>
          <p className="address">
            <FaMapMarkerAlt /> {maison.adresse}, {maison.ville?.nom} - {maison.delegation?.nom}
          </p>
          <p className="cost">{maison.prix.toLocaleString()} TND</p>
        </div>

        <div className="image-gallery">
          {maison.images && maison.images.length > 0 ? (
            <>
              <div className="primary-image">
                <img 
                  src={`http://localhost:8000/storage/${maison.images[activeImageIndex]}`}
                  alt={`${maison.titre} ${activeImageIndex + 1}`}
                  className="featured-image"
                />
                <button className="image-nav previous" onClick={handlePrevImage}>
                  <FaArrowLeft />
                </button>
                <button className="image-nav following" onClick={handleNextImage}>
                  <FaArrowLeft style={{ transform: 'rotate(180deg)' }} />
                </button>
                <div className="image-tracker">
                  {activeImageIndex + 1}/{maison.images.length}
                </div>
              </div>
              <div className="thumbnails">
                {maison.images.map((image, index) => (
                  <img
                    key={index}
                    src={`http://localhost:8000/storage/${image}`}
                    alt={`Thumbnail ${index + 1}`}
                    className={`mini-image ${index === activeImageIndex ? 'active' : ''}`}
                    onClick={() => setActiveImageIndex(index)}
                  />
                ))}
              </div>
            </>
          ) : (
            <div className="no-image">Pas d'images disponibles</div>
          )}
        </div>

        <div className="content-grid">
          <div className="primary-content">
            <div className="overview">
              <h2><FaHome /> Description</h2>
              <p>{maison.description}</p>
            </div>

            <div className="attributes">
              <h2><FaBuilding /> Caractéristiques</h2>
              <div className="attribute-grid">
                <div className="attribute-item">
                  <FaBed />
                  <div>
                    <span className="attribute-name">Chambres</span>
                    <span className="attribute-value">{maison.nombre_chambres}</span>
                  </div>
                </div>
                
                <div className="attribute-item">
                  <FaRulerCombined />
                  <div>
                    <span className="attribute-name">Superficie</span>
                    <span className="attribute-value">{maison.superficie} m²</span>
                  </div>
                </div>
                <div className="attribute-item">
                  <FaHome />
                  <div>
                    <span className="attribute-name">Pièces</span>
                    <span className="attribute-value">{maison.nombre_pieces}</span>
                  </div>
                </div>
                <div className="attribute-item">
                  <FaCalendarAlt />
                  <div>
                    <span className="attribute-name">Année construction</span>
                    <span className="attribute-value">{maison.annee_construction}</span>
                  </div>
                </div>
                {maison.environnement && (
                  <div className="attribute-item">
                    <FaTree />
                    <div>
                      <span className="attribute-name">Environnement</span>
                      <span className="attribute-value">{maison.environnement.nom}</span>
                    </div>
                  </div>
                )}
                <div className="attribute-item">
                  <FaChair />
                  <div>
                    <span className="attribute-name">Meublé</span>
                    <span className="attribute-value">{maison.meuble ? 'Oui' : 'Non'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="side-panel">
            <div className="info-box">
              <h3><FaCity /> Informations générales</h3>
              <div className="info-list">
                <div className="info-row">
                  <span className="info-key">Type de transaction</span>
                  <span className="info-data">{maison.type_transaction?.nom}</span>
                </div>
                <div className="info-row">
                  <span className="info-key">Catégorie</span>
                  <span className="info-data">{maison.categorie?.nom}</span>
                </div>
                <div className="info-row">
                  <span className="info-key">Ville</span>
                  <span className="info-data">{maison.ville?.nom}</span>
                </div>
                <div className="info-row">
                  <span className="info-key">Délégation</span>
                  <span className="info-data">{maison.delegation?.nom}</span>
                </div>
              </div>
            </div>

            
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default DetailMaison;
