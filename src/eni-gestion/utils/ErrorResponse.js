class ErrorResponse extends Error {
  /**
   * Crée une réponse d'erreur personnalisée
   * @param {string} message - Message d'erreur
   * @param {number} statusCode - Code HTTP (400, 404, 500...)
   * @param {object} details - Détails supplémentaires (optionnel)
   */
  constructor(message, statusCode, details = {}) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true; // Pour distinguer les erreurs opérationnelles des bugs

    // Capture de la stack trace (utile pour le débogage)
    Error.captureStackTrace(this, this.constructor);

    // Formatage pour les logs
    this.logMessage = `[${new Date().toISOString()}] ${this.constructor.name}: ${message} (${statusCode})`;
  }

  /**
   * Formatte l'erreur pour la réponse API
   */
  toJSON() {
    return {
      success: false,
      error: this.message,
      statusCode: this.statusCode,
      ...(process.env.NODE_ENV === 'development' && {
        stack: this.stack,
        details: this.details
      })
    };
  }

  /**
   * Erreurs de validation Mongoose
   */
  static handleValidationError(err) {
    const messages = Object.values(err.errors).map(val => val.message);
    return new ErrorResponse(messages.join(', '), 400, {
      type: 'ValidationError',
      fields: Object.keys(err.errors)
    });
  }

  /**
   * Erreur de duplication (clé unique)
   */
  static handleDuplicateFieldError(err) {
    const field = Object.keys(err.keyValue)[0];
    return new ErrorResponse(`${field} existe déjà`, 400, {
      type: 'DuplicateField',
      field,
      value: err.keyValue[field]
    });
  }

  /**
   * Erreur CastError (ID invalide)
   */
  static handleCastError(err) {
    return new ErrorResponse(`Ressource introuvable`, 404, {
      type: 'InvalidId',
      value: err.value
    });
  }
}

export default ErrorResponse;

// Erreurs prédéfinies pour une utilisation facile
export const badRequest = (message = 'Requête invalide') => new ErrorResponse(message, 400);
export const unauthorized = (message = 'Non autorisé') => new ErrorResponse(message, 401);
export const forbidden = (message = 'Accès refusé') => new ErrorResponse(message, 403);
export const notFound = (message = 'Ressource non trouvée') => new ErrorResponse(message, 404);
export const serverError = (message = 'Erreur serveur') => new ErrorResponse(message, 500);