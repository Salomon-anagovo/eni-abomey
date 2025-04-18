const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const Inscription = require('../models/Inscription');
const { uploadFromBuffer, deleteResource } = require('../config/cloudinary');
const sendConfirmationEmail = require('../utils/emailService');
const logger = require('../utils/logger');

// Configuration
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf'
];

const validateFile = (file) => {
  if (!file) throw new Error('Aucun fichier fourni');
  if (file.size > MAX_FILE_SIZE) throw new Error(`Fichier trop volumineux (> ${MAX_FILE_SIZE/1024/1024}MB)`);
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    throw new Error('Formats acceptés: JPEG, PNG, WEBP, PDF');
  }
};

exports.handleInscription = async (req, res) => {
  // 1. Liste complète des champs obligatoires (incluant l'indicatif)
  const requiredFields = [
    'nom', 'prenom', 'email', 'password',
    'pays', 'indicatif', 'telephone',
    'dateNaissance', 'lieuNaissance', 'role'
  ];

  // 2. Validation des champs
  const missingFields = requiredFields.filter(field => !req.body[field]);
  if (missingFields.length > 0) {
    return res.status(400).render('public/inscription', {
      error: `Champs manquants: ${missingFields.join(', ')}`,
      formData: req.body
    });
  }

  // 3. Validation des conditions
  if (req.body.conditions !== 'on') {
    return res.status(400).render('public/inscription', {
      error: "Vous devez accepter les conditions",
      formData: req.body
    });
  }

  try {
    // 4. Vérification des doublons (email + téléphone complet avec indicatif)
    const [emailExist, phoneExist] = await Promise.all([
      Inscription.findOne({ email: req.body.email }),
      Inscription.findOne({ 
        telephone: req.body.telephone,
        indicatif: req.body.indicatif 
      })
    ]);

    if (emailExist) throw new Error('Email déjà utilisé');
    if (phoneExist) throw new Error('Numéro de téléphone déjà enregistré');

    // 5. Traitement des fichiers
    let photoData = null;
    let documentsData = [];
    let uploadErrors = [];

    try {
      // Photo principale
      if (!req.files?.photo?.[0]) throw new Error('Photo obligatoire');
      
      validateFile(req.files.photo[0]);
      const photoResult = await uploadFromBuffer(
        req.files.photo[0].buffer,
        'profiles'
      );
      photoData = {
        url: photoResult.secure_url,
        public_id: photoResult.public_id
      };

      // Documents supplémentaires
      if (req.files?.documents) {
        await Promise.all(req.files.documents.map(async (file) => {
          try {
            validateFile(file);
            const docResult = await uploadFromBuffer(
              file.buffer,
              'documents'
            );
            documentsData.push({
              url: docResult.secure_url,
              public_id: docResult.public_id
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
      // Rollback en cas d'erreur
      if (photoData?.public_id) await deleteResource(photoData.public_id);
      await Promise.all(documentsData.map(doc => 
        deleteResource(doc.public_id)
      );
      throw uploadError;
    }

    // 6. Création de l'utilisateur avec TOUS les champs
    const confirmationToken = crypto.randomBytes(20).toString('hex');
    const hashedPassword = await bcrypt.hash(req.body.password, 12);

    const newUser = new Inscription({
      // Informations personnelles
      nom: req.body.nom,
      prenom: req.body.prenom,
      email: req.body.email,
      password: hashedPassword,
      
      // Coordonnées
      pays: req.body.pays,
      indicatif: req.body.indicatif,
      telephone: req.body.telephone,
      
      // Informations de naissance
      dateNaissance: new Date(req.body.dateNaissance),
      lieuNaissance: req.body.lieuNaissance,
      
      // Rôle et compte
      role: req.body.role,
      conditions: true,
      confirmed: false,
      confirmationToken,
      
      // Fichiers
      photo: photoData,
      documents: documentsData,
      
      // Métadonnées
      dateInscription: new Date()
    });

    await newUser.save();

    // 7. Envoi de l'email de confirmation
    await sendConfirmationEmail({
      email: newUser.email,
      token: confirmationToken,
      user: {
        nom: newUser.nom,
        prenom: newUser.prenom
      }
    });

    // 8. Réponse finale
    return res.status(201).render('public/inscription', {
      success: "Inscription réussie ! Vérifiez votre email pour confirmer.",
      formData: {}
    });

  } catch (error) {
    logger.error('Erreur inscription:', {
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
