export const extractUserData = (accessToken) => {
    const payload = accessToken.split('.')[1];
    return JSON.parse(decodeFromBase64(payload));
};

export const decodeFromBase64 = (encodedString) => {
    const base64 = encodedString.replace(/-/g, '+').replace(/_/g, '/');
    return atob(base64);
    // const bytes = Uint8Array.fromBase64(encodedString);
    // return new TextDecoder().decode(bytes);
};

export const showInputError = (input, inputError, mainValidation) => {
    input.setAttribute('aria-invalid', true);
    inputError.textContent = input.validationMessage;
    inputError.classList.add('visible');
    mainValidation.classList.add('visible');
};

export const clearInputError = (input, inputError, mainValidation) => {
    input.setAttribute('aria-invalid', false);
    inputError.textContent = '';
    inputError.classList.remove('visible');
    mainValidation.textContent = '';
    mainValidation.classList.remove('visible');
};
