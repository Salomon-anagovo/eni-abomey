const Inscription = require('../models/Inscription');
const bcrypt = require('bcryptjs');
const cloudinary = require('cloudinary').v2;
const { v4: uuidv4 } = require('uuid');

// Configuration Cloudinary (à ne pas oublier dans un fichier de config idéalement)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dsyfvqez3',
  api_key: process.env.CLOUDINARY_API_KEY || '457376748291975',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'b6MHplyw3UGs9lqlKM-2x0Lklj8'
});

exports.inscriptionPost = async (req, res) => {
  try {
    const {
      nom,
      prenom,
      email,
      telephone,
      pays,
      indicatif,
      dateNaissance,
      lieuNaissance,
      role,
      password,
      conditions
    } = req.body;

    // Vérifications de base
    if (!conditions) {
      return res.render('inscription', { error: 'Vous devez accepter les conditions d’utilisation.' });
    }

    const existingUser = await Inscription.findOne({ email });
    if (existingUser) {
      return res.render('inscription', { error: 'Cet email est déjà utilisé.' });
    }

    // Upload de la photo
    let photoUrl = '';
    if (req.files && req.files.photo && req.files.photo[0]) {
      const result = await cloudinary.uploader.upload(req.files.photo[0].path, {
        folder: 'eni_inscriptions/photos',
        public_id: uuidv4()
      });
      photoUrl = result.secure_url;
    }

    // Upload des documents
    let documentUrls = [];
    if (req.files && req.files.documents) {
      for (const doc of req.files.documents) {
        const result = await cloudinary.uploader.upload(doc.path, {
          folder: 'eni_inscriptions/documents',
          public_id: uuidv4(),
          resource_type: 'auto'
        });
        documentUrls.push(result.secure_url);
      }
    }

    // Hash du mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new Inscription({
      nom,
      prenom,
      email,
      telephone,
      pays,
      indicatif,
      dateNaissance,
      lieuNaissance,
      role,
      password: hashedPassword,
      conditions: true,
      photo: photoUrl,
      documents: documentUrls,
      confirmationToken: uuidv4(),
      confirmed: false
    });

    await newUser.save();
    return res.redirect('/confirmation');
  } catch (err) {
    console.error(err);
    res.render('inscription', { error: "Une erreur s’est produite lors de l'inscription." });
  }
};
