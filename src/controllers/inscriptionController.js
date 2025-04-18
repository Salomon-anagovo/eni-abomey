const Inscription = require('../models/Inscription');
const cloudinary = require('../config/cloudinary'); // Configuration de Cloudinary

// Traitement de l'inscription
exports.handleInscription = async (req, res) => {
  try {
    // Extraction des données du formulaire
    const {
      nom, prenom, email, password,
      pays, indicatif, telephone,
      dateNaissance, lieuNaissance, role, conditions
    } = req.body;

    // Vérification des conditions
    if (!conditions) {
      return res.render('inscription', {
        error: "Vous devez accepter les conditions d'utilisation.",
        formData: req.body
      });
    }

    // Vérification si l'email existe déjà
    const emailExist = await Inscription.findOne({ email });
    if (emailExist) {
      return res.render('inscription', {
        error: "Cet email est déjà utilisé.",
        formData: req.body
      });
    }

    // Gestion de l'upload de la photo de profil sur Cloudinary
    let photoUrl = '';
    let photoPublicId = '';
    if (req.files && req.files.photo && req.files.photo[0]) {
      const photoUpload = await cloudinary.uploader.upload_stream(
        { folder: "eni/photos" },  // Dossier Cloudinary pour la photo de profil
        (error, result) => {
          if (result) {
            photoUrl = result.secure_url;
            photoPublicId = result.public_id;
          }
        }
      );
      req.files.photo[0].stream.pipe(photoUpload);
    }

    // Gestion de l'upload des documents sur Cloudinary
    let documentUrls = [];
    let documentPublicIds = [];
    if (req.files && req.files.documents) {
      for (const file of req.files.documents) {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: "eni/documents", resource_type: "auto" },  // Dossier Cloudinary pour les documents
          (error, result) => {
            if (result) {
              documentUrls.push(result.secure_url);
              documentPublicIds.push(result.public_id);
            }
          }
        );
        file.stream.pipe(uploadStream);
      }
    }

    // Création d'un nouvel utilisateur
    const newInscription = new Inscription({
      nom,
      prenom,
      email,
      password,
      pays,
      indicatif,
      telephone,
      dateNaissance,
      lieuNaissance,
      role,
      photo: { url: photoUrl, public_id: photoPublicId },  // Ajout de l'URL et public_id de la photo
      documents: documentUrls.map((url, index) => ({
        url: url,
        public_id: documentPublicIds[index]
      })),
      conditions,
      confirmed: false, // Pas encore confirmé
      dateInscription: Date.now()
    });

    // Sauvegarde de l'inscription dans la base de données
    await newInscription.save();

    // Réponse de succès
    return res.render('inscription', {
      success: "Inscription réussie ! Vous pouvez maintenant vous connecter."
    });

  } catch (error) {
    console.error("Erreur d'inscription:", error);
    return res.render('inscription', {
      error: "Une erreur est survenue. Veuillez réessayer.",
      formData: req.body
    });
  }
};
