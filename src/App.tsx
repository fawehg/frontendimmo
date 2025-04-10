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
import ProfilClient from './pages/profilclient/profil';
import ProfilVendeur from './pages/profilvendeur/profilvendeur'
const App = () => {
  const [darkMode, ] = useState(false);



  return (
    <Router>
      <div className={darkMode ? 'dark-mode' : ''}>
        <Header  />

        <Routes>
          <Route path="/" element={<Home />} /> 
          <Route path="/contact" element={<Contact />} /> 
          <Route path="/login" element={<Login />} /> 
          <Route path="/about" element={<About />} /> 
          <Route path="/loginvendeur" element={<LoginVendeur />} /> 
          <Route path="/resetpassword" element={<ResetPassword />} /> 
          <Route path="/resetpasswordvendeur" element={<ResetPasswordVendeur />} /> 
          <Route path="/vendeur-dashboard" element={<VendeurDashboard />} />
          <Route path="/profil-client" element={<ProfilClient />} />
          <Route path="/profil-vendeur" element={<ProfilVendeur />} />

        </Routes>

      </div>
    </Router>
  );
};

export default App;