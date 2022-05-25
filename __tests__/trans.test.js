import {
  validateTransactionInputs
}
from '../src/js/components/transaction';

describe('Validate the transaction inputs:', () => {
  test('if there are empty inputs', () => {
    expect(validateTransactionInputs(' ', '123')).toBe(false);
    expect(validateTransactionInputs('543252345435', ' ')).toBe(false);
    expect(validateTransactionInputs('', ' ')).toBe(false);
    expect(validateTransactionInputs('2435432543534', '5434')).toBe(true);
  });
  test('if there are letters in sum', () => {
    expect(validateTransactionInputs('3456546546', '1d23')).toBe(false);
    expect(validateTransactionInputs('3456546546', '123р')).toBe(false);
  });
  test('if the sum is positiv', () => {
    expect(validateTransactionInputs('3456546546', '-23')).toBe(false);
  });
  test('if there are spaces in inputs', () => {
    expect(validateTransactionInputs('345 6546546', '1220 30')).toBe(false);
    expect(validateTransactionInputs('3456546546', '1220 30')).toBe(false);
    expect(validateTransactionInputs('3456546 546', '1220')).toBe(false);
  });

});
