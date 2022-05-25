import {
  renderHeader
} from './components/header.js';
import {
  createAuthorizationForm
} from './components/view.js';
import validateAuthorization from './components/authorization.js';
import {
  renderAccountsPage
} from './components/accounts.js';
import {
  renderSingleAccountPage
} from './components/single-account.js';
import {
  renderAccountHistoryPage
} from './components/account-history.js';
import {
  renderCashDispensersInfo
} from './components/cash.js';
import '../../node_modules/focus-visible/dist/focus-visible.min.js';
import Navigo from 'navigo';
import '../scss/main.scss';
import {
  renderCurrencyPage
} from './components/currency.js';

const router = new Navigo('/');

router.on('/', () => {
  renderHeader();
  createAuthorizationForm();

  // Authorization with validation
  const form = document.forms.authorization;
  const login = form.elements[0];
  const pass = form.elements[1];

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const validationResult = validateAuthorization(login.value.trim(), pass.value.trim());

    if (validationResult.loginResult === false) {
      login.classList.add('is-invalid');
    }
    if (validationResult.passResult === false) {
      pass.classList.add('is-invalid');
    }
    if (validationResult.loginResult === true) {
      login.classList.add('is-valid');
    }
    if (validationResult.passResult === true) {
      pass.classList.add('is-valid');
    }
    if (validationResult.loginResult === true && validationResult.passResult === true) {

      const res = await fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify({
          login: login.value.trim(),
          password: pass.value.trim()
        })
      });

      const data = await res.json();

      if (data.payload) {
        const token = data.payload.token;
        sessionStorage.setItem('token', token);

        router.navigate('/accounts');
      }

      if (data.error) {
        if (data.error === 'No such user') {
          login.classList.remove('is-valid');
          login.classList.add('is-invalid');
        } else if (data.error === 'Invalid password') {
          pass.classList.remove('is-valid');
          pass.classList.add('is-invalid');
        } else {
          throw new Error;
        }
      }
    }
  });
});

router.on('/accounts', async () => {
  await renderAccountsPage();

  //Navigate to a single account - page
  document.querySelectorAll('.account__open').forEach(el => {
    el.addEventListener('click', () => {
      const id = el.getAttribute('data-account');
      const balance = el.getAttribute('data-balance');
      sessionStorage.setItem('account', id);
      sessionStorage.setItem('balance', balance);

      router.navigateByName('account', {
        name: el.getAttribute('data-account')
      });
    });
  });
});

router.on({
  'account/:name': {
    as: 'account',
    uses: async (match) => {
      await renderSingleAccountPage();

      // Go to account history page
      document.querySelector('.chart').addEventListener('click', () => {
        router.navigateByName('history', {
          name: sessionStorage.getItem('account')
        });
      });

      document.querySelector('.trans-table__table').addEventListener('click', (e) => {
        const tr = e.target.closest('tr');

        if (!tr) return;

        router.navigateByName('history', {
          name: sessionStorage.getItem('account')
        });
      });
    }
  }
});

router.on({
  'history/:name': {
    as: 'history',
    uses: async (match) => {
      renderAccountHistoryPage();
    }
  }
});

router.on('/currency', () => {
  renderCurrencyPage();
});

router.on('/cash-machines', async () => {
  await renderCashDispensersInfo();
});

router.resolve();
