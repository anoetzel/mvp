import {
  el,
  mount
} from 'redom';

export function createAuthorizationForm() {
  const form = el('section.auth',
    el('.auth__container',
      el('form.form', {
          name: 'authorization'
        },
        el('h1.h1', 'Sign in'),
        el('label', 'Login',
          el('input.form__input', {
            placeholder: 'Enter the login',
            type: 'text',
          }),
        ),
        el('label', 'Password',
          el('input.form__input', {
            placeholder: 'Enter the password',
            type: 'password',
          })),
        el('input.btn', {
          type: 'submit',
          value: 'Sign in'
        })
      )
    )
  );
  return mount(document.body, form);
}

export function renderPageTitle(selector, title) {
  const container = document.querySelector(selector);
  const element = el('.container', el('.container__top', el('h1.h1', title)))
  return mount(container, element);
}

export function createAccount(accountNumber, accountBalance, date = '') {
  return el('.account.draggable', '', {
      draggable: true
    },
    el('.account__top',
      el('span.account__number', `${accountNumber}`),
      el('span.account__balance', `${accountBalance} ₽`)),
    el('.account__bottom',
      el('.account__left',
        el('span.account__transaction', 'Last transaction:'),
        el('span.account__date', `${date}`)),
      el('a.btn.account__open', 'Open', {
        'href': `/account/${accountNumber}`,
        'data-account': `${accountNumber}`,
        'data-balance': `${accountBalance}`
      })));
}

export function createAccountNumberAndBalance(id, balance = '') {
  return el('.container__middle',
    el('span.account-number', `№ ${id}`),
    el('span.account-balance', 'Balance'),
    el('span.account-balance-number', `${balance} €`));
}

export function createNewTransactionBlock() {
  return el('form.info__transaction.trans-form.draggable', {
      name: 'transaction',
      draggable: 'true'
    },
    el('legend.trans-form__legend', 'New transaction'),
    el('label.trans-form__label.trans-form__label--select', 'Recipient\'s account',
      el('input.trans-form__input', {
        placeholder: 'Enter the number'
      }),
    ),
    el('label.trans-form__label', 'Transfer amount',
      el('input.trans-form__input', {
        placeholder: 'Specify the amount'
      })),
    el('button.btn.trans-form__submit', 'Send', {
      type: 'button',
      value: 'Send'
    }));
}

export function createChartBlock(className) {
  return el(`.chart.${className}.draggable`, '', {
      draggable: true
    },
    el('canvas.chart__canvas', ));
}

export function createTransactionTable() {
  return el('.trans-table.draggable', '', {
      draggable: true
    },
    el('h2.trans-table__h2', 'Transactions\'s history'),
    el('table.trans-table__table',
      el('thead',
        el('tr',
          el('th', 'Sender\'s account'),
          el('th', 'Recipient\'s account'),
          el('th', 'Amount'),
          el('th', 'Date')),
      ),
      el('tbody')));
}

export function createRow(owner, receiver, prefix, number, className, date) {
  return el('tr',
    el('td', `${owner}`),
    el('td', `${receiver}`),
    el(`td.${className}`, `${prefix}${number} €`),
    el('td', `${date}`));
}

export function createPagination(array) {
  return el(
    'ul.pagination',
    array.map((item) => el('li.pagination__item', item)));
}
