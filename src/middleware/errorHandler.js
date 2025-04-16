const ErrorResponse = require('../utils/ErrorResponse');

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log pour le développement
  console.error(err.stack.red);

  // Erreurs Mongoose
  if (err.name === 'CastError') {
    const message = `Ressource introuvable avec l'ID ${err.value}`;
    error = new ErrorResponse(message, 404);
  }

  // Duplication de clé Mongoose
  if (err.code === 11000) {
    const message = 'Valeur dupliquée dans la base de données';
    error = new ErrorResponse(message, 400);
  }

  // Validation Mongoose
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message);
    error = new ErrorResponse(message, 400);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Erreur serveur'
  });
};

module.exports = errorHandler;