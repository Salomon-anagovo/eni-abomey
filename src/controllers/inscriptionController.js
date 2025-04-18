const User = require('../models/User');
const cloudinary = require('../config/cloudinary');
const multer = require('multer');

// Multer config local temporaire (utile si tu veux aussi garder une copie locale)
const storage = multer.memoryStorage();
const upload = multer({ storage });

exports.showForm = (req, res) => {
  res.render('inscription');
};

exports.handleInscription = async (req, res) => {
  try {
    const {
      nom, prenom, email, password,
      pays, indicatif, telephone,
      dateNaissance, lieuNaissance, role
    } = req.body;

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

    // Upload de la photo
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

    // Upload des documents
    let documentUrls = [];
    if (req.files && req.files.documents) {
      for (const file of req.files.documents) {
        const upload = await cloudinary.uploader.upload_stream(
          { folder: "eni/documents", resource_type: "auto" },
          (error, result) => {
            if (result) documentUrls.push(result.secure_url);
          }
        );
        file.stream.pipe(upload);
      }
    }

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

    await newUser.save();

    return res.render('inscription', {
      success: "Inscription réussie ! Vous pouvez maintenant vous connecter.",
    });

  } catch (error) {
    console.error("Erreur d'inscription:", error);
    res.render('inscription', {
      error: "Une erreur est survenue. Veuillez réessayer.",
      formData: req.body
    });
  }
};
