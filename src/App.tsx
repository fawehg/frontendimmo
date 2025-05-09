import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './Header'; // Importez le Header
import Home from './pages/home'; // Importez la page Home
import Contact from './pages/Contact/Contact';
import Login from './authentification/login';
import  About from './pages/About/About';
import  LoginVendeur from './authentification/loginvendeur';
import ResetPassword from './authentification/mdpoublierclient/resetpassword';
import ResetPasswordVendeur from './authentification/mdpoubliervendeur/resetvendeur';
import VendeurDashboard from './pages/vendeur/VendeurDashboard';
import ProfilClient from './pages/profilclient/profil';
import ProfilVendeur from './pages/profilvendeur/profilvendeur';
import DetailMaison from'./pages/maisons/DetailMaison';
import AllProperties from './pages/Properties/AllProperties';
import DetailAppartement from './pages/appartements/DetailAppartement';
import DetailVilla from './pages/villas/DetailVilla';
import DetailBureau from './pages/bureaux/DetailBureau';
import DetailEtageVilla from './pages/etagevillas/DetailEtageVilla';
import DetailTerrain from './pages/terrains/DetailTerrain';
import DetailFerme from './pages/fermes/DetailFerme';
import MesAnnonces from './pages/vendeur/VendorProperties';

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
          <Route path="/maison/:id" element={<DetailMaison />} />
          <Route path="/appartement/:id" element={<DetailAppartement />} />
          <Route path="/villa/:id" element={<DetailVilla />} />
          <Route path="/bureau/:id" element={<DetailBureau/>} />
          <Route path="/etage-villa/:id" element={<DetailEtageVilla/>} />
          <Route path="/terrain/:id" element={<DetailTerrain/>} />
          <Route path="/ferme/:id" element={<DetailFerme/>} />
          <Route path="/mes-annonces" element={<MesAnnonces/>} />

          <Route path="/all-properties" element={<AllProperties />} />
        </Routes>

      </div>
    </Router>
  );
};

export default App;