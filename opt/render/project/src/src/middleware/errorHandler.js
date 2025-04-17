const { ErrorResponse } = require('../utils/ErrorResponse');

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log pour le développement
  console.error(err.stack);

  // Erreurs Mongoose
  if (err.name === 'CastError') {
    error = ErrorResponse.handleCastError(err);
  }

  if (err.code === 11000) {
    error = ErrorResponse.handleDuplicateFieldError(err);
  }

  if (err.name === 'ValidationError') {
    error = ErrorResponse.handleValidationError(err);
  }

  // Envoi de la réponse d'erreur
  res.status(error.statusCode || 500).json(error.toJSON());
};

module.exports = errorHandler;
