import * as auth from './auth.js';
import * as api from './api.js';
import * as util from './utils.js';

const logoutBtn = document.querySelector('#logout-btn');
const profileValidationMsg = document.querySelector('.profile .validation-msg');
let countdownInterval;
let tokenTimeRemaining;
const daysValue = document.querySelector('#token-expires-daysNum');
const hourValue = document.querySelector('#token-expires-hourNum');
const minValue = document.querySelector('#token-expires-minNum');
const secValue = document.querySelector('#token-expires-secNum');

logoutBtn.addEventListener('click', async () => {
    try {
        clearInterval(countdownInterval);
        await api.logout();
        window.location.replace('./index.html');
        return;
    } catch (error) {
        profileValidationMsg.textContent = error.message;
    }
});

(async () => {
    try {
        if (!auth.isLoggedIn()) {
            const refreshed = await api.tryRefresh();

            if (!refreshed) {
                window.location.replace('./index.html');
                return;
            }
        }

        const user = util.extractUserData(auth.getToken());

        if (user.role === 'admin') {
            const adminPanelBtn = document.querySelector('#admin-panel-btn');
            adminPanelBtn.classList.add('visible');
        }

        const profile = await api.getUserProfile();

        const name = document.querySelector('#name-value');
        name.textContent = profile.name;

        const email = document.querySelector('#email-value');
        email.textContent = profile.email;

        const role = document.querySelector('#role-value');
        role.textContent = profile.role;

        const memberSince = document.querySelector('#member-since-value');
        const date = new Date(profile.created_at);
        const month = date.toLocaleString('default', { month: 'long' });
        memberSince.textContent = `${month} ${date.getFullYear()}`;

        //Token expiry countdown
        tokenTimeRemaining = user.exp * 1000 - Date.now();
        let isRefreshing = false;

        countdownInterval = setInterval(async () => {
            tokenTimeRemaining -= 1000;
            updateCountdownDisplay();

            if (tokenTimeRemaining <= 60000 && !isRefreshing) {
                isRefreshing = true;
                const refreshed = await api.tryRefresh();
                isRefreshing = false;

                if (refreshed) {
                    const user = util.extractUserData(auth.getToken());
                    tokenTimeRemaining = user.exp * 1000 - Date.now();
                }
            }

            if (tokenTimeRemaining <= 0) {
                clearInterval(countdownInterval);
                window.location.replace('./index.html');
            }
        }, 1000);
    } catch (error) {
        profileValidationMsg.textContent = error.message;
    }
})();

function updateCountdownDisplay() {
    const totalSecs = Math.max(0, Math.floor(tokenTimeRemaining / 1000));
    const days = Math.floor(totalSecs / 86400);
    const hours = Math.floor((totalSecs % 86400) / 3600);
    const min = Math.floor((totalSecs % 3600) / 60);
    const sec = totalSecs % 60;

    daysValue.textContent = days;
    hourValue.textContent = hours;
    minValue.textContent = min;
    secValue.textContent = sec;
}
