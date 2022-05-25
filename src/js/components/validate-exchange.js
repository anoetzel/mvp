export function validateExchangeInput(value) {
  if (value.trim() < 0) {
    return false;
  } else if (typeof Number(value) !== 'number') {
    return false;
  } else if (value.trim() == 0) {
    return false;
  } else {
    return true;
  }
}
