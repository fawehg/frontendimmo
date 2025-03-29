import { useState, useEffect } from 'react';
import axios from 'axios';
import './Profil.css';
import Header from "../../Header";
import Footer from "../../Footer";

const Profil = () => {
  const [client, setClient] = useState({
    nom: '',
    prenom: '',
    ville: '',
    adresse: '',
    email: '',
    password: '',
    password_confirmation: ''
  });
  const [editMode, setEditMode] = useState(false);
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchProfil();
  }, []);

  const fetchProfil = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8000/api/client/profil', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const { password, ...clientData } = response.data;
      setClient({ ...clientData, password: '', password_confirmation: '' });
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setClient({ ...client, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!client.nom) newErrors.nom = 'Le nom est requis';
    if (!client.prenom) newErrors.prenom = 'Le prénom est requis';
    if (!client.ville) newErrors.ville = 'La ville est requise';
    if (!client.adresse) newErrors.adresse = "L'adresse est requise";
    if (!client.email) newErrors.email = "L'email est requis";
    else if (!/^\S+@\S+\.\S+$/.test(client.email)) newErrors.email = "Email invalide";
    
    if (client.password && client.password.length < 8) {
      newErrors.password = 'Le mot de passe doit avoir au moins 8 caractères';
    }
    if (client.password !== client.password_confirmation) {
      newErrors.password_confirmation = 'Les mots de passe ne correspondent pas';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setMessage('Veuillez corriger les erreurs');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const dataToSend: any = { ...client };
      if (!dataToSend.password) {
        delete dataToSend.password;
        delete dataToSend.password_confirmation;
      }

      await axios.put('http://localhost:8000/api/client/profil', dataToSend, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setMessage('Profil mis à jour avec succès!');
      setEditMode(false);
      fetchProfil();
    } catch (error: any) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      }
      setMessage(error.response?.data?.message || 'Erreur lors de la mise à jour');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete('http://localhost:8000/api/client/profil', {
          headers: { Authorization: `Bearer ${token}` }
        });
        localStorage.clear();
        window.location.href = '/';
      } catch (error) {
        setMessage('Erreur lors de la suppression');
      }
    }
  };

  return (
    <div className='profilecll'>
      <Header />
      <h1 className="profile-title">Mon Profil</h1>
      
      {message && <div className={`profile-message ${message.includes('succès') ? 'message-success' : 'message-error'}`}>
        {message}
      </div>}
      
      {editMode ? (
        <form onSubmit={handleSubmit} className="profile-form-container">
          <div className="profile-field-group">
            <label className="profile-label">Nom</label>
            <input 
              type="text" 
              name="nom" 
              value={client.nom} 
              onChange={handleChange} 
              className={errors.nom ? 'profile-input-error' : 'profile-input'}
            />
            {errors.nom && <span className="profile-error-message">{errors.nom}</span>}
          </div>

          <div className="profile-field-group">
            <label className="profile-label">Prénom</label>
            <input 
              type="text" 
              name="prenom" 
              value={client.prenom} 
              onChange={handleChange} 
              className={errors.prenom ? 'profile-input-error' : 'profile-input'}
            />
            {errors.prenom && <span className="profile-error-message">{errors.prenom}</span>}
          </div>

          <div className="profile-field-group">
            <label className="profile-label">Ville</label>
            <input 
              type="text" 
              name="ville" 
              value={client.ville} 
              onChange={handleChange} 
              className={errors.ville ? 'profile-input-error' : 'profile-input'}
            />
            {errors.ville && <span className="profile-error-message">{errors.ville}</span>}
          </div>

          <div className="profile-field-group">
            <label className="profile-label">Adresse</label>
            <input 
              type="text" 
              name="adresse" 
              value={client.adresse} 
              onChange={handleChange} 
              className={errors.adresse ? 'profile-input-error' : 'profile-input'}
            />
            {errors.adresse && <span className="profile-error-message">{errors.adresse}</span>}
          </div>

          <div className="profile-field-group">
            <label className="profile-label">Email</label>
            <input 
              type="email" 
              name="email" 
              value={client.email} 
              onChange={handleChange} 
              className={errors.email ? 'profile-input-error' : 'profile-input'}
            />
            {errors.email && <span className="profile-error-message">{errors.email}</span>}
          </div>

          <div className="profile-button-group">
            <button type="submit" className="profile-submit-button">Enregistrer</button>
            <button 
              type="button" 
              className="profile-cancel-button"
              onClick={() => {
                setEditMode(false);
                setErrors({});
                fetchProfil();
              }}
            >
              Annuler
            </button>
          </div>
        </form>
      ) : (
        <div className="profile-view-wrapper">
          <div className="profile-info-section">
            <p className="profile-info-item"><strong>Nom:</strong> {client.nom}</p>
            <p className="profile-info-item"><strong>Prénom:</strong> {client.prenom}</p>
            <p className="profile-info-item"><strong>Ville:</strong> {client.ville}</p>
            <p className="profile-info-item"><strong>Adresse:</strong> {client.adresse}</p>
            <p className="profile-info-item"><strong>Email:</strong> {client.email}</p>
          </div>
          
          <div className="profile-action-buttons">
            <button 
              className="profile-edit-button"
              onClick={() => setEditMode(true)}
            >
              Modifier le profil
            </button>
            <button 
              className="profile-delete-button"
              onClick={handleDelete}
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

export default Profil;