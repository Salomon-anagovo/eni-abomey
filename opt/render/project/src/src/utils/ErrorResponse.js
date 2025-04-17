class ErrorResponse extends Error {
  constructor(message, statusCode, details = {}) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);

    this.logMessage = `[${new Date().toISOString()}] ${this.constructor.name}: ${message} (${statusCode})`;
  }

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

  static handleValidationError(err) {
    const messages = Object.values(err.errors).map(val => val.message);
    return new ErrorResponse(messages.join(', '), 400, {
      type: 'ValidationError',
      fields: Object.keys(err.errors)
    });
  }

  static handleDuplicateFieldError(err) {
    const field = Object.keys(err.keyValue)[0];
    return new ErrorResponse(`${field} existe déjà`, 400, {
      type: 'DuplicateField',
      field,
      value: err.keyValue[field]
    });
  }

  static handleCastError(err) {
    return new ErrorResponse(`Ressource introuvable`, 404, {
      type: 'InvalidId',
      value: err.value
    });
  }
}

// Exportation en CommonJS
module.exports = {
  ErrorResponse,
  badRequest: (message = 'Requête invalide') => new ErrorResponse(message, 400),
  unauthorized: (message = 'Non autorisé') => new ErrorResponse(message, 401),
  forbidden: (message = 'Accès refusé') => new ErrorResponse(message, 403),
  notFound: (message = 'Ressource non trouvée') => new ErrorResponse(message, 404),
  serverError: (message = 'Erreur serveur') => new ErrorResponse(message, 500)
};
