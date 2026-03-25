import { ValidationError } from "./errors.js";

const isValidEmail = (email, isNew = false) => {
    if (!email) {
        throw new ValidationError("Email is required.");
    }

    if (typeof email !== "string") {
        throw new ValidationError("Email must be a string.");
    }

    if (isNew) {
        const trimmed = email.trim();

        if (trimmed.length > 255) {
            throw new ValidationError("Email must not exceed 255 characters.");
        }

        const regexp = /^([^\s@]+)@([^\s@]+)\.([^\s@]+)$/;
        if (!regexp.test(trimmed)) {
            throw new ValidationError("Email is invalid.");
        }
    }

    return true;
};

const isValidPassword = (password, isNew = false) => {
    if (!password) {
        throw new ValidationError("Password is required.");
    }

    if (typeof password !== "string") {
        throw new ValidationError("Password must be a string.");
    }

    if (isNew) {
        const regexp = /\d/;
        if (!regexp.test(password)) {
            throw new ValidationError(
                "Password must include at least one number.",
            );
        }

        const trimmed = password.trim();

        if (trimmed.length < 8 || trimmed.length > 20) {
            throw new ValidationError("Password must be 8-20 characters.");
        }
    }

    return true;
};

const isValidName = (name) => {
    if (!name) {
        throw new ValidationError("Name is required.");
    }

    if (typeof name !== "string") {
        throw new ValidationError("Name must be a string.");
    }

    const trimmed = name.trim();
    if (trimmed.length < 3 || trimmed.length > 255) {
        throw new ValidationError("Name should be 3-255 characters.");
    }

    return true;
};

const isValidDateFormat = (dateStr) => {
    const regexp = /^(\d{4})-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[01])$/; //yyyy-mm-dd
    if (!regexp.test(dateStr)) {
        throw new ValidationError("Date format is invalid. Must be yyyy-mm-dd");
    }

    return true;
};

const isValidDate = (dateStr) => {
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

    throw new ValidationError("Date is invalid.");
};

const isValidUser = (user) => {
    isValidEmail(user.email, true);
    isValidPassword(user.password, true);
    isValidName(user.name);
    isValidDate(user.bdate);

    return true;
};

export { isValidUser, isValidEmail, isValidPassword };
