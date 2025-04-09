import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaUpload, FaUser, FaEnvelope, FaLock, FaMapMarkerAlt,
  FaHome, FaBuilding, FaCity, FaStore, FaRestroom,
  FaKey, FaSwimmingPool, FaTree, FaMountain, FaSnowflake,
  FaParking, FaUsers, FaUtensils, FaShieldAlt,
  FaNetworkWired, FaWifi, FaWater, FaTractor, FaCrow, FaBolt, FaRuler,
  FaDoorOpen, FaChessBoard, FaWarehouse
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

interface Environnement {
  id: number;
  nom: string;
}

interface EnvironnementApp {
  id: number;
  nom: string;
}

interface EnvironnementFerme {
  id: number;
  nom: string;
}

interface InfrastructureFerme {
  id: number;
  nom: string;
  icon: string;
}

interface OrientationFerme {
  id: number;
  nom: string;
}

interface CaracteristiqueBureau {
  id: number;
  nom: string;
}

const VendeurDashboard = () => {
  const navigate = useNavigate();
  const [darkMode] = useState(false);
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
    environnement_id: null as number | null,
    environnementsApp: [] as number[],
    images: [] as File[],
    meuble: false,
    infrastructures: [] as number[],
    vue: '',
    jardin: false,
    piscine: false,
    numero_etage: '', // Changé de 'etage' à 'numero_etage'
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
    wifi: false,
    nbEtages: '',
    superficieJardin: '',
    typeTerrain: '',
    piscinePrivee: false,
    etage: '',
    garage: false,
    cave: false,
    terrasse: false,
    systemeIrrigation: false,
    typeSol: '',
    orientation: '',
    cloture: false,
    puits: false,
    surfaceConstructible: '',
    permisConstruction: false,
    acces_independant: false, // Changé de 'accesIndependant'
    parking_inclus: false
  });

  const [villes, setVilles] = useState<Ville[]>([]);
  const [delegations, setDelegations] = useState<Delegation[]>([]);
  const [categories, setCategories] = useState<Categorie[]>([]);
  const [types, setTypes] = useState<Type[]>([]);
  const [environnements, setEnvironnements] = useState<Environnement[]>([]);
  const [environnementsApp, setEnvironnementsApp] = useState<EnvironnementApp[]>([]);
  const [environnementsFerme, setEnvironnementsFerme] = useState<EnvironnementFerme[]>([]);
  const [infrastructuresFerme, setInfrastructuresFerme] = useState<InfrastructureFerme[]>([]);
  const [orientationsFerme, setOrientationsFerme] = useState<OrientationFerme[]>([]);
  const [caracteristiquesBureaux, setCaracteristiquesBureaux] = useState<CaracteristiqueBureau[]>([]);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const iconStyle = {
    color: '#090536',
    marginRight: '8px',
    fontSize: '1.1em'
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [villesRes, categoriesRes, typesRes, environnementsRes, environnementsAppRes] = await Promise.all([
          axios.get<Ville[]>("http://localhost:8000/api/villes"),
          axios.get<Categorie[]>("http://localhost:8000/api/categories"),
          axios.get<Type[]>("http://localhost:8000/api/types"),
          axios.get<Environnement[]>("http://localhost:8000/api/environnements"),
          axios.get<EnvironnementApp[]>("http://localhost:8000/api/environnementapp")
        ]);

        setVilles(villesRes.data);
        setCategories(categoriesRes.data);
        setTypes(typesRes.data);
        setEnvironnements(environnementsRes.data);
        setEnvironnementsApp(environnementsAppRes.data);
      } catch (error) {
        console.error("Erreur lors du chargement des données", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (formData.typeCategorie === 'bureau') {
      const fetchCaracteristiquesBureaux = async () => {
        try {
          const response = await axios.get<CaracteristiqueBureau[]>("http://localhost:8000/api/caracteristique-bureaux");
          setCaracteristiquesBureaux(response.data);
        } catch (error) {
          console.error("Erreur lors du chargement des caractéristiques des bureaux", error);
        }
      };
      fetchCaracteristiquesBureaux();
    }

    if (formData.typeCategorie === 'ferme') {
      const fetchFermeData = async () => {
        try {
          const [envRes, infraRes, orientRes] = await Promise.all([
            axios.get<EnvironnementFerme[]>("http://localhost:8000/api/environnement-fermes"),
            axios.get<InfrastructureFerme[]>("http://localhost:8000/api/infrastructures"),
            axios.get<OrientationFerme[]>("http://localhost:8000/api/orientations")
          ]);

          setEnvironnementsFerme(envRes.data);
          setInfrastructuresFerme(infraRes.data);
          setOrientationsFerme(orientRes.data);
        } catch (error) {
          console.error("Erreur lors du chargement des données de ferme", error);
        }
      };
      fetchFermeData();
    }
  }, [formData.typeCategorie]);

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

      if (name === 'meuble' || name === 'jardin' || name === 'piscine' || name === 'climatise' ||
        name === 'ascenseur' || name === 'parking' || name === 'salleReunion' ||
        name === 'cuisine' || name === 'securite' || name === 'fibreOptique' ||
        name === 'wifi' || name === 'piscinePrivee' || name === 'garage' ||
        name === 'cave' || name === 'terrasse' || name === 'systemeIrrigation' ||
        name === 'cloture' || name === 'puits' || name === 'permisConstruction' ||
        name === 'accesIndependant' || name === 'parkingInclus') {
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

  const handleInfrastructureChange = (id: number) => {
    setFormData(prev => {
      const newInfrastructures = prev.infrastructures.includes(id)
        ? prev.infrastructures.filter(infraId => infraId !== id)
        : [...prev.infrastructures, id];

      return {
        ...prev,
        infrastructures: newInfrastructures
      };
    });
  };

  const handleEnvironnementChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setFormData({
      ...formData,
      environnement_id: parseInt(value)
    });
  };

  const handleEnvironnementAppChange = (id: number) => {
    setFormData(prev => {
      const newEnvironnements = prev.environnementsApp.includes(id)
        ? prev.environnementsApp.filter(envId => envId !== id)
        : [...prev.environnementsApp, id];

      return {
        ...prev,
        environnementsApp: newEnvironnements
      };
    });
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

  const removeImage = (index: number) => {
    const newPreviews = [...previewImages];
    newPreviews.splice(index, 1);
    setPreviewImages(newPreviews);

    const newImages = [...formData.images];
    newImages.splice(index, 1);
    setFormData({ ...formData, images: newImages });
  };

  const handleSubmit = async (e: React.FormEvent) => {

    e.preventDefault();
    setIsLoading(true);

    try {
      const selectedType = types.find(t =>
        t.nom.toLowerCase().replace(' ', '_') === formData.typeTransaction
      );
      const selectedCategory = categories.find(c =>
        c.nom.toLowerCase().replace(' ', '_') === formData.typeCategorie
      );

      if (!selectedType || !selectedCategory) {
        throw new Error("Type ou catégorie non valide");
      }

      let endpoint = 'http://localhost:8000/api/maisons';
      let typeField = 'type_transaction_id';
      let chambresField = 'nombre_chambres';
      let piecesField = 'nombre_pieces';
      let etageField = 'etage';

      if (formData.typeCategorie === 'appartement') {
        endpoint = 'http://localhost:8000/api/appartements';
      } else if (formData.typeCategorie === 'villa') {
        endpoint = 'http://localhost:8000/api/villas';
        typeField = 'type_id';
        chambresField = 'chambres';
        piecesField = 'pieces';
        etageField = 'etages';
      } else if (formData.typeCategorie === 'bureau') {
        endpoint = 'http://localhost:8000/api/bureaux';
        typeField = 'type_id';
      } else if (formData.typeCategorie === 'ferme') {
        endpoint = 'http://localhost:8000/api/fermes';
        typeField = 'type_id';
      } else if (formData.typeCategorie === 'etage_de_villa') {
        endpoint = 'http://localhost:8000/api/etage-villas';
        typeField = 'type_id';
      }

      const caracteristiquesIds = formData.caracteristiques
        .map((caracName: string) => {
          const found = caracteristiquesBureaux.find(c => c.nom === caracName);
          return found ? found.id : null;
        })
        .filter((id: number | null) => id !== null);

      const getNumericValue = (value: string) => {
        if (!value || isNaN(parseInt(value))) return null;
        return parseInt(value);
      };

      const selectedOrientation = formData.typeCategorie === 'ferme'
        ? orientationsFerme.find(o => o.nom.toLowerCase() === formData.orientation.toLowerCase())
        : null;

      const propertyData: Record<string, any> = {
        [typeField]: selectedType.id,
        categorie_id: selectedCategory.id,
        ville_id: parseInt(formData.ville),
        delegation_id: parseInt(formData.delegation),
        adresse: formData.adresse,
        titre: formData.titre,
        description: formData.description,
        prix: parseFloat(formData.prix),
        superficie: parseInt(formData.superficie),
        annee_construction: getNumericValue(formData.anneeConstruction),
        environnement_id: formData.environnement_id,
        meuble: formData.meuble ? 1 : 0,
      };

      // Ajout des champs spécifiques pour chaque type de propriété
      if (formData.typeCategorie === 'etage_de_villa') {
        propertyData.numero_etage = getNumericValue(formData.numero_etage) ?? 0;
        propertyData.acces_independant = formData.acces_independant ? 1 : 0;
        propertyData.parking_inclus = formData.parking_inclus ? 1 : 0;
        propertyData.annee_construction = getNumericValue(formData.anneeConstruction);
        propertyData.environnement_id = formData.environnement_id;
      } else {
        propertyData[chambresField] = getNumericValue(formData.nbChambres) ?? 0;
        propertyData[piecesField] = getNumericValue(formData.nbPieces) ?? 0;

        if (formData.typeCategorie === 'villa') {
          propertyData[etageField] = getNumericValue(formData.nbEtages);
          propertyData.jardin = formData.jardin ? 1 : 0;
          propertyData.piscine = formData.piscine ? 1 : 0;
          propertyData.piscine_privee = formData.piscinePrivee ? 1 : 0;
          propertyData.garage = formData.garage ? 1 : 0;
          propertyData.cave = formData.cave ? 1 : 0;
          propertyData.terrasse = formData.terrasse ? 1 : 0;
          propertyData.superficie_jardin = getNumericValue(formData.superficieJardin);
        } else if (formData.typeCategorie === 'appartement') {
          propertyData[etageField] = getNumericValue(formData.etage);
          propertyData.superficie_couverte = getNumericValue(formData.superficieCouvert);
          propertyData.environnements_app = formData.environnementsApp;
        } else if (formData.typeCategorie === 'bureau') {
          propertyData.nombre_bureaux = getNumericValue(formData.nbBureaux);
          propertyData.nombre_toilettes = getNumericValue(formData.nbToilettes);
          propertyData.superficie_couverte = getNumericValue(formData.superficieCouvert);
          propertyData.caracteristiques = caracteristiquesIds;
          propertyData.climatise = formData.climatise ? 1 : 0;
          propertyData.ascenseur = formData.ascenseur ? 1 : 0;
          propertyData.parking = formData.parking ? 1 : 0;
          propertyData.salle_reunion = formData.salleReunion ? 1 : 0;
          propertyData.cuisine = formData.cuisine ? 1 : 0;
          propertyData.securite = formData.securite ? 1 : 0;
          propertyData.fibre_optique = formData.fibreOptique ? 1 : 0;
          propertyData.wifi = formData.wifi ? 1 : 0;
        } else if (formData.typeCategorie === 'ferme') {
          if (!selectedOrientation) {
            throw new Error("Veuillez sélectionner une orientation valide");
          }
          propertyData.orientation_id = selectedOrientation.id;
          propertyData.infrastructures = formData.infrastructures;
          propertyData.systeme_irrigation = formData.systemeIrrigation ? 1 : 0;
          propertyData.cloture = formData.cloture ? 1 : 0;
          propertyData.puits = formData.puits ? 1 : 0;
          propertyData.type_terrain = formData.typeTerrain;
          propertyData.type_sol = formData.typeSol;
          propertyData.surface_constructible = getNumericValue(formData.surfaceConstructible);
          propertyData.permis_construction = formData.permisConstruction ? 1 : 0;
        }
      }

      const formDataToSend = new FormData();

      // Ajout des données au FormData
      Object.entries(propertyData).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          if (Array.isArray(value)) {
            value.forEach((item, index) => {
              formDataToSend.append(`${key}[${index}]`, item.toString());
            });
          } else {
            formDataToSend.append(key, value.toString());
          }
        }
      });

      // Ajout des images
      formData.images.forEach((image, index) => {
        formDataToSend.append(`images[${index}]`, image);
      });

      console.log('Envoi des données à:', endpoint, {
        ...Object.fromEntries(formDataToSend),
        images: `${formData.images.length} fichier(s)`
      });

      const response = await axios.post(endpoint, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Accept': 'application/json',
        },
      });

      alert('Annonce créée avec succès !');
      navigate('/');
    } catch (error: any) {
      console.error("Erreur détaillée:", {
        error: error.response?.data || error.message,
        config: error.config
      });
      alert(`Erreur: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsLoading(false);
    }
  };


  const renderSpecificFields = () => {
    console.log("Catégorie sélectionnée:", formData.typeCategorie);

    // Normalisez le nom de la catégorie pour la comparaison
    const normalizedCategory = formData.typeCategorie
      .toLowerCase()
      .replace(/ /g, '_')       // Remplace les espaces par _
      .normalize("NFD").replace(/[\u0300-\u036f]/g, ""); // Supprime les accents

    switch (normalizedCategory) {
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
                min="0"
              />
            </div>
            <div className="property-form__field">
              <label><FaBuilding style={iconStyle} /> Nombre de pièces</label>
              <input
                type="number"
                name="nbPieces"
                value={formData.nbPieces}
                onChange={handleChange}
                min="0"
              />
            </div>
            <div className="property-form__field">
              <label><FaCity style={iconStyle} /> Année de construction</label>
              <input
                type="number"
                name="anneeConstruction"
                value={formData.anneeConstruction}
                onChange={handleChange}
                min="1900"
                max={new Date().getFullYear()}
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
              <div className="property-form__radio-group">
                {environnements.map(env => (
                  <label key={env.id} className="radio-label">
                    <input
                      type="radio"
                      name="environnement"
                      value={env.id}
                      onChange={handleEnvironnementChange}
                      checked={formData.environnement_id === env.id}
                      required
                    />
                    <span className="radio-custom"></span>
                    {env.nom}
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
                <div className="property-form__field">
                  <label><FaBuilding style={iconStyle} /> Nombre d'étages</label>
                  <input
                    type="number"
                    name="nbEtages"
                    value={formData.nbEtages}
                    onChange={handleChange}
                    min="0"
                  />
                </div>
                <div className="property-form__field">
                  <label><FaTree style={iconStyle} /> Superficie du jardin (m²)</label>
                  <input
                    type="number"
                    name="superficieJardin"
                    value={formData.superficieJardin}
                    onChange={handleChange}
                    min="0"
                  />
                </div>
                <div className="property-form__field">
                  <label><FaSwimmingPool style={iconStyle} /> Piscine privée</label>
                  <input
                    type="checkbox"
                    name="piscinePrivee"
                    checked={formData.piscinePrivee}
                    onChange={handleChange}
                  />
                </div>
                <div className="property-form__field">
                  <label><FaParking style={iconStyle} /> Garage</label>
                  <input
                    type="checkbox"
                    name="garage"
                    checked={formData.garage}
                    onChange={handleChange}
                  />
                </div>
                <div className="property-form__field">
                  <label><FaWarehouse style={iconStyle} /> Cave</label>
                  <input
                    type="checkbox"
                    name="cave"
                    checked={formData.cave}
                    onChange={handleChange}
                  />
                </div>
                <div className="property-form__field">
                  <label><FaHome style={iconStyle} /> Terrasse</label>
                  <input
                    type="checkbox"
                    name="terrasse"
                    checked={formData.terrasse}
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
                min="0"
              />
            </div>

            <div className="property-form__field">
              <label><FaBuilding style={iconStyle} /> Étage</label>
              <input
                type="number"
                name="etage"
                value={formData.etage}
                onChange={handleChange}
                min="0"
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
              <label><FaTree style={iconStyle} /> Environnement (Plusieurs choix possibles)</label>
              <div className="property-form__checkbox-group">
                {environnementsApp.map(env => (
                  <label key={env.id} className="checkbox-label">
                    <input
                      type="checkbox"
                      name={`environnement_app_${env.id}`}
                      checked={formData.environnementsApp.includes(env.id)}
                      onChange={() => handleEnvironnementAppChange(env.id)}
                    />
                    <span className="checkbox-custom"></span>
                    {env.nom}
                  </label>
                ))}
              </div>
            </div>
          </>
        );
      case 'ferme':
        return (
          <>
            <div className="property-form__field infrastructure-section">
              <label className="section-title"><FaBuilding style={iconStyle} /> Infrastructures</label>
              <div className="property-form__checkbox-group enlarged-content">
                {infrastructuresFerme.map(infra => {
                  const getInfrastructureIcon = (name: string) => {
                    if (name.includes('Eau')) return FaWater;
                    if (name.includes('Électricité')) return FaBolt;
                    if (name.includes('irrigation')) return FaTractor;
                    if (name.includes('traite')) return FaCrow;
                    if (name.includes('Silo')) return FaWarehouse;
                    return FaBuilding;
                  };

                  const IconComponent = getInfrastructureIcon(infra.nom);

                  return (
                    <label key={infra.id} className="infrastructure-item">
                      <input
                        type="checkbox"
                        name={`infrastructure_${infra.id}`}
                        checked={formData.infrastructures.includes(infra.id)}
                        onChange={() => handleInfrastructureChange(infra.id)}
                      />
                      <IconComponent className="enlarged-icon" />
                      <span className="enlarged-text">{infra.nom}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="property-form__field">
              <label><FaTree style={iconStyle} /> Orientation</label>
              <select
                name="orientation"
                value={formData.orientation}
                onChange={handleChange}
              >
                <option value="">Sélectionnez...</option>
                {orientationsFerme.map(orientation => (
                  <option key={orientation.id} value={orientation.nom.toLowerCase()}>
                    {orientation.nom}
                  </option>
                ))}
              </select>
            </div>
            <div className="property-form__field">
              <label><FaTree style={iconStyle} /> Environnement</label>
              <div className="property-form__radio-group">
                {environnementsFerme.map(env => (
                  <label key={env.id} className="radio-label">
                    <input
                      type="radio"
                      name="environnement"
                      value={env.id}
                      onChange={handleEnvironnementChange}
                      checked={formData.environnement_id === env.id}
                      required
                    />
                    <span className="radio-custom"></span>
                    {env.nom}
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
                min="0"
              />
            </div>
            <div className="property-form__field">
              <label><FaRestroom style={iconStyle} /> Nombre de toilettes</label>
              <input
                type="number"
                name="nbToilettes"
                value={formData.nbToilettes}
                onChange={handleChange}
                min="0"
              />
            </div>

            {caracteristiquesBureaux.length > 0 && (
              <div className="property-form__field">
                <label><FaBuilding style={iconStyle} /> Caractéristiques</label>
                <div className="property-form__checkbox-group">
                  {caracteristiquesBureaux.map(caracteristique => {
                    let IconComponent = FaBuilding;

                    if (caracteristique.nom.includes('Climatisé')) IconComponent = FaSnowflake;
                    else if (caracteristique.nom.includes('Ascenseur')) IconComponent = FaBuilding;
                    else if (caracteristique.nom.includes('Parking')) IconComponent = FaParking;
                    else if (caracteristique.nom.includes('Salle')) IconComponent = FaUsers;
                    else if (caracteristique.nom.includes('Cuisine')) IconComponent = FaUtensils;
                    else if (caracteristique.nom.includes('Sécurité')) IconComponent = FaShieldAlt;
                    else if (caracteristique.nom.includes('Fibre')) IconComponent = FaNetworkWired;
                    else if (caracteristique.nom.includes('Wifi')) IconComponent = FaWifi;

                    return (
                      <label key={caracteristique.id}>
                        <input
                          type="checkbox"
                          name={caracteristique.nom}
                          onChange={handleChange}
                          checked={formData.caracteristiques.includes(caracteristique.nom)}
                        /> <IconComponent style={iconStyle} /> {caracteristique.nom}
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="property-form__field">
              <label><FaBuilding style={iconStyle} /> Superficie couverte (m²)</label>
              <input
                type="number"
                name="superficieCouvert"
                value={formData.superficieCouvert}
                onChange={handleChange}
                min="0"
              />
            </div>
            <div className="property-form__field">
              <label><FaTree style={iconStyle} /> Environnement</label>
              <div className="property-form__radio-group">
                {environnements.map(env => (
                  <label key={env.id} className="radio-label">
                    <input
                      type="radio"
                      name="environnement"
                      value={env.id}
                      onChange={handleEnvironnementChange}
                      checked={formData.environnement_id === env.id}
                      required
                    />
                    <span className="radio-custom"></span>
                    {env.nom}
                  </label>
                ))
                }
              </div>
            </div>
          </>
        );
      case 'etage_de_villa':
        return (
          <>
            <div className="property-form__field">
              <label><FaBuilding style={iconStyle} /> Numéro d'étage</label>
              <input
                type="number"
                name="numero_etage"
                value={formData.numero_etage}
                onChange={handleChange}
                min="0"
                required
              />
            </div>
            <div className="property-form__field">
              <label><FaDoorOpen style={iconStyle} /> Accès indépendant</label>
              <input
                type="checkbox"
                name="acces_independant"
                checked={formData.acces_independant}
                onChange={handleChange}
              />
            </div>
            <div className="property-form__field">
              <label><FaParking style={iconStyle} /> Parking inclus</label>
              <input
                type="checkbox"
                name="parking_inclus"
                checked={formData.parking_inclus}
                onChange={handleChange}
              />
            </div>
            <div className="property-form__field">
              <label><FaTree style={iconStyle} /> Environnement</label>
              <div className="property-form__radio-group">
                {environnements.map(env => (
                  <label key={env.id} className="radio-label">
                    <input
                      type="radio"
                      name="environnement"
                      value={env.id}
                      onChange={handleEnvironnementChange}
                      checked={formData.environnement_id === env.id}
                      required
                    />
                    <span className="radio-custom"></span>
                    {env.nom}
                  </label>
                ))}
              </div>
              <div className="property-form__field">
                <label><FaCity style={iconStyle} /> Année de construction</label>
                <input
                  type="number"
                  name="anneeConstruction"
                  value={formData.anneeConstruction}
                  onChange={handleChange}
                  min="1900"
                  max={new Date().getFullYear()}
                />
              </div>
            </div>
          </>
        );
      case 'terrain_constructible':
        return (
          <>
            <div className="property-form__field">
              <label><FaTree style={iconStyle} /> Type de terrain</label>
              <select
                name="typeTerrain"
                value={formData.typeTerrain}
                onChange={handleChange}
              >
                <option value="">Sélectionnez...</option>
                <option value="agricole">Agricole</option>
                <option value="constructible">Constructible</option>
                <option value="forestier">Forestier</option>
                <option value="lotissement">Lotissement</option>
              </select>
            </div>
            <div className="property-form__field">
              <label><FaTree style={iconStyle} /> Type de sol</label>
              <select
                name="typeSol"
                value={formData.typeSol}
                onChange={handleChange}
              >
                <option value="">Sélectionnez...</option>
                <option value="argileux">Argileux</option>
                <option value="sableux">Sableux</option>
                <option value="limoneux">Limoneux</option>
                <option value="pierreux">Pierreux</option>
              </select>
            </div>
            <div className="property-form__field">
              <label><FaRuler style={iconStyle} /> Surface constructible (m²)</label>
              <input
                type="number"
                name="surfaceConstructible"
                value={formData.surfaceConstructible}
                onChange={handleChange}
                min="0"
              />
            </div>
            <div className="property-form__field">
              <label><FaChessBoard style={iconStyle} /> Permis de construction</label>
              <input
                type="checkbox"
                name="permisConstruction"
                checked={formData.permisConstruction}
                onChange={handleChange}
              />
            </div>
            <div className="property-form__field">
              <label><FaTree style={iconStyle} /> Clôturé</label>
              <input
                type="checkbox"
                name="cloture"
                checked={formData.cloture}
                onChange={handleChange}
              />
            </div>

          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`property-dashboard ${darkMode ? 'property-dashboard--dark' : ''}`}>
      <Header />

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
                min="0"
                step="100"
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
                min="1"
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
                      onClick={() => removeImage(index)}
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