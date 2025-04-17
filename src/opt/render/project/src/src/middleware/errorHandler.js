const { ErrorResponse } = require('../utils/ErrorResponse');

const errorHandler = (err, req, res, next) => {
  // Log complet en développement
  if (process.env.NODE_ENV !== 'production') {
    console.error('[ERROR]', {
      message: err.message,
      stack: err.stack,
      type: err.name,
      code: err.code
    });
  }

  let error = err;

  // Transformations des erreurs Mongoose
  switch (true) {
    case err.name === 'CastError':
      error = ErrorResponse.handleCastError(err);
      break;
    case err.code === 11000:
      error = ErrorResponse.handleDuplicateFieldError(err);
      break;
    case err.name === 'ValidationError':
      error = ErrorResponse.handleValidationError(err);
      break;
    case !error.statusCode:
      error = new ErrorResponse(err.message, 500);
  }

  // Réponse sécurisée
  res.status(error.statusCode).json({
    success: false,
    error: error.message,
    ...(process.env.NODE_ENV !== 'production' && {
      stack: error.stack,
      details: error.details
    })
  });
};

module.exports = errorHandler;