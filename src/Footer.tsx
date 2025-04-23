import "./Footer.css"; // Importez le fichier CSS

const Footer: React.FC = () => {
  return (
    <footer className="footer">
    <div className="footer-top">
      {/* Section logo et description */}
      <div className="footer-logo-section">
        <img src="/src/assets/hhh.png" alt="Le Portail Immobilier Logo" className="footer-logo-img" />
      
        <p>
          ImmoGo est une agence Immobilière qui vous propose des biens immobiliers en vente et en location, principalement sur la région de Hammamet.
        </p>
      </div>
  
      {/* Section des liens */}
      <div className="footer-content">
        <div className="footer-section">
          <h3>Nos Biens</h3>
          <ul>
            <li>Villa</li>
            <li>Maison</li>
            <li>Appartement</li>
            <li>Terrain</li>
            <li>Bureau</li>
          </ul>
        </div>
        <div className="footer-section">
          <h3>Liens utiles</h3>
          <ul>
            <li><a href="#">Estimation du bien</a></li>
            <li><a href="#">Recherche Acheteur</a></li>
            <li><a href="#">Blog</a></li>
            <li><a href="/contact">Contact</a></li>
          </ul>
        </div>
        <div className="footer-section">
          <h3>Contact</h3>
          <p>Av. de carthage, Imm. Ribat el Madina 4e étage App. 405, Rte Gremda, Sfax 3027</p>
          <p>contact@mtd-group.biz</p>
          <p>(+216) 74 490 291</p>
        </div>
      </div>
    </div>
  
    {/* Footer Bottom (Copyright et Crédits) */}
    <div className="footer-bottom">
      <p>© ImmoGo 2025. All rights reserved.</p>
    </div>
  </footer>
  );
};

export default Footer;