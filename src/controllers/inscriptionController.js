const bcrypt = require('bcrypt');
const User = require('../models/Inscription');
const nodemailer = require('nodemailer');
const { v4: uuidv4 } = require('uuid');

// Création d’un transporteur d’emails
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_FROM,
    pass: process.env.EMAIL_PASSWORD
  }
});

exports.getInscriptionForm = (req, res) => {
  res.render('public/inscription', { title: 'Inscription publique', currentYear: new Date().getFullYear() });
};

exports.postInscriptionForm = async (req, res) => {
  const { nom, prenom, email, telephone, pays, role, password } = req.body;

  if (!nom || !prenom || !email || !telephone || !pays || !role || !password) {
    return res.render('public/inscription', {
      title: 'Inscription publique',
      error: 'Veuillez remplir tous les champs requis.',
      currentYear: new Date().getFullYear()
    });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.render('public/inscription', {
        title: 'Inscription publique',
        error: 'Cet email est déjà inscrit.',
        currentYear: new Date().getFullYear()
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const confirmationToken = uuidv4();

    const newUser = await User.create({
      nom,
      prenom,
      email,
      telephone,
      pays,
      role,
      password: hashedPassword,
      confirmationToken,
      confirmed: false,
      dateInscription: new Date()
    });

    const confirmUrl = `${req.protocol}://${req.get('host')}/confirmation/${confirmationToken}`;

    await transporter.sendMail({
      from: `ENI Abomey <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: 'Confirmation de votre inscription',
      html: `<p>Bonjour ${prenom},</p>
             <p>Merci pour votre inscription. Cliquez sur le lien ci-dessous pour confirmer votre compte :</p>
             <p><a href="${confirmUrl}">${confirmUrl}</a></p>
             <p>ENI Abomey</p>`
    });

    res.render('public/inscription', {
      title: 'Inscription publique',
      success: 'Inscription réussie ! Un email de confirmation vous a été envoyé.',
      currentYear: new Date().getFullYear()
    });
  } catch (err) {
    console.error(err);
    res.render('public/inscription', {
      title: 'Inscription publique',
      error: 'Une erreur est survenue. Veuillez réessayer.',
      currentYear: new Date().getFullYear()
    });
  }
};

exports.confirmInscription = async (req, res) => {
  const { token } = req.params;

  try {
    const user = await User.findOne({ confirmationToken: token });

    if (!user) {
      return res.send('Lien de confirmation invalide ou expiré.');
    }

    user.confirmed = true;
    user.confirmationToken = null;
    await user.save();

    res.send('Votre compte a été confirmé avec succès ! Vous pouvez maintenant vous connecter.');
  } catch (err) {
    console.error(err);
    res.send('Une erreur est survenue lors de la confirmation.');
  }
};
