// Solution 1: Version CommonJS garantie
const path = require('path');
const { ErrorResponse } = require(path.join(__dirname, '../../utils/ErrorResponse'));

const errorHandler = (err, req, res, next) => {
  // Log complet en développement
  console.error('[ErrorHandler]', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    type: err.name,
    statusCode: err.statusCode
  });

  // Gestion des erreurs Mongoose
  const error = err.name === 'CastError' ? ErrorResponse.handleCastError(err)
    : err.code === 11000 ? ErrorResponse.handleDuplicateFieldError(err)
    : err.name === 'ValidationError' ? ErrorResponse.handleValidationError(err)
    : err;

  // Réponse sécurisée
  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Erreur serveur',
    ...(process.env.NODE_ENV === 'development' && {
      stack: error.stack,
      details: error.details
    })
  });
};

module.exports = errorHandler;