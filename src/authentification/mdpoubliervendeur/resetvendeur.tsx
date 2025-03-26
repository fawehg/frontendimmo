import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "../../Header";
import Footer from "../../Footer";
import "./resetvendeur.css";
import resetImage from "../../assets/reset.avif"; // Importez votre image ici

// Définir le type de la réponse de l'API
type ApiResponse = {
  ResultInfo: {
    Success: boolean;
    ErrorMessage: string;
  };
  ResultData: {
    message?: string;
    token?: string;
  };
};

const ResetPassword = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const navigate = useNavigate();
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  // Étape 1 : Demander le code de réinitialisation
  const requestResetCode = async (data: any) => {
    try {
      const response = await axios.post<ApiResponse>("http://localhost:8000/api/vendeur/reset-password", data);
      alert(response.data.ResultData.message);
      setEmail(data.email);
      setStep(2);
    } catch (error: any) {
      alert(error.response?.data?.ResultInfo?.ErrorMessage || "Erreur lors de l'envoi du code.");
    }
  };

  // Étape 2 : Vérifier le code et changer le mot de passe
  const verifyCodeAndResetPassword = async (data: any) => {
    try {
      const response = await axios.post<ApiResponse>("http://localhost:8000/api/vendeur/verify-reset-code", { ...data, email });
      alert(response.data.ResultData.message);
      reset();
      alert("Mot de passe changé avec succès !");
      navigate("/loginvendeur"); // Rediriger vers la page d'accueil
    } catch (error: any) {
      alert(error.response?.data?.ResultInfo?.ErrorMessage || "Échec de la réinitialisation.");
    }
  };

  return (
    <>
      <Header darkMode={false} toggleDarkMode={() => {}} />
      <div className="reset-container">
        <div className="reset-content">
          <div className="reset-image-section">
            <img src={resetImage} alt="Réinitialisation de mot de passe" />
          </div>
          <div className="reset-form-section">
            {step === 1 ? (
              <form onSubmit={handleSubmit(requestResetCode)}>
                <h2>Réinitialiser le mot de passe</h2>
                <label>Email :</label>
                <input
                  type="email"
                  {...register("email", { required: "L'email est requis" })}
                  className="reset-input-field"
                  placeholder="Entrez votre email"
                />
                {errors.email && <p className="reset-error">{errors.email.message as string}</p>}
                <button type="submit" className="reset-btn reset-btn-primary">Envoyer le code</button>
                <p className="reset-info-text">Vous recevrez un code de réinitialisation par email.</p>
              </form>
            ) : (
              <form onSubmit={handleSubmit(verifyCodeAndResetPassword)}>
                <h2>Vérifier le code</h2>
                <label>Code :</label>
                <input
                  type="text"
                  {...register("code", { required: "Le code est requis" })}
                  className="reset-input-field"
                  placeholder="Entrez le code reçu"
                />
                {errors.code && <p className="reset-error">{errors.code.message as string}</p>}

                <label>Nouveau mot de passe :</label>
                <input
                  type="password"
                  {...register("password", {
                    required: "Le mot de passe est requis",
                    minLength: { value: 6, message: "Minimum 6 caractères" },
                  })}
                  className="reset-input-field"
                  placeholder="Entrez votre nouveau mot de passe"
                />
                {errors.password && <p className="reset-error">{errors.password.message as string}</p>}

                <button type="submit" className="reset-btn reset-btn-success">Changer le mot de passe</button>
                <p className="reset-info-text">Assurez-vous que votre mot de passe est sécurisé.</p>
              </form>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ResetPassword;