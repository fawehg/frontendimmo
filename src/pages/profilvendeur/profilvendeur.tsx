import { useState, useEffect } from 'react';
import axios from 'axios';
import './profilvendeur.css'; // Fichier CSS renommé
import Header from "../../Header";
import Footer from "../../Footer";

const profilvendeur = () => {
  const [seller, setSeller] = useState({
    nom: '',
    prenom: '',
    entreprise: '',
    telephone: '',
    ville: '',
    adresse: '',
    email: '',
    description: '',
    password: '',
    password_confirmation: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8000/api/vendeur/profil', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const { password, ...sellerData } = response.data;
      setSeller({ ...sellerData, password: '', password_confirmation: '' });
    } catch (error) {
      console.error('Erreur:', error);
      window.location.href = '/loginvendeur';
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setSeller({ ...seller, [e.target.name]: e.target.value });
    if (validationErrors[e.target.name]) {
      setValidationErrors({ ...validationErrors, [e.target.name]: '' });
    }
  };

  const validateFormData = () => {
    const errors: Record<string, string> = {};
    
    if (!seller.nom) errors.nom = 'Le nom est requis';
    if (!seller.prenom) errors.prenom = 'Le prénom est requis';
    if (!seller.ville) errors.ville = 'La ville est requise';
    if (!seller.adresse) errors.adresse = "L'adresse est requise";
    if (!seller.email) errors.email = "L'email est requis";
    else if (!/^\S+@\S+\.\S+$/.test(seller.email)) errors.email = "Email invalide";
    
    if (seller.password && seller.password.length < 8) {
      errors.password = 'Le mot de passe doit avoir au moins 8 caractères';
    }
    if (seller.password !== seller.password_confirmation) {
      errors.password_confirmation = 'Les mots de passe ne correspondent pas';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateFormData()) {
      setStatusMessage('Veuillez corriger les erreurs');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const dataToSend: any = { ...seller };
      if (!dataToSend.password) {
        delete dataToSend.password;
        delete dataToSend.password_confirmation;
      }

      await axios.put('http://localhost:8000/api/vendeur/profil', dataToSend, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setStatusMessage('Profil mis à jour avec succès!');
      setIsEditing(false);
      fetchProfile();
    } catch (error: any) {
      if (error.response?.data?.errors) {
        setValidationErrors(error.response.data.errors);
      }
      setStatusMessage(error.response?.data?.message || 'Erreur lors de la mise à jour');
    }
  };

  const handleAccountDeletion = async () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer votre compte vendeur ? Cette action est irréversible.')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete('http://localhost:8000/api/vendeur/profil', {
          headers: { Authorization: `Bearer ${token}` }
        });
        localStorage.clear();
        window.location.href = '/';
      } catch (error) {
        setStatusMessage('Erreur lors de la suppression');
      }
    }
  };

  return (
    <div className='seller-profile-wrapper'>
      <Header />
      <h1 className="seller-profile-heading">Profil Vendeur</h1>
      
      {statusMessage && <div className={`seller-status-message ${statusMessage.includes('succès') ? 'status-success' : 'status-error'}`}>
        {statusMessage}
      </div>}
      
      {isEditing ? (
        <form onSubmit={handleFormSubmit} className="seller-edit-form">
          <div className="form-field-container">
            <label className="form-field-label">Nom</label>
            <input 
              type="text" 
              name="nom" 
              value={seller.nom} 
              onChange={handleInputChange} 
              className={validationErrors.nom ? 'field-input-error' : 'field-input'}
            />
            {validationErrors.nom && <span className="error-text">{validationErrors.nom}</span>}
          </div>

          <div className="form-field-container">
            <label className="form-field-label">Prénom</label>
            <input 
              type="text" 
              name="prenom" 
              value={seller.prenom} 
              onChange={handleInputChange} 
              className={validationErrors.prenom ? 'field-input-error' : 'field-input'}
            />
            {validationErrors.prenom && <span className="error-text">{validationErrors.prenom}</span>}
          </div>

          <div className="form-field-container">
            <label className="form-field-label">Ville</label>
            <input 
              type="text" 
              name="ville" 
              value={seller.ville} 
              onChange={handleInputChange} 
              className={validationErrors.ville ? 'field-input-error' : 'field-input'}
            />
            {validationErrors.ville && <span className="error-text">{validationErrors.ville}</span>}
          </div>

          <div className="form-field-container">
            <label className="form-field-label">Adresse</label>
            <input 
              type="text" 
              name="adresse" 
              value={seller.adresse} 
              onChange={handleInputChange} 
              className={validationErrors.adresse ? 'field-input-error' : 'field-input'}
            />
            {validationErrors.adresse && <span className="error-text">{validationErrors.adresse}</span>}
          </div>

          <div className="form-field-container">
            <label className="form-field-label">Email</label>
            <input 
              type="email" 
              name="email" 
              value={seller.email} 
              onChange={handleInputChange} 
              className={validationErrors.email ? 'field-input-error' : 'field-input'}
            />
            {validationErrors.email && <span className="error-text">{validationErrors.email}</span>}
          </div>

          <div className="form-actions">
            <button type="submit" className="save-button">Enregistrer</button>
            <button 
              type="button" 
              className="cancel-button"
              onClick={() => {
                setIsEditing(false);
                setValidationErrors({});
                fetchProfile();
              }}
            >
              Annuler
            </button>
          </div>
        </form>
      ) : (
        <div className="seller-view-container">
          <div className="profile-details-section">
            <p className="detail-item"><strong>Nom:</strong> {seller.nom}</p>
            <p className="detail-item"><strong>Prénom:</strong> {seller.prenom}</p>
            <p className="detail-item"><strong>Ville:</strong> {seller.ville}</p>
            <p className="detail-item"><strong>Adresse:</strong> {seller.adresse}</p>
            <p className="detail-item"><strong>Email:</strong> {seller.email}</p>
          </div>
          
          <div className="profile-actions">
            <button 
              className="edit-profile-button"
              onClick={() => setIsEditing(true)}
            >
              Modifier le profil
            </button>
            <button 
              className="delete-account-button"
              onClick={handleAccountDeletion}
            >
              Supprimer mon compte
            </button>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
};

export default profilvendeur;