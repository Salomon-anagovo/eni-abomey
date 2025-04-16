import User from '../models/User.js';
import ErrorResponse from '../utils/errorResponse.js';
import sendEmail from '../utils/mailer.js';
import crypto from 'crypto';

// @desc    Connexion utilisateur
// @route   POST /api/v1/auth/login
// @access  Public
export const login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    // Vérification des champs
    if (!email || !password) {
      return next(new ErrorResponse('Veuillez fournir un email et un mot de passe', 400));
    }

    // Recherche de l'utilisateur
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return next(new ErrorResponse('Identifiants invalides', 401));
    }

    // Vérification du mot de passe
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return next(new ErrorResponse('Identifiants invalides', 401));
    }

    // Vérification du compte actif
    if (!user.isActive) {
      return next(new ErrorResponse('Votre compte est désactivé', 403));
    }

    // Génération du token
    const token = user.generateAuthToken();

    // Mise à jour de la dernière connexion
    user.lastLogin = Date.now();
    await user.save();

    res.status(200).json({
      success: true,
      token,
      role: user.role
    });

  } catch (err) {
    next(err);
  }
};

// @desc    Réinitialisation du mot de passe
// @route   POST /api/v1/auth/forgotpassword
// @access  Public
export const forgotPassword = async (req, res, next) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return next(new ErrorResponse('Aucun utilisateur avec cet email', 404));
    }

    // Génération du token
    const resetToken = user.getResetPasswordToken();
    await user.save();

    // Création du lien de réinitialisation
    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/auth/resetpassword/${resetToken}`;

    // Envoi de l'email
    const message = `
      <h2>Réinitialisation de votre mot de passe</h2>
      <p>Cliquez sur le lien suivant pour réinitialiser votre mot de passe :</p>
      <a href="${resetUrl}" target="_blank">${resetUrl}</a>
      <p><b>Ce lien expire dans 10 minutes</b></p>
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Réinitialisation de mot de passe - ENI Gestion',
        message
      });

      res.status(200).json({
        success: true,
        message: 'Email envoyé avec succès'
      });

    } catch (err) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();

      return next(new ErrorResponse('Email n\'a pas pu être envoyé', 500));
    }

  } catch (err) {
    next(err);
  }
};