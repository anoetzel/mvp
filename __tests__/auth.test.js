import validateAuthorization from "../src/js/components/authorization";

describe('Validation of Authorization:', () => {
  test('if there are enough letters in login', () => {
    expect(validateAuthorization('wqre3', 'sadfsdfasdf')).toEqual({
      loginResult: false,
      passResult: true
    });
  });
  test('if there are enough letters in pass', () => {
    expect(validateAuthorization('wqre3sdf', 'saddd')).toEqual({
      loginResult: true,
      passResult: false
    });
  });
  test('if there are enough letters in login and pass', () => {
    expect(validateAuthorization('wqre', 'saddd')).toEqual({
      loginResult: false,
      passResult: false
    });
    expect(validateAuthorization('wqrdde', 'saddffd')).toEqual({
      loginResult: true,
      passResult: true
    });
  });
  test('if there spaces in login', () => {
    expect(validateAuthorization('wqre 3sdf', 'sadfsdfasdf')).toEqual({
      loginResult: false,
      passResult: true
    });
  });
  test('if there are spaces in pass', () => {
    expect(validateAuthorization('wqre3sdf', 'sadd iik')).toEqual({
      loginResult: true,
      passResult: false
    });
  });
  test('if there are spaces in login and pass', () => {
    expect(validateAuthorization('wqre 3sdf', 'sadd dftk')).toEqual({
      loginResult: false,
      passResult: false
    });
  });
});
