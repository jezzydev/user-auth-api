import * as auth from './auth.js';
import * as api from './api.js';
import * as util from './utils.js';

const logoutBtn = document.querySelector('#logout-btn');
const usersTableBody = document.querySelector('.users-table tbody');
const usersValidationMsg = document.querySelector(
    '.users-container .validation-msg',
);

logoutBtn.addEventListener('click', async () => {
    try {
        await api.logout();
        window.location.replace('./index.html');
        return;
    } catch (error) {
        usersValidationMsg.textContent = error.message;
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

        if (user.role !== 'admin') {
            window.location.replace('./dashboard.html');
            return;
        }

        const users = await api.getUsers();

        users.forEach((user) => {
            const idCol = document.createElement('td');
            idCol.textContent = user.id;

            const nameCol = document.createElement('td');
            nameCol.textContent = user.name;

            const emailCol = document.createElement('td');
            emailCol.textContent = user.email;

            const bdateCol = document.createElement('td');
            bdateCol.textContent = new Date(user.bdate).toLocaleDateString();

            const roleCol = document.createElement('td');
            roleCol.textContent = user.role;

            const createdAtCol = document.createElement('td');
            createdAtCol.textContent = new Date(
                user.created_at,
            ).toLocaleDateString();

            const row = document.createElement('tr');
            row.append(
                idCol,
                nameCol,
                emailCol,
                bdateCol,
                roleCol,
                createdAtCol,
            );

            usersTableBody.append(row);
        });
    } catch (error) {
        usersValidationMsg.textContent = error.message;
    }
})();
