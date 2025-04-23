import React, { useEffect, useState } from "react";
import { FaMapMarkerAlt, FaEnvelope, FaPhone, FaFacebook, FaInstagram, FaLinkedin } from "react-icons/fa";
import axios from "axios";
import Header from "../../Header";
import Footer from "../../Footer";
import "./Contact.css";

const Contact: React.FC = () => {
  const [headerHeight, setHeaderHeight] = useState(0);
  const [formData, setFormData] = useState({ name: "", phone: "", message: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const header = document.querySelector(".nav");
    if (header) {
      setHeaderHeight(header.clientHeight);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    try {
      const response = await axios.post<{ message: string }>(
        "http://localhost:8000/api/contacts",
        formData
      );
      setMessage(response.data.message);
      setFormData({ name: "", phone: "", message: "" });
    } catch (error) {
      setError("Erreur lors de l'envoi du message.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-page" style={{ marginTop: headerHeight }}>
      {/* Header */}
      <Header />

      {/* Conteneur pour l'image et les informations du bureau */}
      <div className="container">
        {/* Image principale */}
        <div className="box image-container">
          <img src="src/assets/dar.jpg" alt="Le Portail Immobilier" />
        </div>

        {/* Informations du bureau */}
        <section className="box office-info">
          <h2>Informations sur le bureau</h2>
          <p><FaMapMarkerAlt /> Adresse 1 : Av. de Carthage, Imm. Ribat el Madina 4e étage App. 405</p>
          <p><FaMapMarkerAlt /> Adresse 2 : Rte Gremda, Sfax 3027</p>
          <p><FaEnvelope /> Email : <a href="mailto:contact@mtd-group.biz">contact@mtd-group.biz</a></p>
          <p className="phone"><FaPhone /> <strong>+(+216) 74 490 291</strong></p>
          <div className="social-share">
            <h3>Partager sur les réseaux sociaux :</h3>
            <div className="social-icons">
              <a href="#"><FaFacebook /></a>
              <a href="#"><FaInstagram /></a>
              <a href="#"><FaLinkedin /></a>
            </div>
          </div>
        </section>
      </div>

      {/* Conteneur pour la carte Google Maps et le formulaire de contact */}
      <div className="container">
        {/* Carte Google Maps */}
        <section className="box map-container">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3278.6049206792363!2d10.756422575434595!3d34.74035167290553!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1301d2d45fee1949%3A0x3a738d39ebc2d576!2sMedia%20Trade%20Development!5e0!3m2!1sen!2stn!4v1739915014331!5m2!1sen!2stn"
            width="100%"
            height="100%"
            allowFullScreen
            loading="lazy"
          ></iframe>
        </section>

        {/* Formulaire de contact */}
        <section className="box contact-form">
          <h2>Contact rapide</h2>
          {message && <p className="success">{message}</p>}
          {error && <p className="error">{error}</p>}
          <form onSubmit={handleSubmit}>
            <div className="form-groupa">
              <label htmlFor="name">Nom *</label>
              <input type="text" id="name" name="name" required value={formData.name} onChange={handleChange} />
            </div>
            <div className="form-groupa">
              <label htmlFor="phone">Téléphone *</label>
              <input type="tel" id="phone" name="phone" required value={formData.phone} onChange={handleChange} />
            </div>
            <div className="form-groupa">
              <label htmlFor="message">Message *</label>
              <textarea id="message" name="message" required value={formData.message} onChange={handleChange}></textarea>
            </div>
            <button type="submit" className="submit-buttonnnn" disabled={loading}>
              {loading ? "Envoi..." : "ENVOYER"}
            </button>
          </form>
        </section>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Contact;
