import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Login.css';
import { FaUser, FaEnvelope, FaLock, FaMapMarkerAlt } from 'react-icons/fa';
import axios from 'axios';
import Header from "../Header";
import Footer from "../Footer";
import { HiOfficeBuilding } from 'react-icons/hi';

interface AuthResponse {
  vendeur: {
    id: number;
    nom: string;
    prenom: string;
    email: string;
  };
  token: string;
}

interface FormState {
  nom: string;
  prenom: string;
  ville: string;
  adresse: string;
  email: string;
  password: string;
  confirmationMotDePasse: string;
  errors: {
    nom: string;
    prenom: string;
    ville: string;
    adresse: string;
    email: string;
    password: string;
    confirmationMotDePasse: string;
  };
}

const Login = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [state, setState] = useState<FormState>({
    nom: '',
    prenom: '',
    ville: '',
    adresse: '',
    email: '',
    password: '',
    confirmationMotDePasse: '',
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setState(prev => ({
      ...prev,
      [name]: value,
      errors: {
        ...prev.errors,
        [name]: ''
      }
    }));
  };

  const validateForm = (): boolean => {
    const { nom, prenom, ville, adresse, email, password, confirmationMotDePasse } = state;
    const newErrors = {
      nom: !nom ? 'Le nom est requis' : '',
      prenom: !prenom ? 'Le prénom est requis' : '',
      ville: !ville ? 'La ville est requise' : '',
      adresse: !adresse ? 'L\'adresse est requise' : '',
      email: !email ? 'L\'email est requis' : !/^\S+@\S+\.\S+$/.test(email) ? 'Email invalide' : '',
      password: !password ? 'Le mot de passe est requis' : password.length < 6 ? 'Le mot de passe doit contenir au moins 6 caractères' : '',
      confirmationMotDePasse: password !== confirmationMotDePasse ? 'Les mots de passe ne correspondent pas' : ''
    };

    setState(prev => ({ ...prev, errors: newErrors }));
    return !Object.values(newErrors).some(error => error !== '');
  };

  const handleSubmitSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const response = await axios.post<AuthResponse>('http://localhost:8000/api/registervendeur', {
        nom: state.nom,
        prenom: state.prenom,
        ville: state.ville,
        adresse: state.adresse,
        email: state.email,
        password: state.password,
        password_confirmation: state.confirmationMotDePasse,
      });

      localStorage.setItem('token', response.data.token);
      localStorage.setItem('role', 'vendeur');
      localStorage.setItem('prenom', response.data.vendeur.prenom);
      
      // Force la mise à jour du header
      window.dispatchEvent(new Event('storage'));
      
      navigate('/vendeur-dashboard');
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || 'Erreur lors de l\'inscription';
      alert(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitSignin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await axios.post<AuthResponse>('http://localhost:8000/api/loginvendeur', {
        email: state.email,
        password: state.password,
      });

      localStorage.setItem('token', response.data.token);
      localStorage.setItem('role', 'vendeur');
      localStorage.setItem('prenom', response.data.vendeur.prenom);
      
      window.dispatchEvent(new Event('storage'));
      
      navigate('/vendeur-dashboard');
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || 'Erreur lors de la connexion';
      alert(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePanel = () => {
    const container = document.getElementById('login-container');
    container?.classList.toggle('login-container--right-panel-active');
  };

  return (
    <div className="login-page">
      <Header />
      
      <div className="login-container" id="login-container">
        <div className="login-form-container login-form-container--signup">
          <form onSubmit={handleSubmitSignup} className="auth-form">
            <h1>Créer un compte</h1>
            
            {['nom', 'prenom', 'ville', 'adresse', 'email', 'password', 'confirmationMotDePasse'].map((field) => (
              <div key={field} className="login-input-container">
                {field === 'nom' || field === 'prenom' ? <FaUser className="login-icon" /> :
                 field === 'ville' ?<HiOfficeBuilding  className="login-icon" /> :
                  field === 'adresse' ? <FaMapMarkerAlt className="login-icon" /> :
                 field === 'email' ? <FaEnvelope className="login-icon" /> : <FaLock className="login-icon" />}
                
                <input
                  className="login-input-field"
                  type={field.includes('password') ? 'password' : 'text'}
                  placeholder={
                    field === 'confirmationMotDePasse' ? 'Confirmation du mot de passe' :
                    field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')
                  }
                  name={field}
                  value={state[field as keyof Omit<FormState, 'errors'>]}
                  onChange={handleChange}
                />
                {state.errors[field as keyof FormState['errors']] && (
                  <span className="login-error">{state.errors[field as keyof FormState['errors']]}</span>
                )}
              </div>
            ))}
            
            <button className="login-buttonet" type="submit" disabled={isLoading}>
              {isLoading ? 'Inscription en cours...' : 'Inscription'}
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
                required
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
                required
              />
            </div>
            
            <button className="login-buttonet" type="submit" disabled={isLoading}>
              {isLoading ? 'Connexion en cours...' : 'Connexion'}
            </button>
            
            <Link to="/resetpasswordvendeur" className="forgot-password">
              Mot de passe oublié?
            </Link>
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
              <button className="login-ghost-button" onClick={togglePanel}>
                Connexion
              </button>
            </div>
            
            <div className="login-overlay-panel login-overlay-panel--right">
              <h1>Cher Client</h1>
              <p>
                Entrez vos informations personnelles et commencez votre voyage de recherche avec nous
              </p>
              <button className="login-ghost-button" onClick={togglePanel}>
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