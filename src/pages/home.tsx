import { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
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
  FaRedoAlt,
  FaChevronLeft,
  FaChevronRight,
  FaBars,
  FaTag,
  FaHeart,
  FaShare,
  FaExpand,
  FaCalendarAlt,
  FaChevronDown,
} from "react-icons/fa";
import "./home.css";
import Header from "../Header";
import Footer from "../Footer";
import { HiOfficeBuilding } from "react-icons/hi";
import { Link } from "react-router-dom";
import { useFavorites } from "../context/FavoritesContext";

// Interfaces (unchanged)
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

interface Image {
  url: string;
  path: string;
}

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
  ville: string;
  delegation: string;
  categorie: string;
  type: string;
  created_at: string;
  updated_at: string;
}

interface Appartement {
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
  superficie_couvert: number | null;
  etage: number | null;
  meuble: boolean;
  images: Image[];
  ville: string;
  delegation: string;
  categorie: string;
  type: string;
  environnements: string[];
  created_at: string;
  updated_at: string;
}

interface Villa {
  id: number;
  type_id: number;
  categorie_id: number;
  ville_id: number;
  delegation_id: number;
  adresse: string;
  titre: string;
  description: string;
  prix: number;
  superficie: number;
  chambres: number;
  pieces: number;
  annee_construction: number;
  meuble: boolean;
  environnement_id: number;
  jardin: boolean;
  piscine: boolean;
  etages: number | null;
  superficie_jardin: number | null;
  piscine_privee: boolean;
  garage: boolean;
  cave: boolean;
  terrasse: boolean;
  images: Image[];
  ville: string;
  delegation: string;
  categorie: string;
  type: string;
  created_at: string;
  updated_at: string;
}

interface Bureau {
  id: number;
  titre: string;
  description: string;
  prix: number;
  superficie: number;
  superficie_couverte: number;
  nombre_bureaux: number;
  nombre_toilettes: number;
  adresse: string;
  ville: string;
  delegation: string;
  categorie: string;
  type: string;
  environnement: string | null;
  caracteristiques: string[];
  images: Image[];
  created_at: string;
  updated_at: string;
  ville_id: number;
  delegation_id: number;
}

interface Ferme {
  id: number;
  titre: string;
  description: string;
  prix: number;
  superficie: number;
  adresse: string;
  type: string;
  categorie: string;
  ville: string;
  delegation: string;
  orientation: string | null;
  environnement: string | null;
  infrastructures: string[];
  images: Image[];
  created_at: string;
  updated_at: string;
  ville_id: number;
  delegation_id: number;
}

interface Terrain {
  id: number;
  titre: string;
  description: string;
  prix: number;
  superficie: number;
  adresse: string;
  type: string;
  categorie: string;
  ville: string;
  delegation: string;
  environnement: string | null;
  type_terrain: string | null;
  type_sol: string | null;
  surface_constructible: number | null;
  permis_construction: boolean;
  cloture: boolean;
  images: Image[];
  created_at: string;
  updated_at: string;
  ville_id: number;
  delegation_id: number;
}

interface EtageVilla {
  id: number;
  titre: string;
  description: string;
  prix: number;
  superficie: number;
  adresse: string;
  type: string;
  categorie: string;
  ville: string;
  delegation: string;
  environnement: string | null;
  numero_etage: number;
  acces_independant: boolean;
  parking_inclus: boolean;
  annee_construction: number;
  images: Image[];
  created_at: string;
  ville_id: number;
  delegation_id: number;
}

interface Property {
  id: number;
  type: "maison" | "appartement" | "villa" | "bureau" | "ferme" | "terrain" | "etage-villa";
  titre: string;
  adresse: string;
  prix: number;
  superficie: number;
  categorie: string;
  ville: string;
  delegation: string;
  images: Image[];
  created_at: string;
  typeTransaction: string;
  ville_id: number;
  delegation_id: number;
  description: string;
}

