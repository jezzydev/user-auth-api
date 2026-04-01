import * as api from './api.js';
import * as util from './utils.js';

const loginForm = document.querySelector('#login-form');
const loginValidationMsg = document.querySelector(
    '#login-form .validation-msg',
);

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const emailInput = document.getElementById('email');
    if (!emailInput.checkValidity()) {
        util.showInputError(
            emailInput,
            document.getElementById('email-error'),
            loginValidationMsg,
        );
    }

    const passwordInput = document.getElementById('password');
    if (!passwordInput.checkValidity()) {
        util.showInputError(
            passwordInput,
            document.getElementById('password-error'),
            loginValidationMsg,
        );
    }

    if (loginForm.checkValidity()) {
        const formData = new FormData(e.target);
        await loginUser(formData);
    }
});

loginForm.querySelectorAll('input').forEach((elem) => {
    elem.addEventListener('input', (e) => {
        util.clearInputError(
            e.target,
            e.target.parentNode.querySelector('span.error-message'),
            loginValidationMsg,
        );
    });
});

async function loginUser(formData) {
    const data = Object.fromEntries(formData.entries());
    try {
        await api.login(data);
        window.location.replace('./dashboard.html');
        return;
    } catch (error) {
        loginValidationMsg.textContent = error.message;
        loginValidationMsg.classList.add('visible');
    }
}
