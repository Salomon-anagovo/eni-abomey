const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'ton.email@gmail.com',
    pass: 'ton_mot_de_passe_app'
  }
});

const sendConfirmationEmail = (userEmail, token) => {
  const confirmationLink = `https://ton-domaine.com/confirmation/${token}`;

  const mailOptions = {
    from: '"ENI Abomey" <ton.email@gmail.com>',
    to: userEmail,
    subject: 'Confirmation de votre inscription',
    html: `
      <h2>Bienvenue sur la plateforme ENI Abomey !</h2>
      <p>Merci pour votre inscription. Veuillez confirmer votre adresse e-mail en cliquant sur le lien ci-dessous :</p>
      <a href="${confirmationLink}">Confirmer mon inscription</a>
    `
  };

  return transporter.sendMail(mailOptions);
};

module.exports = sendConfirmationEmail;
