const User = require('../models/User');
const cloudinary = require('../config/cloudinary');
const multer = require('multer');

// Configuration Multer pour gérer l'upload en mémoire (temporaire)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Affichage du formulaire d'inscription
exports.showForm = (req, res) => {
  res.render('inscription');
};

// Traitement de l'inscription
exports.handleInscription = async (req, res) => {
  try {
    // Extraction des données du formulaire
    const {
      nom, prenom, email, password,
      pays, indicatif, telephone,
      dateNaissance, lieuNaissance, role
    } = req.body;

    // Validation : conditions d'utilisation
    if (!req.body.conditions) {
      return res.render('inscription', {
        error: "Vous devez accepter les conditions d'utilisation.",
        formData: req.body
      });
    }

    // Vérification de l'unicité de l'email
    const emailExist = await User.findOne({ email });
    if (emailExist) {
      return res.render('inscription', {
        error: "Cet email est déjà utilisé.",
        formData: req.body
      });
    }

    // Gestion de l'upload de la photo de profil
    let photoUrl = '';
    if (req.files && req.files.photo && req.files.photo[0]) {
      const photoUpload = await cloudinary.uploader.upload_stream(
        { folder: "eni/photos" },
        (error, result) => {
          if (result) photoUrl = result.secure_url;
        }
      );
      req.files.photo[0].stream.pipe(photoUpload);
    }

    // Gestion de l'upload des documents
    let documentUrls = [];
    if (req.files && req.files.documents) {
      for (const file of req.files.documents) {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: "eni/documents", resource_type: "auto" },
          (error, result) => {
            if (result) documentUrls.push(result.secure_url);
          }
        );
        file.stream.pipe(uploadStream);
      }
    }

    // Création du nouvel utilisateur
    const newUser = new User({
      nom,
      prenom,
      email,
      password,
      pays,
      indicatif,
      telephone,
      dateNaissance,
      lieuNaissance,
      photo: photoUrl,
      documents: documentUrls,
      role
    });

    // Sauvegarde de l'utilisateur dans la base de données
    await newUser.save();

    // Envoi de la réponse : succès
    return res.render('inscription', {
      success: "Inscription réussie ! Vous pouvez maintenant vous connecter."
    });

  } catch (error) {
    console.error("Erreur d'inscription:", error);
    // En cas d'erreur : affichage d'un message d'erreur
    res.render('inscription', {
      error: "Une erreur est survenue. Veuillez réessayer.",
      formData: req.body
    });
  }
};
