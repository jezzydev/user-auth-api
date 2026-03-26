import { ValidationError } from "./errors.js";

const errorCodes = {
    REQUIRED: "REQUIRED",
    INVALID_TYPE: "INVALID_TYPE",
    INVALID_LENGTH: "INVALID_LENGTH",
    INVALID_FORMAT: "INVALID_FORMAT",
    INVALID: "INVALID",
};
const isValidEmail = (email, isNew = false) => {
    const field = "email";

    if (!email) {
        throw new ValidationError(
            "Email is required.",
            field,
            errorCodes.REQUIRED,
        );
    }

    if (typeof email !== "string") {
        throw new ValidationError(
            "Email must be a string.",
            field,
            errorCodes.INVALID_TYPE,
        );
    }

    if (isNew) {
        const trimmed = email.trim();

        if (trimmed.length > 255) {
            throw new ValidationError(
                "Email must not exceed 255 characters.",
                field,
                errorCodes.INVALID_LENGTH,
            );
        }

        const regexp = /^([^\s@]+)@([^\s@]+)\.([^\s@]+)$/;
        if (!regexp.test(trimmed)) {
            throw new ValidationError(
                "Email is invalid.",
                field,
                errorCodes.INVALID,
            );
        }
    }

    return true;
};

const isValidPassword = (password, isNew = false) => {
    const field = "password";

    if (!password) {
        throw new ValidationError(
            "Password is required.",
            field,
            errorCodes.REQUIRED,
        );
    }

    if (typeof password !== "string") {
        throw new ValidationError(
            "Password must be a string.",
            field,
            errorCodes.INVALID_TYPE,
        );
    }

    if (isNew) {
        const regexp = /\d/;
        if (!regexp.test(password)) {
            throw new ValidationError(
                "Password must include at least one number.",
                field,
                errorCodes.INVALID,
            );
        }

        const trimmed = password.trim();

        if (trimmed.length < 8 || trimmed.length > 20) {
            throw new ValidationError(
                "Password must be 8-20 characters.",
                field,
                errorCodes.INVALID_LENGTH,
            );
        }
    }

    return true;
};

const isValidName = (name) => {
    const field = "name";

    if (!name) {
        throw new ValidationError(
            "Name is required.",
            field,
            errorCodes.REQUIRED,
        );
    }

    if (typeof name !== "string") {
        throw new ValidationError(
            "Name must be a string.",
            field,
            errorCodes.INVALID_TYPE,
        );
    }

    const trimmed = name.trim();
    if (trimmed.length < 3 || trimmed.length > 255) {
        throw new ValidationError(
            "Name should be 3-255 characters.",
            field,
            errorCodes.INVALID_LENGTH,
        );
    }

    return true;
};

const isValidDateFormat = (dateStr) => {
    const field = "date";
    const regexp = /^(\d{4})-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[01])$/; //yyyy-mm-dd
    if (!regexp.test(dateStr)) {
        throw new ValidationError(
            "Date format is invalid. Must be yyyy-mm-dd",
            field,
            errorCodes.INVALID_FORMAT,
        );
    }

    return true;
};

const isValidDate = (dateStr) => {
    const field = "date";
    isValidDateFormat(dateStr);

    const parts = dateStr.split("-");
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    const date = new Date(year, month, day);

    if (
        year === date.getFullYear() &&
        month === date.getMonth() &&
        day === date.getDate()
    ) {
        return true;
    }

    throw new ValidationError("Date is invalid.", field, errorCodes.INVALID);
};

const isValidUser = (user) => {
    isValidEmail(user.email, true);
    isValidPassword(user.password, true);
    isValidName(user.name);
    isValidDate(user.bdate);

    return true;
};

export { isValidUser, isValidEmail, isValidPassword };
