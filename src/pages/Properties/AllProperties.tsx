import { useState, useEffect } from "react";
import axios from "axios";
import { FaSearch, FaChevronLeft, FaChevronRight, FaHome, FaHouseUser, FaBuilding, FaStore, FaCity } from "react-icons/fa";
import { Link, useSearchParams } from "react-router-dom";
import "./allProperties.css";

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

const AllProperties: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [villes, setVilles] = useState<Ville[]>([]);
  const [delegations, setDelegations] = useState<Delegation[]>([]);
  const [categories, setCategories] = useState<Categorie[]>([]);
  const [types, setTypes] = useState<Type[]>([]);
  const [maisons, setMaisons] = useState<Maison[]>([]);
  const [appartements, setAppartements] = useState<Appartement[]>([]);
  const [villas, setVillas] = useState<Villa[]>([]);
  const [bureaux, setBureaux] = useState<Bureau[]>([]);
  const [fermes, setFermes] = useState<Ferme[]>([]);
  const [terrains, setTerrains] = useState<Terrain[]>([]);
  const [etageVillas, setEtageVillas] = useState<EtageVilla[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [propertiesPerPage] = useState(9);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    type: "",
    categorie: searchParams.get("categorie") || "",
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

        // Validate categorie query parameter
        const categorieParam = searchParams.get("categorie");
        if (categorieParam && !categories.some((c) => c.nom === categorieParam)) {
          setFilters((prev) => ({ ...prev, categorie: "" }));
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
  }, [searchParams]);

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
            (Number(filters.nombreBureaux) || 0));
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
          etageVillas.find((e) => e.id === property.id)?.numero_etage === Number(filters.numeroEtage));
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

    setProperties(filteredProperties);
    setCurrentPage(1);
  }, [maisons, appartements, villas, bureaux, fermes, terrains, etageVillas, filters]);

  const debouncedFetchDelegations = debounce(async (villeId: number) => {
    try {
      const response = await fetchWithRetry(`http://localhost:8000/api/delegations/${villeId}`);
      setDelegations(response.data);
    } catch (error) {
      console.error("Error fetching delegations:", error);
      setDelegations([]);
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

  const handleSearch = () => {
    // La recherche est gérée par le useEffect
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Vente":
        return "#1e40af";
      case "Location":
        return "#10b981";
      case "Echange":
        return "#f59e0b";
      default:
        return "#1e40af";
    }
  };

  const indexOfLastProperty = currentPage * propertiesPerPage;
  const indexOfFirstProperty = indexOfLastProperty - propertiesPerPage;
  const currentProperties = properties.slice(indexOfFirstProperty, indexOfLastProperty);
  const totalPages = Math.ceil(properties.length / propertiesPerPage);

  const paginate = (pageNumber: number) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
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
    <div className="conteneur-toutes-proprietes">
      <div className="barre-laterale">
        <h3>Recherche Avancée</h3>
        <select name="type" value={filters.type} onChange={handleFilterChange}>
          <option value="">Type de transaction</option>
          {types.map((type) => (
            <option key={type.id} value={type.nom}>{type.nom}</option>
          ))}
        </select>
        <select name="categorie" value={filters.categorie} onChange={handleFilterChange}>
          <option value="">Catégorie</option>
          {categories.map((categorie) => (
            <option key={categorie.id} value={categorie.nom}>{categorie.nom}</option>
          ))}
        </select>
        <select name="ville" value={filters.ville} onChange={handleFilterChange}>
          <option value="">Ville</option>
          {villes.map((ville) => (
            <option key={ville.id} value={ville.nom}>{ville.nom}</option>
          ))}
        </select>
        <select
          name="delegation"
          value={filters.delegation}
          onChange={handleFilterChange}
          disabled={!filters.ville}
        >
          <option value="">Délégation</option>
          {delegations.map((delegation) => (
            <option key={delegation.id} value={delegation.nom}>{delegation.nom}</option>
          ))}
        </select>
        <input
          type="number"
          name="prixMin"
          value={filters.prixMin}
          onChange={handleFilterChange}
          placeholder="Prix min (DT)"
        />
        <input
          type="number"
          name="prixMax"
          value={filters.prixMax}
          onChange={handleFilterChange}
          placeholder="Prix max (DT)"
        />
        <input
          type="number"
          name="superficieMin"
          value={filters.superficieMin}
          onChange={handleFilterChange}
          placeholder="Superficie min (m²)"
        />
        <input
          type="number"
          name="superficieMax"
          value={filters.superficieMax}
          onChange={handleFilterChange}
          placeholder="Superficie max (m²)"
        />
        <input
          type="number"
          name="numeroEtage"
          value={filters.numeroEtage}
          onChange={handleFilterChange}
          placeholder="Numéro d'étage"
        />
        <select name="parkingInclus" value={filters.parkingInclus} onChange={handleFilterChange}>
          <option value="">Parking inclus</option>
          <option value="true">Oui</option>
          <option value="false">Non</option>
        </select>
        <button onClick={handleSearch} className="bouton-recherche">
          <FaSearch /> RECHERCHER
        </button>
      </div>

      <div className="contenu-principal">
        <div className="entete-resultats">
          <h3>
            {properties.length} Résultat{properties.length !== 1 ? "s" : ""}
          </h3>
        </div>

        <div className="grille-proprietes">
          {currentProperties.length > 0 ? (
            currentProperties.map((property) => (
              <div key={`${property.type}-${property.id}`} className="carte-propriete">
                <div className="image-propriete">
                  {property.images?.length > 0 ? (
                    <img
                      src={property.images[0].url}
                      alt={property.titre}
                      onError={() => console.error(`Image failed to load: ${property.images[0].url}`)}
                    />
                  ) : (
                    <div className="sans-image">Pas d'image</div>
                  )}
                </div>
                <div className="details-propriete">
                  <div
                    className="etiquette-propriete"
                    style={{ backgroundColor: getTypeColor(property.typeTransaction) }}
                  >
                    {property.typeTransaction}
                  </div>
                  <h4>{property.prix.toLocaleString()} DT</h4>
                  <p className="titre-propriete">{property.titre}</p>
                  <p className="adresse-propriete">
                    {property.adresse}, {property.delegation}, {property.ville}
                  </p>
                  <p className="superficie-propriete">{property.superficie}m²</p>
                  <Link to={`/${property.type}/${property.id}`} className="bouton-voir">
                    Voir les détails
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="aucun-resultat">
              Aucun résultat trouvé pour ces critères de recherche
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="pagination">
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Précédent
            </button>

            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const page =
                totalPages <= 5 || currentPage <= 3
                  ? i + 1
                  : currentPage >= totalPages - 2
                  ? totalPages - 4 + i
                  : currentPage - 2 + i;
              return page;
            }).map((page) => (
              <button
                key={page}
                onClick={() => paginate(page)}
                className={currentPage === page ? "actif" : ""}
              >
                {page}
              </button>
            ))}

            {totalPages > 5 && currentPage < totalPages - 2 && (
              <span className="ellipsis-pagination">...</span>
            )}

            {totalPages > 5 && currentPage < totalPages - 2 && (
              <button onClick={() => paginate(totalPages)}>{totalPages}</button>
            )}

            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Suivant
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllProperties;