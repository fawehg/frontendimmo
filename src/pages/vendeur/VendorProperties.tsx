import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  FaBed, FaExpand, FaMapMarkerAlt, FaDollarSign, FaImage, FaLayerGroup,
  FaHome, FaCity, FaStore, FaRestroom, FaHotel, FaCalendarAlt,
  FaSwimmingPool, FaTree, FaClipboardList, FaSnowflake,
  FaParking, FaUsers, FaUtensils, FaShieldAlt, FaNetworkWired, FaWifi,
  FaWater, FaTractor, FaCrow, FaBolt, FaRuler, FaTags, FaMapSigns, FaClipboard,
  FaDoorOpen, FaWarehouse, FaUmbrellaBeach, FaSeedling, FaDrawPolygon, FaTools, FaCompass
} from 'react-icons/fa';
import Header from '../../Header';
import Footer from '../../Footer';
import './VendeurDashboard.css'; // Reuse styles from VendeurDashboard

interface Ville { id: number; nom: string; }
interface Delegation { id: number; nom: string; }
interface Categorie { id: number; nom: string; }
interface Type { id: number; nom: string; }
interface Environnement { id: number; nom: string; }
interface EnvironnementApp { id: number; nom: string; }
interface EnvironnementFerme { id: number; nom: string; }
interface InfrastructureFerme { id: number; nom: string; icon: string; }
interface OrientationFerme { id: number; nom: string; }
interface CaracteristiqueBureau { id: number; nom: string; }
interface TypeSol { id: number; nom: string; }
interface TypeTerrain { id: number; nom: string; }

interface Property {
  id: number;
  type: string; // maison, villa, appartement, bureau, ferme, etage_de_villa, terrain_constructible
  titre: string;
  prix: number;
  superficie: number;
  images: string[];
  ville: Ville;
  delegation: Delegation;
  categorie: Categorie;
  type_transaction?: Type;
  type?: Type;
  environnement?: Environnement;
  nombre_chambres?: number;
  nombre_pieces?: number;
  annee_construction?: number;
  meuble?: boolean;
  jardin?: boolean;
  piscine?: boolean;
  etages?: number;
  superficie_jardin?: number;
  piscine_privee?: boolean;
  garage?: boolean;
  cave?: boolean;
  terrasse?: boolean;
  etage?: number;
  superficie_couvert?: number;
  environnements_app?: EnvironnementApp[];
  nombre_bureaux?: number;
  nombre_toilettes?: number;
  climatise?: boolean;
  ascenseur?: boolean;
  parking?: boolean;
  salle_reunion?: boolean;
  cuisine?: boolean;
  securite?: boolean;
  fibre_optique?: boolean;
  wifi?: boolean;
  orientation?: OrientationFerme;
  infrastructures?: InfrastructureFerme[];
  systeme_irrigation?: boolean;
  cloture?: boolean;
  puits?: boolean;
  numero_etage?: number;
  acces_independant?: boolean;
  parking_inclus?: boolean;
  types_terrains_id?: TypeTerrain;
  types_sols_id?: TypeSol;
  surface_constructible?: number;
  permis_construction?: boolean;
}

