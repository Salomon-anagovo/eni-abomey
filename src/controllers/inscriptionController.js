const fs = require('fs');
const path = require('path');
const Inscription = require('../models/Inscription');
const cloudinary = require('../config/cloudinary');
const bcrypt = require('bcryptjs');

exports.handleInscription = async (req, res) => {
  try {
    const {
      nom, prenom, email, password,
      pays, indicatif, telephone,
      dateNaissance, lieuNaissance, role, conditions
    } = req.body;

    const emailExist = await Inscription.findOne({ email });
    if (emailExist) {
      return res.render('public/inscription', {
        error: "Cet email est déjà utilisé.",
        formData: req.body
      });
    }

    if (!conditions) {
      return res.render('public/inscription', {
        error: "Vous devez accepter les conditions d'utilisation.",
        formData: req.body
      });
    }

    // 🔸 Upload photo
    let photoUrl = '';
    let photoPublicId = '';
    if (req.files && req.files.photo && req.files.photo[0]) {
      const photoPath = req.files.photo[0].path;
      const photoResult = await cloudinary.uploader.upload(photoPath, {
        folder: 'eni/photos'
      });
      photoUrl = photoResult.secure_url;
      photoPublicId = photoResult.public_id;
      fs.unlinkSync(photoPath); // Supprimer fichier local
    }

    // 🔸 Upload documents
    let documentsData = [];
    if (req.files && req.files.documents) {
      for (const file of req.files.documents) {
        const docPath = file.path;
        const result = await cloudinary.uploader.upload(docPath, {
          folder: 'eni/documents',
          resource_type: 'auto'
        });
        documentsData.push({
          url: result.secure_url,
          public_id: result.public_id
        });
        fs.unlinkSync(docPath); // Supprimer fichier local
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

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
      documents: documentsData
    });

    await newUser.save();

    return res.render('public/inscription', {
      success: "Inscription réussie ! Vous pouvez maintenant vous connecter."
    });

  } catch (error) {
    console.error("Erreur d'inscription:", error);
    res.render('public/inscription', {
      error: "Une erreur est survenue. Veuillez réessayer.",
      formData: req.body
    });
  }
};
