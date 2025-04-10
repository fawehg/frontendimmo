import "./About.css"; // Import CSS for styling
import { useEffect, useState } from "react";
import Header from "../../Header"; // Import du composant Header
import Footer from "../../Footer"; // Import du composant Footer

const About = () => {
  useEffect(() => {
    window.scrollTo(0, 0); // Scroll to the top when the page loads
  }, []);

  // Counter Animation Logic
  const [propertiesListed, setPropertiesListed] = useState(0);
  const [transactionsCompleted, setTransactionsCompleted] = useState(0);

  useEffect(() => {
    let propertiesCounter = 0;
    let transactionsCounter = 0;

    const propertiesInterval = setInterval(() => {
      if (propertiesCounter < 500) {
        propertiesCounter += 10;
        setPropertiesListed(propertiesCounter);
      } else {
        clearInterval(propertiesInterval);
      }
    }, 30);

    const transactionsInterval = setInterval(() => {
      if (transactionsCounter < 200) {
        transactionsCounter += 5;
        setTransactionsCompleted(transactionsCounter);
      } else {
        clearInterval(transactionsInterval);
      }
    }, 50);

    return () => {
      clearInterval(propertiesInterval);
      clearInterval(transactionsInterval);
    };
  }, []);

  return (
    <div>
      {/* Ajout du Header */}
      <Header/>

      {/* Contenu de la page "Qui sommes-nous" */}
      <div className="about-us-container">
        {/* Header Section */}
        <div className="about-header">
          <h1>Bienvenue chez ImmoGo</h1>
          <p>
            ImmoGo est la plateforme immobilière de référence en Tunisie, conçue pour simplifier les transactions entre particuliers. Que vous soyez vendeur ou acheteur, notre mission est de vous offrir une expérience fluide, sécurisée et transparente.
          </p>
        </div>

        {/* Mission and Vision Section */}
        <section className="mission-vision">
          <div className="content">
            <h2>Notre Mission & Vision</h2>
            <p>
              Notre mission est de révolutionner le marché immobilier tunisien en offrant une plateforme innovante qui connecte directement les vendeurs et les acheteurs. Nous visons à éliminer les intermédiaires inutiles et à rendre les transactions immobilières plus accessibles et transparentes.
            </p>
            <p>
              Nous croyons en un avenir où chaque Tunisien peut trouver le bien de ses rêves en quelques clics. Grâce à des outils puissants comme la géolocalisation, la messagerie intégrée et un système de notation fiable, nous construisons une communauté immobilière basée sur la confiance et la collaboration.
            </p>
          </div>
          <img src="/src/assets/about0.jpg" alt="Vision Image" className="vision-image" />
        </section>

        {/* Values Section */}
        <section className="values-section">
          <h2>Nos Valeurs</h2>
          <div className="value-cards">
            {[
              {
                img: "/src/assets/about1.png",
                title: "Transparence",
                desc: "Nous garantissons des transactions claires et honnêtes, sans frais cachés ni intermédiaires superflus.",
              },
              {
                img: "/src/assets/about2.jpg",
                title: "Innovation",
                desc: "Nous utilisons les dernières technologies pour offrir une expérience utilisateur intuitive et efficace.",
              },
              {
                img: "/src/assets/about3.jpg",
                title: "Confiance",
                desc: "La sécurité et la satisfaction de nos utilisateurs sont au cœur de nos priorités.",
              },
            ].map((value, index) => (
              <div className="value-card" key={index}>
                <img src={value.img} alt={value.title} />
                <h3>{value.title}</h3>
                <p>{value.desc}</p>
                <div className="hover-bar"></div>
              </div>
            ))}
          </div>
        </section>

        {/* Counters Section */}
        <section className="counters-section">
          <div className="counter-card">
            <h2>{propertiesListed}+</h2>
            <p>Annonces Publiées</p>
          </div>
          <div className="counter-card">
            <h2>{transactionsCompleted}</h2>
            <p>Transactions Réalisées</p>
          </div>
        </section>
      </div>

      {/* Ajout du Footer */}
      <Footer />
    </div>
  );
};

export default About;