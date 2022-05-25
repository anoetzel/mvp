/// <reference types="cypress" />

describe('Navigate through accounts', () => {

  Cypress.on('uncaught:exception', (err, runnable) => {
    return false;
  });

  Cypress.Commands.add('getSessionStorage', (key) => {
    cy.window().then((window) => window.sessionStorage.getItem(key));
  });

  Cypress.Commands.add('setSessionStorage', (key, value) => {
    cy.window().then((window) => {
      window.sessionStorage.setItem(key, value)
    });
  });

  it('Sign in on the home page', () => {
    cy.visit('http://localhost:3000/');

    cy.get('input:first')
      .type('developer');
    cy.get('[type=password]').type('skillbox');
    cy.get('input.btn').click();
    cy.setSessionStorage('token', 'ZGV2ZWxvcGVyOnNraWxsYm94');
  });

  it('Open a new account', () => {
    cy.get('.btn.plus').click();
  });

  it('Sort the accounts by number', () => {
    cy.get('.account.draggable').should('be.visible');
    cy.get('.select__input').click();
    cy.get('.select__item:first').click({
      force: true
    });
  });

  it('Sort the accounts by balance', () => {
    cy.get('.select__input').click();
    cy.get('.select__item:nth-child(2)').click({
      force: true
    });
  });

  it('Sort the accounts by transaction', () => {
    cy.get('.select__input').click();
    cy.get('.select__item:last').click({
      force: true
    });
  });

  it('Navigate to single account page', () => {
    cy.get('[data-account=74213041477477406320783754]').click();
    cy.setSessionStorage('account', '74213041477477406320783754');
    cy.getSessionStorage('account').should('eq', '74213041477477406320783754');
    cy.getSessionStorage('token').should('eq', 'ZGV2ZWxvcGVyOnNraWxsYm94');
  });

  it('Make transaction', () => {
    cy.get('.trans-form__input:first').type('27120208050464008002528428');
    cy.get('.trans-form__input:last').type('100');
    cy.get('.trans-form__submit').click();
  });

  it('Navigate to account history page', () => {
    cy.get('.chart.6-months').click();
  });

  it('See the pages of transactions', () => {
    cy.get('.pagination__item:nth-child(2)').click();
    cy.get('.pagination__item:nth-child(3)').click();
    cy.get('.pagination__item:nth-child(4)').click();
  });

  it('Go back to the list of accounts', () => {
    cy.get('.btn.back').click();
    cy.get('.btn.back').click();
  });

  it('Go to currency page', () => {
    cy.get('a[href="/currency"]').click();
  });

  it('Exchange currency', () => {
    cy.get('.select__input:first').click();
    cy.get('.select__list:first [data-value=RUB]').click({
      force: true
    });
    cy.get('.select__input:last').click();
    cy.get('.select__list:last [data-value=UAH]').click({
      force: true
    });
    cy.get('.exchange__input').type('1000');
    cy.get('.exchange__send').click();
  });

  it('Navigate to cash despensers page', () => {
    cy.get('a[href="/cash-machines"]').click();
    cy.get('div[role=button] img[usemap="#gmimap16"]')
      .should('be.visible')
      .parent()
      .click({
        force: true
      });
    cy.wait(1000);
  });
});