const VendorProperties = () => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<any>({});
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
  const [typesSol, setTypesSol] = useState<TypeSol[]>([]);
  const [typesTerrain, setTypesTerrain] = useState<TypeTerrain[]>([]);
  const [previewImages, setPreviewImages] = useState<string[]>([]);

  const iconStyle = {
    color: '#090536',
    marginRight: '8px',
    fontSize: '1.6em'
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Utilisateur non authentifié');

        const endpoints = [
          'maisons', 'villas', 'appartements', 'bureaux', 'fermes', 'etage-villas', 'terrains'
        ];
        const allProperties: Property[] = [];

        for (const endpoint of endpoints) {
          const response = await axios.get(`http://localhost:8000/api/${endpoint}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          allProperties.push(...response.data.map((item: any) => ({ ...item, type: endpoint.replace('-', '_') })));
        }

        setProperties(allProperties);

        const [
          villesRes, categoriesRes, typesRes, environnementsRes,
          environnementsAppRes, environnementsFermeRes, infrastructuresFermeRes,
          orientationsFermeRes, caracteristiquesBureauxRes, typesSolRes, typesTerrainRes
        ] = await Promise.all([
          axios.get<Ville[]>("http://localhost:8000/api/villes", { headers: { Authorization: `Bearer ${token}` } }),
          axios.get<Categorie[]>("http://localhost:8000/api/categories", { headers: { Authorization: `Bearer ${token}` } }),
          axios.get<Type[]>("http://localhost:8000/api/types", { headers: { Authorization: `Bearer ${token}` } }),
          axios.get<Environnement[]>("http://localhost:8000/api/environnements", { headers: { Authorization: `Bearer ${token}` } }),
          axios.get<EnvironnementApp[]>("http://localhost:8000/api/environnementapp", { headers: { Authorization: `Bearer ${token}` } }),
          axios.get<EnvironnementFerme[]>("http://localhost:8000/api/environnement-fermes", { headers: { Authorization: `Bearer ${token}` } }),
          axios.get<InfrastructureFerme[]>("http://localhost:8000/api/infrastructures", { headers: { Authorization: `Bearer ${token}` } }),
          axios.get<OrientationFerme[]>("http://localhost:8000/api/orientations", { headers: { Authorization: `Bearer ${token}` } }),
          axios.get<CaracteristiqueBureau[]>("http://localhost:8000/api/caracteristique-bureaux", { headers: { Authorization: `Bearer ${token}` } }),
          axios.get<TypeSol[]>("http://localhost:8000/api/types-sols", { headers: { Authorization: `Bearer ${token}` } }),
          axios.get<TypeTerrain[]>("http://localhost:8000/api/types-terrains", { headers: { Authorization: `Bearer ${token}` } })
        ]);

        setVilles(villesRes.data);
        setCategories(categoriesRes.data);
        setTypes(typesRes.data);
        setEnvironnements(environnementsRes.data);
        setEnvironnementsApp(environnementsAppRes.data);
        setEnvironnementsFerme(environnementsFermeRes.data);
        setInfrastructuresFerme(infrastructuresFermeRes.data);
        setOrientationsFerme(orientationsFermeRes.data);
        setCaracteristiquesBureaux(caracteristiquesBureauxRes.data);
        setTypesSol(typesSolRes.data);
        setTypesTerrain(typesTerrainRes.data);
      } catch (err: any) {
        setError(err.message || 'Erreur lors du chargement des données');
        navigate('/login');
      }
    };

    fetchData();
  }, [navigate]);

  const fetchDelegations = async (villeId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Utilisateur non authentifié');
      const response = await axios.get<Delegation[]>(`http://localhost:8000/api/delegations/${villeId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDelegations(response.data);
    } catch (err) {
      console.error('Erreur lors de la récupération des délégations', err);
    }
  };

  const handleView = async (property: Property) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Utilisateur non authentifié');
      const response = await axios.get(`http://localhost:8000/api/${property.type}/${property.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSelectedProperty(response.data);
      setEditMode(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du chargement des détails');
    }
  };

  const handleEdit = (property: Property) => {
    setSelectedProperty(property);
    setEditMode(true);
    setFormData({
      titre: property.titre,
      description: property.description || '',
      prix: property.prix,
      superficie: property.superficie,
      ville: property.ville?.id || '',
      delegation: property.delegation?.id || '',
      categorie_id: property.categorie?.id || '',
      type_transaction_id: property.type_transaction?.id || property.type?.id || '',
      environnement_id: property.environnement?.id || null,
      images: [],
      meuble: property.meuble || false,
      nombre_chambres: property.nombre_chambres || '',
      nombre_pieces: property.nombre_pieces || '',
      annee_construction: property.annee_construction || '',
      jardin: property.jardin || false,
      piscine: property.piscine || false,
      etages: property.etages || '',
      superficie_jardin: property.superficie_jardin || '',
      piscine_privee: property.piscine_privee || false,
      garage: property.garage || false,
      cave: property.cave || false,
      terrasse: property.terrasse || false,
      etage: property.etage || '',
      superficie_couvert: property.superficie_couvert || '',
      environnements_app: property.environnements_app?.map(e => e.id) || [],
      nombre_bureaux: property.nombre_bureaux || '',
      nombre_toilettes: property.nombre_toilettes || '',
      climatise: property.climatise || false,
      ascenseur: property.ascenseur || false,
      parking: property.parking || false,
      salle_reunion: property.salle_reunion || false,
      cuisine: property.cuisine || false,
      securite: property.securite || false,
      fibre_optique: property.fibre_optique || false,
      wifi: property.wifi || false,
      orientation: property.orientation?.nom || '',
      infrastructures: property.infrastructures?.map(i => i.id) || [],
      systeme_irrigation: property.systeme_irrigation || false,
      cloture: property.cloture || false,
      puits: property.puits || false,
      numero_etage: property.numero_etage || '',
      acces_independant: property.acces_independant || false,
      parking_inclus: property.parking_inclus || false,
      types_terrains_id: property.types_terrains_id?.id || '',
      types_sols_id: property.types_sols_id?.id || '',
      surface_constructible: property.surface_constructible || '',
      permis_construction: property.permis_construction || false
    });
    setPreviewImages(property.images.map(img => `http://localhost:8000/storage/${img}`));
    if (property.ville?.id) fetchDelegations(property.ville.id.toString());
  };

  const handleDelete = async (property: Property) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette annonce ?')) return;
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Utilisateur non authentifié');
      await axios.delete(`http://localhost:8000/api/${property.type}/${property.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProperties(properties.filter(p => p.id !== property.id || p.type !== property.type));
      setSelectedProperty(null);
      alert('Annonce supprimée avec succès');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la suppression');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev: any) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev: any) => ({ ...prev, [name]: value }));
      if (name === 'ville') fetchDelegations(value);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setFormData((prev: any) => ({ ...prev, images: files }));
      const previews = files.map(file => URL.createObjectURL(file));
      setPreviewImages(previews);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProperty) return;
    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Utilisateur non authentifié');

      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          if (Array.isArray(value) && key !== 'images') {
            value.forEach((item, index) => formDataToSend.append(`${key}[${index}]`, item.toString()));
          } else if (key !== 'images') {
            formDataToSend.append(key, value.toString());
          }
        }
      });

      formData.images.forEach((image: File, index: number) => {
        formDataToSend.append(`images[${index}]`, image);
      });

      const response = await axios.put(`http://localhost:8000/api/${selectedProperty.type}/${selectedProperty.id}`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });

      setProperties(properties.map(p => (p.id === selectedProperty.id && p.type === selectedProperty.type ? response.data : p)));
      setSelectedProperty(null);
      setEditMode(false);
      alert('Annonce mise à jour avec succès');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la mise à jour');
    } finally {
      setIsLoading(false);
    }
  };

  const renderSpecificFields = () => {
    if (!selectedProperty) return null;
    const type = selectedProperty.type;

    switch (type) {
      case 'maisons':
      case 'villas':
        return (
          <>
            <div className="property-form__field">
              <label><FaHotel style={iconStyle} /> Nombre de chambres</label>
              <input type="number" name="nombre_chambres" value={formData.nombre_chambres} onChange={handleChange} min="0" />
            </div>
            <div className="property-form__field">
              <label><FaLayerGroup style={iconStyle} /> Nombre de pièces</label>
              <input type="number" name="nombre_pieces" value={formData.nombre_pieces} onChange={handleChange} min="0" />
            </div>
            <div className="property-form__field">
              <label><FaCalendarAlt style={iconStyle} /> Année de construction</label>
              <input type="number" name="annee_construction" value={formData.annee_construction} onChange={handleChange} min="1900" max={new Date().getFullYear()} />
            </div>
            <div className="property-form__field">
              <label><FaBed style={iconStyle} /> Meublé</label>
              <input type="checkbox" name="meuble" checked={formData.meuble} onChange={handleChange} />
            </div>
            <div className="property-form__field">
              <label><FaTags style={iconStyle} /> Environnement</label>
              <select name="environnement_id" value={formData.environnement_id || ''} onChange={handleChange}>
                <option value="">Sélectionnez...</option>
                {environnements.map(env => (
                  <option key={env.id} value={env.id}>{env.nom}</option>
                ))}
              </select>
            </div>
            {type === 'villas' && (
              <>
                <div className="property-form__field">
                  <label><FaTree style={iconStyle} /> Jardin</label>
                  <input type="checkbox" name="jardin" checked={formData.jardin} onChange={handleChange} />
                </div>
                <div className="property-form__field">
                  <label><FaSwimmingPool style={iconStyle} /> Piscine</label>
                  <input type="checkbox" name="piscine" checked={formData.piscine} onChange={handleChange} />
                </div>
                <div className="property-form__field">
                  <label><FaLayerGroup style={iconStyle} /> Nombre d'étages</label>
                  <input type="number" name="etages" value={formData.etages} onChange={handleChange} min="0" />
                </div>
                <div className="property-form__field">
                  <label><FaTree style={iconStyle} /> Superficie du jardin (m²)</label>
                  <input type="number" name="superficie_jardin" value={formData.superficie_jardin} onChange={handleChange} min="0" />
                </div>
                <div className="property-form__field">
                  <label><FaSwimmingPool style={iconStyle} /> Piscine privée</label>
                  <input type="checkbox" name="piscine_privee" checked={formData.piscine_privee} onChange={handleChange} />
                </div>
                <div className="property-form__field">
                  <label><FaParking style={iconStyle} /> Garage</label>
                  <input type="checkbox" name="garage" checked={formData.garage} onChange={handleChange} />
                </div>
                <div className="property-form__field">
                  <label><FaWarehouse style={iconStyle} /> Cave</label>
                  <input type="checkbox" name="cave" checked={formData.cave} onChange={handleChange} />
                </div>
                <div className="property-form__field">
                  <label><FaUmbrellaBeach style={iconStyle} /> Terrasse</label>
                  <input type="checkbox" name="terrasse" checked={formData.terrasse} onChange={handleChange} />
                </div>
              </>
            )}
          </>
        );
      case 'appartements':
        return (
          <>
            <div className="property-form__field">
              <label><FaExpand style={iconStyle} /> Superficie couverte (m²)</label>
              <input type="number" name="superficie_couvert" value={formData.superficie_couvert} onChange={handleChange} min="0" />
            </div>
            <div className="property-form__field">
              <label><FaLayerGroup style={iconStyle} /> Étage</label>
              <input type="number" name="etage" value={formData.etage} onChange={handleChange} min="0" />
            </div>
            <div className="property-form__field">
              <label><FaBed style={iconStyle} /> Meublé</label>
              <input type="checkbox" name="meuble" checked={formData.meuble} onChange={handleChange} />
            </div>
            <div className="property-form__field">
              <label><FaTags style={iconStyle} /> Environnements</label>
              <div className="property-form__checkbox-group">
                {environnementsApp.map(env => (
                  <label key={env.id} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.environnements_app.includes(env.id)}
                      onChange={() => {
                        setFormData((prev: any) => ({
                          ...prev,
                          environnements_app: prev.environnements_app.includes(env.id)
                            ? prev.environnements_app.filter((id: number) => id !== env.id)
                            : [...prev.environnements_app, env.id]
                        }));
                      }}
                    />
                    <span className="checkbox-custom"></span>
                    {env.nom}
                  </label>
                ))}
              </div>
            </div>
          </>
        );
      case 'bureaux':
        return (
          <>
            <div className="property-form__field">
              <label><FaStore style={iconStyle} /> Nombre de bureaux</label>
              <input type="number" name="nombre_bureaux" value={formData.nombre_bureaux} onChange={handleChange} min="0" />
            </div>
            <div className="property-form__field">
              <label><FaRestroom style={iconStyle} /> Nombre de toilettes</label>
              <input type="number" name="nombre_toilettes" value={formData.nombre_toilettes} onChange={handleChange} min="0" />
            </div>
            <div className="property-form__field">
              <label><FaExpand style={iconStyle} /> Superficie couverte (m²)</label>
              <input type="number" name="superficie_couverte" value={formData.superficie_couverte} onChange={handleChange} min="0" />
            </div>
            <div className="property-form__field">
              <label><FaSnowflake style={iconStyle} /> Climatisé</label>
              <input type="checkbox" name="climatise" checked={formData.climatise} onChange={handleChange} />
            </div>
            <div className="property-form__field">
              <label><FaBuilding style={iconStyle} /> Ascenseur</label>
              <input type="checkbox" name="ascenseur" checked={formData.ascenseur} onChange={handleChange} />
            </div>
            <div className="property-form__field">
              <label><FaParking style={iconStyle} /> Parking</label>
              <input type="checkbox" name="parking" checked={formData.parking} onChange={handleChange} />
            </div>
            <div className="property-form__field">
              <label><FaUsers style={iconStyle} /> Salle de réunion</label>
              <input type="checkbox" name="salle_reunion" checked={formData.salle_reunion} onChange={handleChange} />
            </div>
            <div className="property-form__field">
              <label><FaUtensils style={iconStyle} /> Cuisine</label>
              <input type="checkbox" name="cuisine" checked={formData.cuisine} onChange={handleChange} />
            </div>
            <div className="property-form__field">
              <label><FaShieldAlt style={iconStyle} /> Sécurité</label>
              <input type="checkbox" name="securite" checked={formData.securite} onChange={handleChange} />
            </div>
            <div className="property-form__field">
              <label><FaNetworkWired style={iconStyle} /> Fibre optique</label>
              <input type="checkbox" name="fibre_optique" checked={formData.fibre_optique} onChange={handleChange} />
            </div>
            <div className="property-form__field">
              <label><FaWifi style={iconStyle} /> WiFi</label>
              <input type="checkbox" name="wifi" checked={formData.wifi} onChange={handleChange} />
            </div>
            <div className="property-form__field">
              <label><FaTags style={iconStyle} /> Environnement</label>
              <select name="environnement_id" value={formData.environnement_id || ''} onChange={handleChange}>
                <option value="">Sélectionnez...</option>
                {environnements.map(env => (
                  <option key={env.id} value={env.id}>{env.nom}</option>
                ))}
              </select>
            </div>
          </>
        );
      case 'fermes':
        return (
          <>
            <div className="property-form__field">
              <label><FaCompass style={iconStyle} /> Orientation</label>
              <select name="orientation" value={formData.orientation} onChange={handleChange}>
                <option value="">Sélectionnez...</option>
                {orientationsFerme.map(orient => (
                  <option key={orient.id} value={orient.nom.toLowerCase()}>{orient.nom}</option>
                ))}
              </select>
            </div>
            <div className="property-form__field">
              <label><FaTools style={iconStyle} /> Infrastructures</label>
              <div className="property-form__checkbox-group">
                {infrastructuresFerme.map(infra => (
                  <label key={infra.id} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.infrastructures.includes(infra.id)}
                      onChange={() => {
                        setFormData((prev: any) => ({
                          ...prev,
                          infrastructures: prev.infrastructures.includes(infra.id)
                            ? prev.infrastructures.filter((id: number) => id !== infra.id)
                            : [...prev.infrastructures, infra.id]
                        }));
                      }}
                    />
                    <span className="checkbox-custom"></span>
                    {infra.nom}
                  </label>
                ))}
              </div>
            </div>
            <div className="property-form__field">
              <label><FaWater style={iconStyle} /> Système d'irrigation</label>
              <input type="checkbox" name="systeme_irrigation" checked={formData.systeme_irrigation} onChange={handleChange} />
            </div>
            <div className="property-form__field">
              <label><FaDrawPolygon style={iconStyle} /> Clôture</label>
              <input type="checkbox" name="cloture" checked={formData.cloture} onChange={handleChange} />
            </div>
            <div className="property-form__field">
              <label><FaWater style={iconStyle} /> Puits</label>
              <input type="checkbox" name="puits" checked={formData.puits} onChange={handleChange} />
            </div>
            <div className="property-form__field">
              <label><FaTags style={iconStyle} /> Environnement</label>
              <select name="environnement_id" value={formData.environnement_id || ''} onChange={handleChange}>
                <option value="">Sélectionnez...</option>
                {environnementsFerme.map(env => (
                  <option key={env.id} value={env.id}>{env.nom}</option>
                ))}
              </select>
            </div>
          </>
        );
      case 'etage_villas':
        return (
          <>
            <div className="property-form__field">
              <label><FaLayerGroup style={iconStyle} /> Numéro d'étage</label>
              <input type="number" name="numero_etage" value={formData.numero_etage} onChange={handleChange} min="0" />
            </div>
            <div className="property-form__field">
              <label><FaDoorOpen style={iconStyle} /> Accès indépendant</label>
              <input type="checkbox" name="acces_independant" checked={formData.acces_independant} onChange={handleChange} />
            </div>
            <div className="property-form__field">
              <label><FaParking style={iconStyle} /> Parking inclus</label>
              <input type="checkbox" name="parking_inclus" checked={formData.parking_inclus} onChange={handleChange} />
            </div>
            <div className="property-form__field">
              <label><FaCalendarAlt style={iconStyle} /> Année de construction</label>
              <input type="number" name="annee_construction" value={formData.annee_construction} onChange={handleChange} min="1900" max={new Date().getFullYear()} />
            </div>
            <div className="property-form__field">
              <label><FaTags style={iconStyle} /> Environnement</label>
              <select name="environnement_id" value={formData.environnement_id || ''} onChange={handleChange}>
                <option value="">Sélectionnez...</option>
                {environnements.map(env => (
                  <option key={env.id} value={env.id}>{env.nom}</option>
                ))}
              </select>
            </div>
          </>
        );
      case 'terrains':
        return (
          <>
            <div className="property-form__field">
              <label><FaSeedling style={iconStyle} /> Type de terrain</label>
              <select name="types_terrains_id" value={formData.types_terrains_id} onChange={handleChange}>
                <option value="">Sélectionnez...</option>
                {typesTerrain.map(terrain => (
                  <option key={terrain.id} value={terrain.id}>{terrain.nom}</option>
                ))}
              </select>
            </div>
            <div className="property-form__field">
              <label><FaTree style={iconStyle} /> Type de sol</label>
              <select name="types_sols_id" value={formData.types_sols_id} onChange={handleChange}>
                <option value="">Sélectionnez...</option>
                {typesSol.map(sol => (
                  <option key={sol.id} value={sol.id}>{sol.nom}</option>
                ))}
              </select>
            </div>
            <div className="property-form__field">
              <label><FaRuler style={iconStyle} /> Surface constructible (m²)</label>
              <input type="number" name="surface_constructible" value={formData.surface_constructible} onChange={handleChange} min="0" />
            </div>
            <div className="property-form__field">
              <label><FaTools style={iconStyle} /> Permis de construction</label>
              <input type="checkbox" name="permis_construction" checked={formData.permis_construction} onChange={handleChange} />
            </div>
            <div className="property-form__field">
              <label><FaDrawPolygon style={iconStyle} /> Clôture</label>
              <input type="checkbox" name="cloture" checked={formData.cloture} onChange={handleChange} />
            </div>
          </>
        );
      default:
        return null;
    }
  };

  const renderPropertyDetails = () => {
    if (!selectedProperty || editMode) return null;
    const {
      titre, prix, superficie, images, ville, delegation, categorie, type_transaction, type,
      nombre_chambres, nombre_pieces, annee_construction, meuble, jardin, piscine, etages,
      superficie_jardin, piscine_privee, garage, cave, terrasse, etage, superficie_couvert,
      environnements_app, nombre_bureaux, nombre_toilettes, climatise, ascenseur, parking,
      salle_reunion, cuisine, securite, fibre_optique, wifi, orientation, infrastructures,
      systeme_irrigation, cloture, puits, numero_etage, acces_independant, parking_inclus,
      types_terrains_id, types_sols_id, surface_constructible, permis_construction
    } = selectedProperty;

    return (
      <div className="property-details">
        <h2>{titre}</h2>
        <p><FaDollarSign style={iconStyle} /> Prix: {prix} DT</p>
        <p><FaExpand style={iconStyle} /> Superficie: {superficie} m²</p>
        <p><FaCity style={iconStyle} /> Ville: {ville?.nom}</p>
        <p><FaMapSigns style={iconStyle} /> Délégation: {delegation?.nom}</p>
        <p><FaTags style={iconStyle} /> Catégorie: {categorie?.nom}</p>
        <p><FaClipboardList style={iconStyle} /> Type: {(type_transaction || type)?.nom}</p>
        {nombre_chambres && <p><FaBed style={iconStyle} /> Chambres: {nombre_chambres}</p>}
        {nombre_pieces && <p><FaLayerGroup style={iconStyle} /> Pièces: {nombre_pieces}</p>}
        {annee_construction && <p><FaCalendarAlt style={iconStyle} /> Construit en: {annee_construction}</p>}
        {meuble && <p><FaBed style={iconStyle} /> Meublé: Oui</p>}
        {jardin && <p><FaTree style={iconStyle} /> Jardin: Oui</p>}
        {piscine && <p><FaSwimmingPool style={iconStyle} /> Piscine: {piscine_privee ? 'Privée' : 'Oui'}</p>}
        {etages && <p><FaLayerGroup style={iconStyle} /> Étages: {etages}</p>}
        {superficie_jardin && <p><FaTree style={iconStyle} /> Superficie jardin: {superficie_jardin} m²</p>}
        {garage && <p><FaParking style={iconStyle} /> Garage: Oui</p>}
        {cave && <p><FaWarehouse style={iconStyle} /> Cave: Oui</p>}
        {terrasse && <p><FaUmbrellaBeach style={iconStyle} /> Terrasse: Oui</p>}
        {etage && <p><FaLayerGroup style={iconStyle} /> Étage: {etage}</p>}
        {superficie_couvert && <p><FaExpand style={iconStyle} /> Superficie couverte: {superficie_couvert} m²</p>}
        {environnements_app?.length && <p><FaTags style={iconStyle} /> Environnements: {environnements_app.map(e => e.nom).join(', ')}</p>}
        {nombre_bureaux && <p><FaStore style={iconStyle} /> Bureaux: {nombre_bureaux}</p>}
        {nombre_toilettes && <p><FaRestroom style={iconStyle} /> Toilettes: {nombre_toilettes}</p>}
        {climatise && <p><FaSnowflake style={iconStyle} /> Climatisé: Oui</p>}
        {ascenseur && <p><FaBuilding style={iconStyle} /> Ascenseur: Oui</p>}
        {parking && <p><FaParking style={iconStyle} /> Parking: Oui</p>}
        {salle_reunion && <p><FaUsers style={iconStyle} /> Salle de réunion: Oui</p>}
        {cuisine && <p><FaUtensils style={iconStyle} /> Cuisine: Oui</p>}
        {securite && <p><FaShieldAlt style={iconStyle} /> Sécurité: Oui</p>}
        {fibre_optique && <p><FaNetworkWired style={iconStyle} /> Fibre optique: Oui</p>}
        {wifi && <p><FaWifi style={iconStyle} /> WiFi: Oui</p>}
        {orientation && <p><FaCompass style={iconStyle} /> Orientation: {orientation.nom}</p>}
        {infrastructures?.length && <p><FaTools style={iconStyle} /> Infrastructures: {infrastructures.map(i => i.nom).join(', ')}</p>}
        {systeme_irrigation && <p><FaWater style={iconStyle} /> Irrigation: Oui</p>}
        {cloture && <p><FaDrawPolygon style={iconStyle} /> Clôture: Oui</p>}
        {puits && <p><FaWater style={iconStyle} /> Puits: Oui</p>}
        {numero_etage && <p><FaLayerGroup style={iconStyle} /> Étage: {numero_etage}</p>}
        {acces_independant && <p><FaDoorOpen style={iconStyle} /> Accès indépendant: Oui</p>}
        {parking_inclus && <p><FaParking style={iconStyle} /> Parking inclus: Oui</p>}
        {types_terrains_id && <p><FaSeedling style={iconStyle} /> Type de terrain: {types_terrains_id.nom}</p>}
        {types_sols_id && <p><FaTree style={iconStyle} /> Type de sol: {types_sols_id.nom}</p>}
        {surface_constructible && <p><FaRuler style={iconStyle} /> Surface constructible: {surface_constructible} m²</p>}
        {permis_construction && <p><FaTools style={iconStyle} /> Permis de construction: Oui</p>}
        <div className="property-form__image-previews">
          {images.map((src, index) => (
            <div key={index} className="property-form__image-preview">
              <img src={`http://localhost:8000/storage/${src}`} alt={`Image ${index}`} />
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="property-dashboard">
      <Header />
      <div className="property-dashboard__content">
        <h1><FaClipboardList style={iconStyle} /> Mes Annonces</h1>
        {error && <div className="property-error">{error}</div>}
        <div className="property-list">
          <table className="property-table">
            <thead>
              <tr>
                <th>Titre</th>
                <th>Type</th>
                <th>Prix (DT)</th>
                <th>Superficie (m²)</th>
                <th>Ville</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {properties.map(property => (
                <tr key={`${property.type}-${property.id}`}>
                  <td>{property.titre}</td>
                  <td>{property.type.replace('_', ' ')}</td>
                  <td>{property.prix}</td>
                  <td>{property.superficie}</td>
                  <td>{property.ville?.nom}</td>
                  <td>
                    <button className="property-button" onClick={() => handleView(property)}>Voir</button>
                    <button className="property-button" onClick={() => handleEdit(property)}>Modifier</button>
                    <button className="property-button property-button--delete" onClick={() => handleDelete(property)}>Supprimer</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {selectedProperty && (
          <div className="property-form__section">
            {editMode ? (
              <form onSubmit={handleSubmit} className="property-form">
                <h2><FaClipboardList style={iconStyle} /> Modifier l'annonce</h2>
                <div className="property-form__field">
                  <label><FaClipboard style={iconStyle} /> Titre</label>
                  <input type="text" name="titre" value={formData.titre} onChange={handleChange} required />
                </div>
                <div className="property-form__field">
                  <label><FaDollarSign style={iconStyle} /> Prix (DT)</label>
                  <input type="number" name="prix" value={formData.prix} onChange={handleChange} min="0" step="100" required />
                </div>
                <div className="property-form__field">
                  <label><FaExpand style={iconStyle} /> Superficie (m²)</label>
                  <input type="number" name="superficie" value={formData.superficie} onChange={handleChange} min="1" required />
                </div>
                <div className="property-form__field">
                  <label><FaCity style={iconStyle} /> Ville</label>
                  <select name="ville" value={formData.ville} onChange={handleChange} required>
                    <option value="">Sélectionnez...</option>
                    {villes.map(ville => (
                      <option key={ville.id} value={ville.id}>{ville.nom}</option>
                    ))}
                  </select>
                </div>
                <div className="property-form__field">
                  <label><FaMapSigns style={iconStyle} /> Délégation</label>
                  <select name="delegation" value={formData.delegation} onChange={handleChange} required disabled={!formData.ville}>
                    <option value="">Sélectionnez...</option>
                    {delegations.map(deleg => (
                      <option key={deleg.id} value={deleg.id}>{deleg.nom}</option>
                    ))}
                  </select>
                </div>
                <div className="property-form__field">
                  <label><FaTags style={iconStyle} /> Catégorie</label>
                  <select name="categorie_id" value={formData.categorie_id} onChange={handleChange} required>
                    <option value="">Sélectionnez...</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.nom}</option>
                    ))}
                  </select>
                </div>
                <div className="property-form__field">
                  <label><FaClipboardList style={iconStyle} /> Type de transaction</label>
                  <select name="type_transaction_id" value={formData.type_transaction_id} onChange={handleChange} required>
                    <option value="">Sélectionnez...</option>
                    {types.map(type => (
                      <option key={type.id} value={type.id}>{type.nom}</option>
                    ))}
                  </select>
                </div>
                {renderSpecificFields()}
                <div className="property-form__field">
                  <label><FaImage style={iconStyle} /> Images</label>
                  <input type="file" multiple accept="image/*" onChange={handleImageChange} />
                  <div className="property-form__image-previews">
                    {previewImages.map((src, index) => (
                      <div key={index} className="property-form__image-preview">
                        <img src={src} alt={`Preview ${index}`} />
                        <button type="button" className="property-form__image-remove" onClick={() => {
                          const newPreviews = [...previewImages];
                          newPreviews.splice(index, 1);
                          setPreviewImages(newPreviews);
                        }}>×</button>
                      </div>
                    ))}
                  </div>
                </div>
                <button type="submit" className="property-form__submit" disabled={isLoading}>
                  {isLoading ? 'Mise à jour...' : 'Mettre à jour'}
                </button>
                <button type="button" className="property-form__cancel" onClick={() => setEditMode(false)}>Annuler</button>
              </form>
            ) : (
              renderPropertyDetails()
            )}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default VendorProperties;