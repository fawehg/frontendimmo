import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './Header'; // Importez le Header
import Home from './pages/home'; // Importez la page Home
import Contact from './Contact/Contact';
import Login from './authentification/login';
import  About from './pages/About/About';
import  LoginVendeur from './authentification/loginvendeur';
import ResetPassword from './authentification/mdpoublierclient/resetpassword';
import ResetPasswordVendeur from './authentification/mdpoubliervendeur/resetvendeur';
import VendeurDashboard from './pages/vendeur/VendeurDashboard';

const App = () => {
  const [darkMode, setDarkMode] = useState(false);

  // Fonction pour basculer entre le mode sombre et le mode clair
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <Router>
      <div className={darkMode ? 'dark-mode' : ''}>
        {/* Header */}
        <Header darkMode={darkMode} toggleDarkMode={toggleDarkMode} />

        {/* Routes */}
        <Routes>
          <Route path="/" element={<Home />} /> {/* Page d'accueil */}
          <Route path="/contact" element={<Contact />} /> {/* Page de contact */}
          <Route path="/login" element={<Login />} /> {/* Route pour la page de connexion */}
          <Route path="/about" element={<About />} /> {/* Route pour la page de connexion */}
          <Route path="/loginvendeur" element={<LoginVendeur />} /> {/* Route pour la page de connexion */}
          <Route path="/resetpassword" element={<ResetPassword />} /> 
          <Route path="/resetpasswordvendeur" element={<ResetPasswordVendeur />} /> 
          <Route path="/vendeur-dashboard" element={<VendeurDashboard />} />

        </Routes>

        {/* Footer */}
      </div>
    </Router>
  );
};

export default App;