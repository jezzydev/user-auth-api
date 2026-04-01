import * as api from './api.js';
import * as util from './utils.js';

const registerForm = document.querySelector('#register-form');
const registerValidationMsg = document.querySelector(
    '#register-form .validation-msg',
);

registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nameInput = document.getElementById('name');
    if (!nameInput.checkValidity()) {
        util.showInputError(
            nameInput,
            document.getElementById('name-error'),
            registerValidationMsg,
        );
    }

    const emailInput = document.getElementById('email');
    if (!emailInput.checkValidity()) {
        util.showInputError(
            emailInput,
            document.getElementById('email-error'),
            registerValidationMsg,
        );
    }

    const passwordInput = document.getElementById('password');
    if (!passwordInput.checkValidity()) {
        util.showInputError(
            passwordInput,
            document.getElementById('password-error'),
            registerValidationMsg,
        );
    }

    const bdateInput = document.getElementById('bdate');
    if (!bdateInput.checkValidity()) {
        util.showInputError(
            bdateInput,
            document.getElementById('bdate-error'),
            registerValidationMsg,
        );
    }

    if (registerForm.checkValidity()) {
        const formData = new FormData(e.target);
        await registerUser(formData);
    }
});

registerForm.querySelectorAll('input').forEach((elem) => {
    elem.addEventListener('input', (e) => {
        util.clearInputError(
            e.target,
            e.target.parentNode.querySelector('span.error-message'),
            registerValidationMsg,
        );
    });
});

async function registerUser(formData) {
    const data = Object.fromEntries(formData.entries());

    try {
        const success = await api.register(data);
        if (success) {
            window.location.replace(
                `./index.html?success=${encodeURIComponent(success)}`,
            );
            return;
        }
        throw new Error(
            'Registration failed. Fix your inputs or try again later',
        );
    } catch (error) {
        if (error.cause?.data?.field) {
            const errorMsg = error.cause.message;
            const field = error.cause.data.field.toLowerCase();
            let input;
            let inputValidationMsg;

            if (field.includes('password')) {
                input = document.getElementById('password');
                inputValidationMsg = document.getElementById('password-error');
            } else if (field.includes('email')) {
                input = document.getElementById('email');
                inputValidationMsg = document.getElementById('email-error');
            } else if (field.includes('date')) {
                input = document.getElementById('bdate');
                inputValidationMsg = document.getElementById('bdate-error');
            }

            if (input) {
                input.setAttribute('aria-invalid', true);
            }

            if (inputValidationMsg) {
                inputValidationMsg.textContent = errorMsg;
                inputValidationMsg.classList.add('visible');
            }
        }

        registerValidationMsg.textContent = error.message;
        registerValidationMsg.classList.add('visible');
    }
}
