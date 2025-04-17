const { ErrorResponse } = require('../utils/ErrorResponse');

const errorHandler = (err, req, res, next) => {
  // Copie de l'erreur avec message
  const error = { ...err, message: err.message };

  // Log en développement
  if (process.env.NODE_ENV === 'development') {
    console.error('[ErrorHandler]', {
      message: err.message,
      stack: err.stack,
      name: err.name,
      code: err.code
    });
  }

  // Transformations des erreurs
  if (err.name === 'CastError') error = ErrorResponse.handleCastError(err);
  if (err.code === 11000) error = ErrorResponse.handleDuplicateFieldError(err);
  if (err.name === 'ValidationError') error = ErrorResponse.handleValidationError(err);

  // Réponse finale (avec fallback)
  res.status(error.statusCode || 500).json(
    error.toJSON?.() || {
      success: false,
      error: error.message || 'Erreur serveur',
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    }
  );
};

module.exports = errorHandler;