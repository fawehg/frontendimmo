import { useState } from 'react';
import { Link } from 'react-router-dom';
import './Login.css';
import { FaUser, FaEnvelope, FaLock, FaMapMarkerAlt, FaUsers } from 'react-icons/fa';
import axios from 'axios';
import Header from '../Header';
import Footer from '../Footer';
import { HiOfficeBuilding } from 'react-icons/hi';

// Définir le type de la réponse de l'API
type ApiResponse = {
  vendeur: any;
  client: any;
  user: any;
  token: string; // Le token est directement dans la réponse
  message?: string; // Message optionnel
};

const Login = () => {
  const [state, setState] = useState({
    nom: '',
    prenom: '',
    ville: '',
    adresse: '',
    email: '',
    password: '',
    confirmationMotDePasse: '',
    role: 'client', // Par défaut, le rôle est client
    errors: {
      nom: '',
      prenom: '',
      ville: '',
      adresse: '',
      email: '',
      password: '',
      confirmationMotDePasse: '',
    },
  });

  const handleChange = (e: { target: { name: any; value: any } }) => {
    const { name, value } = e.target;
    setState((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const validateForm = () => {
    const { nom, prenom, ville, adresse, email, password, confirmationMotDePasse } = state;
    const errors = {
      nom: '',
      prenom: '',
      ville: '',
      adresse: '',
      email: '',
      password: '',
      confirmationMotDePasse: '',
    };

    if (!nom) errors.nom = 'Le nom est requis';
    if (!prenom) errors.prenom = 'Le prénom est requis';
    if (!ville) errors.ville = 'La ville est requise';
    if (!adresse) errors.adresse = "L'adresse est requise";
    if (!email) errors.email = "L'email est requis";
    if (!password) errors.password = 'Le mot de passe est requis';
    if (password !== confirmationMotDePasse) errors.confirmationMotDePasse = 'Les mots de passe ne correspondent pas';

    setState((prevState) => ({
      ...prevState,
      errors,
    }));

    return Object.values(errors).every((error) => !error); // Retourne true si aucune erreur n'est trouvée
  };

  const handleSubmitSignup = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        // Déterminer l'endpoint en fonction du rôle
        const endpoint =
          state.role === 'client'
            ? 'http://localhost:8000/api/registerclient'
            : 'http://localhost:8000/api/registervendeur';

        const response = await axios.post<ApiResponse>(endpoint, {
          nom: state.nom,
          prenom: state.prenom,
          ville: state.ville,
          adresse: state.adresse,
          email: state.email,
          password: state.password,
          password_confirmation: state.confirmationMotDePasse,
        });

        console.log('Inscription réussie', response.data);
        alert('Inscription réussie !');
      } catch (error) {
        console.error('Erreur lors de l\'inscription', error);
        alert('Erreur lors de l\'inscription. Veuillez réessayer.');
      }
    }
  };
  const handleSubmitSignin = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    try {
      const endpoint =
        state.role === 'client'
          ? 'http://localhost:8000/api/loginclient'
          : 'http://localhost:8000/api/loginvendeur';
  
      const response = await axios.post<ApiResponse>(endpoint, {
        email: state.email,
        password: state.password,
      });
  
      console.log('Réponse complète du backend:', response); // Pour débogage
  
      // Modifier cette partie pour gérer à la fois client et vendeur
      const userData = state.role === 'client' ? response.data.client : response.data.vendeur;
      
      if (response.data.token && userData) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('role', state.role);
        localStorage.setItem('prenom', userData.prenom);
        localStorage.setItem('nom', userData.nom);
        
        alert(`Connexion réussie ! Bienvenue ${userData.prenom}`);
  
        if (state.role === 'client') {
          window.location.href = '/';
        } else if (state.role === 'vendeur') {
          window.location.href = '/vendeur-dashboard';
        }
      } else {
        throw new Error('Données manquantes dans la réponse du backend');
      }
    } catch (error) {
      console.error('Erreur lors de la connexion', error);
      alert('Erreur lors de la connexion. Veuillez vérifier vos identifiants.');
    }
  };

  const handleSignUpClick = () => {
    const container = document.getElementById('login-container');
    if (container) {
      container.classList.add('login-container--right-panel-active');
    }
  };

  const handleSignInClick = () => {
    const container = document.getElementById('login-container');
    if (container) {
      container.classList.remove('login-container--right-panel-active');
    }
  };

  const { errors } = state;

  return (
    <div>
      <Header />
      <div className="login-container" id="login-container">
        {/* Formulaire d'inscription */}
        <div className="login-form-container login-form-container--signup">
          <form onSubmit={handleSubmitSignup} className="auth-form">
            <h1>Créer un compte</h1>
            <div className="login-input-container">
              <FaUser className="login-icon" />
              <input
                className="login-input-field"
                type="text"
                placeholder="Nom"
                name="nom"
                value={state.nom}
                onChange={handleChange}
              />
            </div>
            {errors.nom && <span className="login-error">{errors.nom}</span>}
            <div className="login-input-container">
              <FaUser className="login-icon" />
              <input
                className="login-input-field"
                type="text"
                placeholder="Prénom"
                name="prenom"
                value={state.prenom}
                onChange={handleChange}
              />
            </div>
            {errors.prenom && <span className="login-error">{errors.prenom}</span>}
            <div className="login-input-container">
              <HiOfficeBuilding className="login-icon" />
              <input
                className="login-input-field"
                type="text"
                placeholder="Ville"
                name="ville"
                value={state.ville}
                onChange={handleChange}
              />
            </div>
            {errors.ville && <span className="login-error">{errors.ville}</span>}
            <div className="login-input-container">
              <FaMapMarkerAlt className="login-icon" />
              <input
                className="login-input-field"
                type="text"
                placeholder="Adresse"
                name="adresse"
                value={state.adresse}
                onChange={handleChange}
              />
            </div>
            {errors.adresse && <span className="login-error">{errors.adresse}</span>}
            <div className="login-input-container">
              <FaEnvelope className="login-icon" />
              <input
                className="login-input-field"
                type="email"
                placeholder="Email"
                name="email"
                value={state.email}
                onChange={handleChange}
              />
            </div>
            {errors.email && <span className="login-error">{errors.email}</span>}
            <div className="login-input-container">
              <FaLock className="login-icon" />
              <input
                className="login-input-field"
                type="password"
                placeholder="Mot de passe"
                name="password"
                value={state.password}
                onChange={handleChange}
              />
            </div>
            {errors.password && <span className="login-error">{errors.password}</span>}
            <div className="login-input-container">
              <FaLock className="login-icon" />
              <input
                className="login-input-field"
                type="password"
                placeholder="Confirmation du mot de passe"
                name="confirmationMotDePasse"
                value={state.confirmationMotDePasse}
                onChange={handleChange}
              />
            </div>
            {errors.confirmationMotDePasse && (
              <span className="login-error">{errors.confirmationMotDePasse}</span>
            )}
            <div className="login-input-container">
              <FaUsers className="login-icon" />
              <select
                name="role"
                value={state.role}
                onChange={handleChange}
                className="login-input-field"
              >
                <option value="client">Client</option>
                <option value="vendeur">Vendeur</option>
              </select>
            </div>
            <button className="login-buttonet" type="submit">
              Inscription
            </button>
          </form>
        </div>

        {/* Formulaire de connexion */}
        <div className="login-form-container login-form-container--signin">
          <form onSubmit={handleSubmitSignin} className="auth-form">
            <h1>Connexion</h1>
            <div className="login-input-container">
              <FaEnvelope className="login-icon" />
              <input
                className="login-input-field"
                type="email"
                placeholder="Email"
                name="email"
                value={state.email}
                onChange={handleChange}
              />
            </div>
            <div className="login-input-container">
              <FaLock className="login-icon" />
              <input
                className="login-input-field"
                type="password"
                placeholder="Mot de passe"
                name="password"
                value={state.password}
                onChange={handleChange}
              />
            </div>
            <div className="login-input-container">
              <FaUsers className="login-icon" />
              <select
                name="role"
                value={state.role}
                onChange={handleChange}
                className="login-input-field"
              >
                <option value="client">Client</option>
                <option value="vendeur">Vendeur</option>
              </select>
            </div>
            <button className="login-buttonet" type="submit">
              Connexion
            </button>
            <Link to="/resetpassword">Mot de passe Oublié?</Link> {/* Lien vers la page de réinitialisation */}
          </form>
        </div>

        {/* Overlay pour l'animation */}
        <div className="login-overlay-container">
          <div className="login-overlay">
            <div className="login-overlay-panel login-overlay-panel--left">
              <h1>Bienvenue !</h1>
              <p>
                Pour rester en contact avec nous, veuillez vous connecter avec vos informations
                personnelles
              </p>
              <button className="login-ghost-button" onClick={handleSignInClick}>
                Connexion
              </button>
            </div>
            <div className="login-overlay-panel login-overlay-panel--right">
              <h1>Cher Client</h1>
              <p>
                Entrez vos informations personnelles et commencez votre voyage de recherche avec nous
              </p>
              <button className="login-ghost-button" onClick={handleSignUpClick}>
                Inscription
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Login;