import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaUpload, FaUser, FaEnvelope, FaLock, FaMapMarkerAlt, 
  FaHome, FaBuilding, FaCity, FaStore, FaRestroom,
  FaKey, FaSwimmingPool, FaTree, FaMountain, FaSnowflake,
  FaParking, FaUsers, FaUtensils, FaShieldAlt,
  FaNetworkWired, FaWifi
} from 'react-icons/fa';
import axios from 'axios';
import Header from "../../Header";
import Footer from "../../Footer";
import './VendeurDashboard.css';

interface Ville {
  id: number;
  nom: string;
}

interface Delegation {
  id: number;
  nom: string;
}

interface Categorie {
  id: number;
  nom: string;
}

interface Type {
  id: number;
  nom: string;
}

const VendeurDashboard = () => {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);
  const [formData, setFormData] = useState({
    typeTransaction: '',
    typeCategorie: '',
    ville: '',
    delegation: '',
    adresse: '',
    titre: '',
    description: '',
    prix: '',
    superficie: '',
    nbChambres: '',
    nbPieces: '',
    anneeConstruction: '',
    caracteristiques: [] as string[],
    images: [] as File[],
    meuble: false,
    environnement: '',
    eau: false,
    electricite: false,
    vue: '',
    jardin: false,
    piscine: false,
    etage: '',
    superficieCouvert: '',
    climatise: false,
    ascenseur: false,
    parking: false,
    salleReunion: false,
    cuisine: false,
    nbBureaux: '',
    nbToilettes: '',
    securite: false,
    fibreOptique: false,
    wifi: false
  });

  const [villes, setVilles] = useState<Ville[]>([]);
  const [delegations, setDelegations] = useState<Delegation[]>([]);
  const [categories, setCategories] = useState<Categorie[]>([]);
  const [types, setTypes] = useState<Type[]>([]);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const iconStyle = {
    color: '#090536',
    marginRight: '8px',
    fontSize: '1.1em'
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [villesRes, categoriesRes, typesRes] = await Promise.all([
          axios.get<Ville[]>("http://localhost:8000/api/villes"),
          axios.get<Categorie[]>("http://localhost:8000/api/categories"),
          axios.get<Type[]>("http://localhost:8000/api/types")
        ]);
        
        setVilles(villesRes.data);
        setCategories(categoriesRes.data);
        setTypes(typesRes.data);
      } catch (error) {
        console.error("Erreur lors du chargement des données", error);
      }
    };

    fetchData();
  }, []);

  const fetchDelegations = async (villeId: string) => {
    try {
      const response = await axios.get<Delegation[]>(
        `http://localhost:8000/api/delegations/${villeId}`
      );
      setDelegations(response.data);
    } catch (error) {
      console.error("Erreur lors de la récupération des délégations", error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      
      if (name === 'meuble' || name === 'eau' || name === 'electricite' || 
          name === 'jardin' || name === 'piscine' || name === 'climatise' ||
          name === 'ascenseur' || name === 'parking' || name === 'salleReunion' ||
          name === 'cuisine' || name === 'securite' || name === 'fibreOptique' ||
          name === 'wifi') {
        setFormData({
          ...formData,
          [name]: checked
        });
      } else {
        const newCaracteristiques = [...formData.caracteristiques];
        if (checked) {
          newCaracteristiques.push(name);
        } else {
          const index = newCaracteristiques.indexOf(name);
          if (index > -1) {
            newCaracteristiques.splice(index, 1);
          }
        }
        setFormData({
          ...formData,
          caracteristiques: newCaracteristiques
        });
      }
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setFormData({
        ...formData,
        images: [...formData.images, ...files]
      });

      const previews = files.map(file => URL.createObjectURL(file));
      setPreviewImages([...previewImages, ...previews]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const formDataToSend = new FormData();
      
      Object.entries(formData).forEach(([key, value]) => {
        if (key !== 'images' && key !== 'caracteristiques') {
          formDataToSend.append(key, value.toString());
        }
      });
      
      formDataToSend.append('caracteristiques', JSON.stringify(formData.caracteristiques));
      
      formData.images.forEach((image, index) => {
        formDataToSend.append(`images[${index}]`, image);
      });
      
      const response = await axios.post('http://localhost:8000/api/properties', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      alert('Annonce créée avec succès !');
      navigate('/');
    } catch (error) {
      console.error("Erreur lors de l'ajout de la propriété", error);
      alert("Une erreur est survenue lors de la création de l'annonce");
    } finally {
      setIsLoading(false);
    }
  };

  const renderSpecificFields = () => {
    switch (formData.typeCategorie) {
      case 'maison':
      case 'villa':
        return (
          <>
            <div className="property-form__field">
              <label><FaHome style={iconStyle} /> Nombre de chambres</label>
              <input
                type="number"
                name="nbChambres"
                value={formData.nbChambres}
                onChange={handleChange}
              />
            </div>
            <div className="property-form__field">
              <label><FaBuilding style={iconStyle} /> Nombre de pièces</label>
              <input
                type="number"
                name="nbPieces"
                value={formData.nbPieces}
                onChange={handleChange}
              />
            </div>
            <div className="property-form__field">
              <label><FaCity style={iconStyle} /> Année de construction</label>
              <input
                type="number"
                name="anneeConstruction"
                value={formData.anneeConstruction}
                onChange={handleChange}
              />
            </div>
            <div className="property-form__field">
              <label><FaKey style={iconStyle} /> Meublé</label>
              <input
                type="checkbox"
                name="meuble"
                checked={formData.meuble}
                onChange={handleChange}
              />
            </div>
            <div className="property-form__field">
              <label><FaTree style={iconStyle} /> Environnement</label>
              <div className="property-form__checkbox-group">
                {['Zone Commerciale', 'Centre-ville', 'Résidentiel', 'Zone d\'activité'].map(env => (
                  <label key={env}>
                    <input
                      type="checkbox"
                      name={env}
                      onChange={handleChange}
                      checked={formData.caracteristiques.includes(env)}
                    /> {env}
                  </label>
                ))}
              </div>
            </div>
            {formData.typeCategorie === 'villa' && (
              <>
                <div className="property-form__field">
                  <label><FaTree style={iconStyle} /> Jardin</label>
                  <input
                    type="checkbox"
                    name="jardin"
                    checked={formData.jardin}
                    onChange={handleChange}
                  />
                </div>
                <div className="property-form__field">
                  <label><FaSwimmingPool style={iconStyle} /> Piscine</label>
                  <input
                    type="checkbox"
                    name="piscine"
                    checked={formData.piscine}
                    onChange={handleChange}
                  />
                </div>
              </>
            )}
          </>
        );
      case 'appartement':
        return (
          <>
            <div className="property-form__field">
              <label><FaBuilding style={iconStyle} /> Superficie Couvert (m²)</label>
              <input
                type="number"
                name="superficieCouvert"
                value={formData.superficieCouvert}
                onChange={handleChange}
              />
            </div>
            <div className="property-form__field">
              <label><FaBuilding style={iconStyle} /> Étage</label>
              <input
                type="number"
                name="etage"
                value={formData.etage}
                onChange={handleChange}
              />
            </div>
            <div className="property-form__field">
              <label><FaKey style={iconStyle} /> Meublé</label>
              <input
                type="checkbox"
                name="meuble"
                checked={formData.meuble}
                onChange={handleChange}
              />
            </div>
          </>
        );
      case 'ferme':
        return (
          <>
            <div className="property-form__field">
              <label><FaTree style={iconStyle} /> Infrastructures</label>
              <div className="property-form__checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    name="eau"
                    checked={formData.eau}
                    onChange={handleChange}
                  /> Eau : Réseau Existant
                </label>
                <label>
                  <input
                    type="checkbox"
                    name="electricite"
                    checked={formData.electricite}
                    onChange={handleChange}
                  /> Électricité : Réseau Existant
                </label>
              </div>
            </div>
            <div className="property-form__field">
              <label><FaMountain style={iconStyle} /> Vue</label>
              <div className="property-form__checkbox-group">
                {['Campagne', 'Colline'].map(vue => (
                  <label key={vue}>
                    <input
                      type="checkbox"
                      name={vue}
                      onChange={handleChange}
                      checked={formData.caracteristiques.includes(vue)}
                    /> {vue}
                  </label>
                ))}
              </div>
            </div>
          </>
        );
      case 'bureau':
        return (
          <>
            <div className="property-form__field">
              <label><FaBuilding style={iconStyle} /> Nombre de bureaux</label>
              <input
                type="number"
                name="nbBureaux"
                value={formData.nbBureaux}
                onChange={handleChange}
              />
            </div>
            <div className="property-form__field">
              <label><FaRestroom style={iconStyle} /> Nombre de toilettes</label>
              <input
                type="number"
                name="nbToilettes"
                value={formData.nbToilettes}
                onChange={handleChange}
              />
            </div>
            <div className="property-form__field">
              <label><FaBuilding style={iconStyle} /> Caractéristiques</label>
              <div className="property-form__checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    name="climatise"
                    checked={formData.climatise}
                    onChange={handleChange}
                  /> <FaSnowflake style={iconStyle} /> Climatisé
                </label>
                <label>
                  <input
                    type="checkbox"
                    name="ascenseur"
                    checked={formData.ascenseur}
                    onChange={handleChange}
                  /> Ascenseur
                </label>
                <label>
                  <input
                    type="checkbox"
                    name="parking"
                    checked={formData.parking}
                    onChange={handleChange}
                  /> <FaParking style={iconStyle} /> Parking
                </label>
                <label>
                  <input
                    type="checkbox"
                    name="salleReunion"
                    checked={formData.salleReunion}
                    onChange={handleChange}
                  /> <FaUsers style={iconStyle} /> Salle de réunion
                </label>
                <label>
                  <input
                    type="checkbox"
                    name="cuisine"
                    checked={formData.cuisine}
                    onChange={handleChange}
                  /> <FaUtensils style={iconStyle} /> Cuisine équipée
                </label>
                <label>
                  <input
                    type="checkbox"
                    name="securite"
                    checked={formData.securite}
                    onChange={handleChange}
                  /> <FaShieldAlt style={iconStyle} /> Sécurité 24/7
                </label>
                <label>
                  <input
                    type="checkbox"
                    name="fibreOptique"
                    checked={formData.fibreOptique}
                    onChange={handleChange}
                  /> <FaNetworkWired style={iconStyle} /> Fibre optique
                </label>
                <label>
                  <input
                    type="checkbox"
                    name="wifi"
                    checked={formData.wifi}
                    onChange={handleChange}
                  /> <FaWifi style={iconStyle} /> Wifi haut débit
                </label>
              </div>
            </div>
            <div className="property-form__field">
              <label><FaBuilding style={iconStyle} /> Superficie couverte (m²)</label>
              <input
                type="number"
                name="superficieCouvert"
                value={formData.superficieCouvert}
                onChange={handleChange}
              />
            </div>
          </>
        );
      case 'etage_villa':
        return (
          <>
            <div className="property-form__field">
              <label>Environnement</label>
              <div className="property-form__checkbox-group">
                {['Centre-ville', 'Zone d\'activité'].map(env => (
                  <label key={env}>
                    <input
                      type="checkbox"
                      name={env}
                      onChange={handleChange}
                      checked={formData.caracteristiques.includes(env)}
                    /> {env}
                  </label>
                ))}
              </div>
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`property-dashboard ${darkMode ? 'property-dashboard--dark' : ''}`}>
      <Header  />
      
      <div className="property-dashboard__content">
        <h1 className="property-dashboard__title">
          <FaKey style={iconStyle} /> Ajouter une nouvelle propriété
        </h1>
        
        <form onSubmit={handleSubmit} className="property-form">
          <div className="property-form__section">
            <h2 className="property-form__section-title">
              <FaHome style={iconStyle} /> Informations de base
            </h2>
            
            <div className="property-form__field">
              <label><FaBuilding style={iconStyle} /> Type de transaction</label>
              <select
                name="typeTransaction"
                value={formData.typeTransaction}
                onChange={handleChange}
                required
              >
                <option value="">Sélectionnez...</option>
                {types.map(type => (
                  <option key={type.id} value={type.nom.toLowerCase().replace(' ', '_')}>
                    {type.nom}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="property-form__field">
              <label><FaBuilding style={iconStyle} /> Type de catégorie</label>
              <select
                name="typeCategorie"
                value={formData.typeCategorie}
                onChange={handleChange}
                required
              >
                <option value="">Sélectionnez...</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.nom.toLowerCase().replace(' ', '_')}>
                    {cat.nom}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="property-form__field">
              <label><FaCity style={iconStyle} /> Ville</label>
              <select
                name="ville"
                value={formData.ville}
                onChange={(e) => {
                  handleChange(e);
                  fetchDelegations(e.target.value);
                }}
                required
              >
                <option value="">Sélectionnez une ville</option>
                {villes.map(ville => (
                  <option key={ville.id} value={ville.id}>{ville.nom}</option>
                ))}
              </select>
            </div>
            
            <div className="property-form__field">
              <label><FaMapMarkerAlt style={iconStyle} /> Délégation</label>
              <select
                name="delegation"
                value={formData.delegation}
                onChange={handleChange}
                required
                disabled={!formData.ville}
              >
                <option value="">Sélectionnez une délégation</option>
                {delegations.map(deleg => (
                  <option key={deleg.id} value={deleg.id}>{deleg.nom}</option>
                ))}
              </select>
            </div>
            
            <div className="property-form__field">
              <label><FaMapMarkerAlt style={iconStyle} /> Adresse</label>
              <input
                type="text"
                name="adresse"
                value={formData.adresse}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="property-form__field">
              <label><FaUser style={iconStyle} /> Titre de l'annonce</label>
              <input
                type="text"
                name="titre"
                value={formData.titre}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="property-form__field">
              <label><FaEnvelope style={iconStyle} /> Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={5}
                required
              />
            </div>
            
            <div className="property-form__field">
              <label><FaLock style={iconStyle} /> Prix (DT)</label>
              <input
                type="number"
                name="prix"
                value={formData.prix}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="property-form__field">
              <label><FaStore style={iconStyle} /> Superficie (m²)</label>
              <input
                type="number"
                name="superficie"
                value={formData.superficie}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          
          <div className="property-form__section">
            <h2 className="property-form__section-title">
              <FaTree style={iconStyle} /> Caractéristiques spécifiques
            </h2>
            {renderSpecificFields()}
          </div>
          
          <div className="property-form__section">
            <h2 className="property-form__section-title">
              <FaSwimmingPool style={iconStyle} /> Images
            </h2>
            <div className="property-form__field">
              <label className="property-form__file-upload">
                <FaUpload style={iconStyle} /> Télécharger des images
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  className="property-form__file-input"
                />
              </label>
              <div className="property-form__image-previews">
                {previewImages.map((src, index) => (
                  <div key={index} className="property-form__image-preview">
                    <img src={src} alt={`Preview ${index}`} />
                    <button 
                      type="button" 
                      className="property-form__image-remove"
                      onClick={() => {
                        const newPreviews = [...previewImages];
                        newPreviews.splice(index, 1);
                        setPreviewImages(newPreviews);
                        
                        const newImages = [...formData.images];
                        newImages.splice(index, 1);
                        setFormData({...formData, images: newImages});
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <button 
            type="submit" 
            className="property-form__submit" 
            disabled={isLoading}
          >
            {isLoading ? 'Publication en cours...' : 'Publier l\'annonce'}
          </button>
        </form>
      </div>
      
      <Footer />
    </div>
  );
};

export default VendeurDashboard;