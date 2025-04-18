const Inscription = require('../models/Inscription');
const cloudinary = require('../config/cloudinary');
const bcrypt = require('bcryptjs');

// Traitement de l'inscription
exports.handleInscription = async (req, res) => {
  try {
    // Extraction des données du formulaire
    const {
      nom, prenom, email, password,
      pays, indicatif, telephone,
      dateNaissance, lieuNaissance, role, conditions
    } = req.body;

    // Vérification de l'unicité de l'email
    const emailExist = await Inscription.findOne({ email });
    if (emailExist) {
      return res.render('inscription', {
        error: "Cet email est déjà utilisé.",
        formData: req.body
      });
    }

    // Vérification si l'utilisateur a accepté les conditions
    if (!conditions) {
      return res.render('inscription', {
        error: "Vous devez accepter les conditions d'utilisation.",
        formData: req.body
      });
    }

    // Gestion de l'upload de la photo de profil
    let photoUrl = '';
    let photoPublicId = '';
    if (req.files && req.files.photo && req.files.photo[0]) {
      const photoUpload = await cloudinary.uploader.upload_stream(
        { folder: "eni/photos" },
        (error, result) => {
          if (result) {
            photoUrl = result.secure_url;
            photoPublicId = result.public_id;
          }
        }
      );
      req.files.photo[0].stream.pipe(photoUpload);
    }

    // Gestion de l'upload des documents
    let documentUrls = [];
    let documentPublicIds = [];
    if (req.files && req.files.documents) {
      for (const file of req.files.documents) {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: "eni/documents", resource_type: "auto" },
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

    // Hachage du mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Création du nouvel utilisateur
    const newUser = new Inscription({
      nom,
      prenom,
      email,
      password: hashedPassword,
      pays,
      indicatif,
      telephone,
      dateNaissance,
      lieuNaissance,
      role,
      conditions,
      photo: { url: photoUrl, public_id: photoPublicId },
      documents: req.files.documents ? req.files.documents.map((file, index) => ({
        url: documentUrls[index],
        public_id: documentPublicIds[index]
      })) : [],
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
