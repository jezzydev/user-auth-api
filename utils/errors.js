class ValidationError extends Error {
    constructor(message, field, code) {
        super(message);
        this.status = 400;
        this.name = "ValidationError";
        this.field = field;
        this.code = code;
        this.message = message;
    }
}

class NotFoundError extends Error {
    constructor(message) {
        super(message);
        this.status = 404;
        this.name = "NotFoundError";
        this.message = message;
    }
}

class AuthenticationError extends Error {
    constructor(message) {
        super(message);
        this.status = 401;
        this.name = "AuthenticationError";
        this.message = message;
    }
}

class AuthorizationError extends Error {
    constructor(message) {
        super(message);
        this.status = 403;
        this.name = "AuthorizationError";
        this.message = message;
    }
}

export {
    ValidationError,
    NotFoundError,
    AuthenticationError,
    AuthorizationError,
};
