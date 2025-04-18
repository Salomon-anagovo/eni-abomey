const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const Inscription = require('../models/Inscription');
const { uploadToCloudinary, deleteFromCloudinary } = require('../config/cloudinary');
const sendConfirmationEmail = require('../utils/emailService');

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];

const validateFile = (file) => {
  if (!file) return false;
  if (file.size > MAX_FILE_SIZE) throw new Error('Fichier trop volumineux (>5MB)');
  if (!ALLOWED_FILE_TYPES.includes(file.mimetype)) throw new Error('Type de fichier non supporté');
  return true;
};

const cleanupFiles = (files) => {
  if (!files) return;
  
  Object.values(files).forEach(fileArray => {
    fileArray.forEach(file => {
      try {
        if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      } catch (err) {
        console.error(`Erreur suppression ${file.path}:`, err);
      }
    });
  });
};

exports.handleInscription = async (req, res) => {
  const requiredFields = ['nom', 'prenom', 'email', 'password', 'pays', 
                        'telephone', 'dateNaissance', 'lieuNaissance', 'role'];
  const missingFields = requiredFields.filter(field => !req.body[field]);

  if (missingFields.length > 0) {
    return res.status(400).render('public/inscription', {
      error: `Champs manquants: ${missingFields.join(', ')}`,
      formData: req.body
    });
  }

  if (req.body.conditions !== 'on') {
    return res.status(400).render('public/inscription', {
      error: "Vous devez accepter les conditions",
      formData: req.body
    });
  }

  try {
    const [emailExist, phoneExist] = await Promise.all([
      Inscription.findOne({ email: req.body.email }),
      Inscription.findOne({ telephone: req.body.telephone })
    ]);

    if (emailExist) throw new Error("Email déjà utilisé");
    if (phoneExist) throw new Error("Téléphone déjà utilisé");

    // Traitement fichiers
    let photoData = null;
    let documentsData = [];
    let uploadErrors = [];

    try {
      // Photo principale
      if (req.files?.photo?.[0]) {
        validateFile(req.files.photo[0]);
        const result = await uploadToCloudinary(req.files.photo[0], 'eni/photos');
        photoData = { url: result.secure_url, public_id: result.public_id };
      } else {
        throw new Error("Photo obligatoire");
      }

      // Documents
      if (req.files?.documents) {
        await Promise.all(req.files.documents.map(async (file) => {
          try {
            validateFile(file);
            const result = await uploadToCloudinary(file, 'eni/documents');
            documentsData.push({
              url: result.secure_url,
              public_id: result.public_id
            });
          } catch (err) {
            uploadErrors.push(`Document ${file.originalname}: ${err.message}`);
          }
        }));
      }

      if (uploadErrors.length > 0) {
        throw new Error(uploadErrors.join('\n'));
      }
    } catch (uploadError) {
      // Rollback des uploads réussis
      if (photoData?.public_id) await deleteFromCloudinary(photoData.public_id);
      await Promise.all(documentsData.map(doc => 
        deleteFromCloudinary(doc.public_id)
      ));
      throw uploadError;
    } finally {
      cleanupFiles(req.files);
    }

    // Création utilisateur
    const confirmationToken = crypto.randomBytes(20).toString('hex');
    const newUser = new Inscription({
      ...req.body,
      dateNaissance: new Date(req.body.dateNaissance),
      password: await bcrypt.hash(req.body.password, 12),
      photo: photoData,
      documents: documentsData,
      conditions: true,
      confirmationToken
    });

    await newUser.save();
    await sendConfirmationEmail(newUser.email, confirmationToken);

    return res.status(201).render('public/inscription', {
      success: "Inscription réussie! Vérifiez votre email pour confirmer.",
      formData: {}
    });

  } catch (error) {
    console.error("Erreur inscription:", {
      error: error.message,
      stack: error.stack,
      body: req.body
    });

    return res.status(500).render('public/inscription', {
      error: error.message || "Erreur lors de l'inscription",
      formData: req.body
    });
  }
};