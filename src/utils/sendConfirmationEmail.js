const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'salomonanagovo@gmail.com',
    pass: 'Samlas1990'
  }
});

const sendConfirmationEmail = (userEmail, token) => {
  const confirmationLink = `https://https://eni-abomey.onrender.com//confirmation/${token}`;

  const mailOptions = {
    from: '"ENI Abomey" <salomonanagovo@gmail.com>',
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
