export function validateTransactionInputs(transTo, sum) {
  if (transTo.trim().length < 5) {
    return false;
  } else if (sum.trim() == 0 || sum.trim() < 0) {
    return false;
  } else if (sum.trim().match(/\p{L}+/ug) || sum.trim().match(/[a-z]+/ig)) {
    return false;
  } else if (sum.trim().match(/\s+/ig) || transTo.trim().match(/\s+/ig)) {
    return false;
  } else {
    return true;
  }
}
