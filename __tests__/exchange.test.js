import {
  validateExchangeInput
}
from "../src/js/components/validate-exchange";

describe('Validation of exchange value:', () => {
  test('if the value is greater then 0', () => {
    expect(validateExchangeInput('-234.03')).toBe(false);
    expect(validateExchangeInput('234.03')).toBe(true);
  });
});
