/**
 * Wrapper pour les contrôleurs async/await
 * @param {Function} fn - Fonction du contrôleur async
 * @returns {Function} Middleware Express avec gestion d'erreur
 */
const asyncHandler = (fn) => (req, res, next) => {
  // Vérification que c'est bien une fonction async
  if (!(fn instanceof Function)) {
    throw new Error('asyncHandler doit wrapper une fonction');
  }

  // Exécution avec capture des erreurs
  Promise.resolve(fn(req, res, next)).catch((err) => {
    // Log technique détaillé
    console.error(`[AsyncHandler] ${err.stack}`);

    // Transformation des erreurs Mongoose en ErrorResponse
    if (err.name === 'ValidationError') {
      next(ErrorResponse.handleValidationError(err));
    } else if (err.code === 11000) {
      next(ErrorResponse.handleDuplicateFieldError(err));
    } else if (err.name === 'CastError') {
      next(ErrorResponse.handleCastError(err));
    } else {
      next(err); // Passe à l'errorHandler middleware
    }
  });
};

export default asyncHandler;

/**
 * Version pour les tests unitaires (sans next)
 */
export const asyncHandlerTest = (fn) => async (...args) => {
  try {
    return await fn(...args);
  } catch (err) {
    // Transformation des erreurs pour les tests
    if (err.name === 'ValidationError') {
      throw ErrorResponse.handleValidationError(err);
    }
    throw err;
  }
};