// Debounce utility
const debounce = (func: (...args: any[]) => void, wait: number) => {
  let timeout: NodeJS.Timeout;
  return (...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Fetch with retry for rate limiting
const fetchWithRetry = async (url: string, retries = 3, delay = 1000) => {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await axios.get(url);
      return response;
    } catch (error) {
      if (error.response?.status === 429 && i < retries - 1) {
        const waitTime = delay * 2 ** i; // Exponential backoff: 1s, 2s, 4s
        console.warn(`Rate limit hit for ${url}, retrying after ${waitTime}ms...`);
        await new Promise((resolve) => setTimeout(resolve, waitTime));
        continue;
      }
      throw error;
    }
  }
};

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
  const recentPropertiesRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [maisons, setMaisons] = useState<Maison[]>([]);
  const [appartements, setAppartements] = useState<Appartement[]>([]);
  const [villas, setVillas] = useState<Villa[]>([]);
  const [bureaux, setBureaux] = useState<Bureau[]>([]);
  const [fermes, setFermes] = useState<Ferme[]>([]);
  const [terrains, setTerrains] = useState<Terrain[]>([]);
  const [etageVillas, setEtageVillas] = useState<EtageVilla[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    type: "",
    categorie: "",
    ville: "",
    delegation: "",
    chambres: "",
    douches: "",
    sallesEau: "",
    suites: "",
    prixMin: "",
    prixMax: "",
    superficieMin: "",
    superficieMax: "",
    piscine: "",
    nombreBureaux: "",
    infrastructures: "",
    permisConstruction: "",
    cloture: "",
    surfaceConstructibleMin: "",
    numeroEtage: "",
    accesIndependant: "",
    parkingInclus: "",
  });

  const { favorites, toggleFavorite } = useFavorites();

  const { scrollYProgress } = useScroll({
    target: propertyListRef,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "10%"]);

  const scrollToCard = (index: number) => {
    if (propertyListRef.current) {
      const cardWidth = 220;
      propertyListRef.current.scrollTo({
        left: index * cardWidth,
        behavior: "smooth",
      });
      setCurrentIndex(index);
    }
  };

  const handleNext = () => {
    const nextIndex = Math.min(currentIndex + 1, 4);
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

  const scrollToRecentProperties = () => {
    if (recentPropertiesRef.current) {
      recentPropertiesRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);

        // Check localStorage for cached data
        const cachedVilles = localStorage.getItem("villes");
        const cachedCategories = localStorage.getItem("categories");
        const cachedTypes = localStorage.getItem("types");

        if (cachedVilles && cachedCategories && cachedTypes) {
          setVilles(JSON.parse(cachedVilles));
          setCategories(JSON.parse(cachedCategories));
          setTypes(JSON.parse(cachedTypes));
        } else {
          const [villesResponse, categoriesResponse, typesResponse] = await Promise.all([
            fetchWithRetry("http://localhost:8000/api/villes"),
            fetchWithRetry("http://localhost:8000/api/categories"),
            fetchWithRetry("http://localhost:8000/api/types"),
          ]);

          setVilles(villesResponse.data);
          setCategories(categoriesResponse.data);
          setTypes(typesResponse.data);

          // Cache data in localStorage
          localStorage.setItem("villes", JSON.stringify(villesResponse.data));
          localStorage.setItem("categories", JSON.stringify(categoriesResponse.data));
          localStorage.setItem("types", JSON.stringify(typesResponse.data));
        }

        setError(null);
      } catch (error) {
        console.error("Error fetching initial data:", error);
        if (error.response?.status === 429) {
          setError("Trop de requêtes. Veuillez réessayer dans quelques secondes.");
        } else {
          setError("Erreur lors du chargement des données initiales.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        const [
          maisonsResponse,
          appartementsResponse,
          villasResponse,
          bureauxResponse,
          fermesResponse,
          terrainsResponse,
          etageVillasResponse,
        ] = await Promise.all([
          fetchWithRetry("http://localhost:8000/api/maisons"),
          fetchWithRetry("http://localhost:8000/api/appartements"),
          fetchWithRetry("http://localhost:8000/api/villas"),
          fetchWithRetry("http://localhost:8000/api/bureaux"),
          fetchWithRetry("http://localhost:8000/api/fermes"),
          fetchWithRetry("http://localhost:8000/api/terrains"),
          fetchWithRetry("http://localhost:8000/api/etage-villas"),
        ]);

        setMaisons(maisonsResponse.data);
        setAppartements(appartementsResponse.data);
        setVillas(villasResponse.data);
        setBureaux(bureauxResponse.data);
        setFermes(fermesResponse.data);
        setTerrains(terrainsResponse.data);
        setEtageVillas(etageVillasResponse.data);
        setError(null);
      } catch (error) {
        console.error("Error fetching properties:", error);
        if (error.response?.status === 429) {
          setError("Trop de requêtes. Veuillez réessayer dans quelques secondes.");
        } else {
          setError("Erreur lors du chargement des propriétés.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  useEffect(() => {
    const combinedProperties: Property[] = [
      ...maisons.map((maison) => ({
        id: maison.id,
        type: "maison" as const,
        titre: maison.titre,
        adresse: maison.adresse,
        prix: maison.prix,
        superficie: maison.superficie,
        categorie: maison.categorie,
        ville: maison.ville,
        delegation: maison.delegation,
        images: maison.images,
        created_at: maison.created_at,
        typeTransaction: maison.type,
        ville_id: maison.ville_id,
        delegation_id: maison.delegation_id,
        description: maison.description,
      })),
      ...appartements.map((appartement) => ({
        id: appartement.id,
        type: "appartement" as const,
        titre: appartement.titre,
        adresse: appartement.adresse,
        prix: appartement.prix,
        superficie: appartement.superficie,
        categorie: appartement.categorie,
        ville: appartement.ville,
        delegation: appartement.delegation,
        images: appartement.images,
        created_at: appartement.created_at,
        typeTransaction: appartement.type,
        ville_id: appartement.ville_id,
        delegation_id: appartement.delegation_id,
        description: appartement.description,
      })),
      ...villas.map((villa) => ({
        id: villa.id,
        type: "villa" as const,
        titre: villa.titre,
        adresse: villa.adresse,
        prix: villa.prix,
        superficie: villa.superficie,
        categorie: villa.categorie,
        ville: villa.ville,
        delegation: villa.delegation,
        images: villa.images,
        created_at: villa.created_at,
        typeTransaction: villa.type,
        ville_id: villa.ville_id,
        delegation_id: villa.delegation_id,
        description: villa.description,
      })),
      ...bureaux.map((bureau) => ({
        id: bureau.id,
        type: "bureau" as const,
        titre: bureau.titre,
        adresse: bureau.adresse,
        prix: bureau.prix,
        superficie: bureau.superficie,
        categorie: bureau.categorie,
        ville: bureau.ville,
        delegation: bureau.delegation,
        images: bureau.images,
        created_at: bureau.created_at,
        typeTransaction: bureau.type,
        ville_id: bureau.ville_id,
        delegation_id: bureau.delegation_id,
        description: bureau.description,
      })),
      ...fermes.map((ferme) => ({
        id: ferme.id,
        type: "ferme" as const,
        titre: ferme.titre,
        adresse: ferme.adresse,
        prix: ferme.prix,
        superficie: ferme.superficie,
        categorie: ferme.categorie,
        ville: ferme.ville,
        delegation: ferme.delegation,
        images: ferme.images,
        created_at: ferme.created_at,
        typeTransaction: ferme.type,
        ville_id: ferme.ville_id,
        delegation_id: ferme.delegation_id,
        description: ferme.description,
      })),
      ...terrains.map((terrain) => ({
        id: terrain.id,
        type: "terrain" as const,
        titre: terrain.titre,
        adresse: terrain.adresse,
        prix: terrain.prix,
        superficie: terrain.superficie,
        categorie: terrain.categorie,
        ville: terrain.ville,
        delegation: terrain.delegation,
        images: terrain.images,
        created_at: terrain.created_at,
        typeTransaction: terrain.type,
        ville_id: terrain.ville_id,
        delegation_id: terrain.delegation_id,
        description: terrain.description,
      })),
      ...etageVillas.map((etage) => ({
        id: etage.id,
        type: "etage-villa" as const,
        titre: etage.titre,
        adresse: etage.adresse,
        prix: etage.prix,
        superficie: etage.superficie,
        categorie: etage.categorie,
        ville: etage.ville,
        delegation: etage.delegation,
        images: etage.images,
        created_at: etage.created_at,
        typeTransaction: etage.type,
        ville_id: etage.ville_id,
        delegation_id: etage.delegation_id,
        description: etage.description,
      })),
    ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    const filteredProperties = combinedProperties.filter((property) => {
      const matchesType = !filters.type || property.typeTransaction === filters.type;
      const matchesCategorie = !filters.categorie || property.categorie === filters.categorie;
      const matchesVille =
        !filters.ville || property.ville.toLowerCase().includes(filters.ville.toLowerCase());
      const matchesDelegation =
        !filters.delegation ||
        property.delegation.toLowerCase().includes(filters.delegation.toLowerCase());
      const matchesPrix =
        (!filters.prixMin || property.prix >= Number(filters.prixMin)) &&
        (!filters.prixMax || property.prix <= Number(filters.prixMax));
      const matchesSuperficie =
        (!filters.superficieMin || property.superficie >= Number(filters.superficieMin)) &&
        (!filters.superficieMax || property.superficie <= Number(filters.superficieMax));
      const matchesPiscine =
        !filters.piscine ||
        (property.type === "villa" &&
          villas.find((v) => v.id === property.id)?.piscine.toString() === filters.piscine);
      const matchesNombreBureaux =
        !filters.nombreBureaux ||
        (property.type === "bureau" &&
          (bureaux.find((b) => b.id === property.id)?.nombre_bureaux ?? 0) >=
            Number(filters.nombreBureaux));
      const matchesInfrastructures =
        !filters.infrastructures ||
        (property.type === "ferme" &&
          fermes
            .find((f) => f.id === property.id)
            ?.infrastructures.some((infra) =>
              infra.toLowerCase().includes(filters.infrastructures.toLowerCase())
            ));
      const matchesPermisConstruction =
        !filters.permisConstruction ||
        (property.type === "terrain" &&
          terrains.find((t) => t.id === property.id)?.permis_construction.toString() ===
            filters.permisConstruction);
      const matchesCloture =
        !filters.cloture ||
        (property.type === "terrain" &&
          terrains.find((t) => t.id === property.id)?.cloture.toString() === filters.cloture);
      const matchesSurfaceConstructible =
        !filters.surfaceConstructibleMin ||
        (property.type === "terrain" &&
          (terrains.find((t) => t.id === property.id)?.surface_constructible ?? 0) >=
            Number(filters.surfaceConstructibleMin));
      const matchesNumeroEtage =
        !filters.numeroEtage ||
        (property.type === "etage-villa" &&
          etageVillas.find((e) => e.id === property.id)?.numero_etage ===
            Number(filters.numeroEtage));
      const matchesAccesIndependant =
        !filters.accesIndependant ||
        (property.type === "etage-villa" &&
          etageVillas.find((e) => e.id === property.id)?.acces_independant.toString() ===
            filters.accesIndependant);
      const matchesParkingInclus =
        !filters.parkingInclus ||
        (property.type === "etage-villa" &&
          etageVillas.find((e) => e.id === property.id)?.parking_inclus.toString() ===
            filters.parkingInclus);

      return (
        matchesType &&
        matchesCategorie &&
        matchesVille &&
        matchesDelegation &&
        matchesPrix &&
        matchesSuperficie &&
        matchesPiscine &&
        matchesNombreBureaux &&
        matchesInfrastructures &&
        matchesPermisConstruction &&
        matchesCloture &&
        matchesSurfaceConstructible &&
        matchesNumeroEtage &&
        matchesAccesIndependant &&
        matchesParkingInclus
      );
    });

    setProperties(filteredProperties.slice(0, 6));
  }, [maisons, appartements, villas, bureaux, fermes, terrains, etageVillas, filters]);

  const debouncedFetchDelegations = debounce(async (villeId: number) => {
    try {
      const response = await fetchWithRetry(`http://localhost:8000/api/delegations/${villeId}`);
      setDelegations(response.data);
    } catch (error) {
      console.error("Erreur lors de la récupération des délégations :", error);
    }
  }, 500);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));

    if (name === "ville") {
      const selectedVille = villes.find((v) => v.nom === value);
      if (selectedVille) {
        debouncedFetchDelegations(selectedVille.id);
      } else {
        setDelegations([]);
      }
    }
  };

  const handleResetFilters = () => {
    setFilters({
      type: "",
      categorie: "",
      ville: "",
      delegation: "",
      chambres: "",
      douches: "",
      sallesEau: "",
      suites: "",
      prixMin: "",
      prixMax: "",
      superficieMin: "",
      superficieMax: "",
      piscine: "",
      nombreBureaux: "",
      infrastructures: "",
      permisConstruction: "",
      cloture: "",
      surfaceConstructibleMin: "",
      numeroEtage: "",
      accesIndependant: "",
      parkingInclus: "",
    });
    setDelegations([]);
  };

  if (loading) {
    return (
      <div className="conteneur-chargement">
        <div className="spinner-chargement"></div>
        <p>Chargement des propriétés...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="conteneur-erreur">
        <h2>Erreur</h2>
        <p>{error}</p>
        {error.includes("Trop de requêtes") && (
          <button onClick={() => window.location.reload()}>
            Réessayer
          </button>
        )}
      </div>
    );
  }

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
                <select id="type" name="type" value={filters.type} onChange={handleFilterChange}>
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
                  <FaCity className="icon" /> Type Catégorie
                </label>
                <select
                  id="type-categorie"
                  name="categorie"
                  value={filters.categorie}
                  onChange={handleFilterChange}
                >
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
                  <HiOfficeBuilding className="icon" /> Ville
                </label>
                <select
                  id="ville"
                  name="ville"
                  value={filters.ville}
                  onChange={handleFilterChange}
                >
                  <option value="">Sélectionnez une ville</option>
                  {villes.map((ville) => (
                    <option key={ville.id} value={ville.nom}>
                      {ville.nom}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="delegation">
                  <FaMapMarkerAlt className="icon" /> Délégation
                </label>
                <select
                  id="delegation"
                  name="delegation"
                  value={filters.delegation}
                  onChange={handleFilterChange}
                  disabled={!filters.ville}
                >
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
                  <FaBars className="icon" />
                </button>
              </div>

              {showFilters && (
                <div className="advanced-filters">
                  <div className="filters-row">
                    <div className="form-group">
                      <label>Chambre</label>
                      <select name="chambres" value={filters.chambres} onChange={handleFilterChange}>
                        <option value="">Non défini</option>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3+</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Salle de bain</label>
                      <select name="douches" value={filters.douches} onChange={handleFilterChange}>
                        <option value="">Non défini</option>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3+</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Salles d'eau</label>
                      <select
                        name="sallesEau"
                        value={filters.sallesEau}
                        onChange={handleFilterChange}
                      >
                        <option value="">Non défini</option>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3+</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Prix Entre :</label>
                      <div className="filters-range">
                        <input
                          type="number"
                          name="prixMin"
                          value={filters.prixMin}
                          onChange={handleFilterChange}
                          placeholder="0"
                        />
                        <span>Et</span>
                        <input
                          type="number"
                          name="prixMax"
                          value={filters.prixMax}
                          onChange={handleFilterChange}
                          placeholder="100000"
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Superficie Entre :</label>
                      <div className="filters-range">
                        <input
                          type="number"
                          name="superficieMin"
                          value={filters.superficieMin}
                          onChange={handleFilterChange}
                          placeholder="0"
                        />
                        <span>Et</span>
                        <input
                          type="number"
                          name="superficieMax"
                          value={filters.superficieMax}
                          onChange={handleFilterChange}
                          placeholder="100000"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="form-group-roww">
                    <button type="button" className="search-button" onClick={scrollToRecentProperties}>
                      <FaSearch className="icon" /> APPLIQUER LE FILTRE
                    </button>
                    <button
                      type="button"
                      className="reset-button"
                      onClick={handleResetFilters}
                    >
                      <FaRedoAlt className="icon" /> RÉINITIALISER LE FILTRE
                    </button>
                  </div>
                </div>
              )}

              <div className="form-group-row">
                <button type="button" className="search-button" onClick={scrollToRecentProperties}>
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

      <div className="recent-properties-section" ref={recentPropertiesRef}>
        <div className="section-header">
          <motion.h2
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="section-titlee"
          >
            Les plus récentes
            <motion.span
              className="title-underline"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            />
          </motion.h2>

          <motion.p
            className="section-subtitle"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            Découvrez nos dernières pépites immobilières
          </motion.p>
        </div>

        <div className="property-cards-container">
          {properties.length > 0 ? (
            properties.map((property, index) => (
              <motion.div
                key={`${property.type}-${property.id}`}
                className="property-card"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                viewport={{ once: true, margin: "-100px" }}
                whileHover={{
                  y: -10,
                  boxShadow: "0 20px 40px rgba(9, 5, 54, 0.15)",
                }}
              >
                <div className="card-image-container">
                  <motion.div className="parallax-image" style={{ y }}>
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
                      <div className="no-image">Pas d'image disponible</div>
                    )}
                  </motion.div>

                  <div className="card-badges">
                    <span className="property-type">{property.type.replace("-", " ")}</span>
                    <span className="property-price">{property.prix.toLocaleString()} TND</span>
                  </div>

                  <div className="card-actions">
                    <button
                      className={`action-btn favorite ${
                        favorites.includes(property.id) ? "active" : ""
                      }`}
                      onClick={() => toggleFavorite(property.id, property.type)}
                    >
                      <FaHeart />
                    </button>
                    <button className="action-btn share">
                      <FaShare />
                    </button>
                    <button className="action-btn expand">
                      <FaExpand />
                    </button>
                  </div>
                </div>

                <div className="card-content">
                  <div className="property-header">
                    <h3>{property.titre}</h3>
                    <div className="property-location">
                      <FaMapMarkerAlt /> {property.adresse}
                    </div>
                  </div>

                  <div className="property-details">
                    <div className="detail">
                      <span>Superficie</span>
                      <strong>{property.superficie} m²</strong>
                    </div>
                    <div className="detail">
                      <span>Catégorie</span>
                      <strong>{property.categorie}</strong>
                    </div>
                    <div className="detail">
                      <span>Date</span>
                      <strong>
                        <FaCalendarAlt /> {new Date(property.created_at).toLocaleDateString()}
                      </strong>
                    </div>
                  </div>

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="view-details-btn"
                  >
                    <Link to={`/${property.type}/${property.id}`}>Voir les détails</Link>
                  </motion.div>
                </div>

                <div className="card-hover-effect"></div>
                <div className="card-corner"></div>
              </motion.div>
            ))
          ) : (
            <div className="no-properties">Aucune propriété récente disponible</div>
          )}
        </div>

        <motion.div
          className="view-all-container"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <Link to="/all-properties">
            <motion.button
              whileHover={{
                scale: 1.05,
                background: "linear-gradient(45deg, #090536, #3a3a9e)",
              }}
              whileTap={{ scale: 0.95 }}
              className="view-all-btn"
            >
              Explorer toutes nos propriétés
              <FaChevronDown className="arrow-down" />
            </motion.button>
          </Link>
        </motion.div>
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
              Nous cherchons et dénichons pour vous le bien immobilier le plus conforme à vos besoins
              dans les meilleurs délais.
            </p>
          </div>

          <div className="service-card">
            <div className="service-icon-container">
              <FaHandshake className="service-icon" />
            </div>
            <h3>Vente</h3>
            <p>
              Nous nous tenons à vos côtés jusqu'à la concrétisation de l'acte de vente de votre bien
              immobilier.
            </p>
          </div>

          <div className="service-card">
            <div className="service-icon-container">
              <FaKey className="service-icon" />
            </div>
            <h3>Location</h3>
            <p>
              Nos agents immobiliers mettent tout en œuvre pour trouver le bon locataire ou la
              location qui vous convient.
            </p>
          </div>
        </div>
      </div>

      <div className="explore-section">
        <h2 className="section-title">Explorons par type de propriété</h2>

        <div className="explore-container">
          <button
            className={`arrow-left ${currentIndex === 0 ? "disabled" : ""}`}
            onClick={handlePrev}
          >
            <FaChevronLeft />
          </button>

          <div className="horizontal-property-list" ref={propertyListRef}>
            {[
              { name: "Maison", icon: FaHome, iconClass: "home-icon" },
              { name: "Villa", icon: FaHouseUser, iconClass: "villa-icon" },
              { name: "Appartement", icon: FaBuilding, iconClass: "apartment-icon" },
              { name: "Commercial", icon: FaStore, iconClass: "commercial-icon" },
              { name: "Bureau", icon: FaCity, iconClass: "office-icon" },
            ].map((item, index) => (
              <motion.div
                key={index}
                className={`property-item ${index === currentIndex ? "active" : ""}`}
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
            className={`arrow-right ${currentIndex === 4 ? "disabled" : ""}`}
            onClick={handleNext}
          >
            <FaChevronRight />
          </button>
        </div>
      </div>

      <Footer />

      <div className={`back-to-top ${showBackToTop ? "show" : ""}`} onClick={scrollToTop}>
        <FaArrowUp />
      </div>
    </div>
  );
};

export default Home;