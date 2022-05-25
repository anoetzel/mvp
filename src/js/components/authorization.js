export default function validateAuthorization(login, pass) {
  const result = {};
  if (login.length < 6 || login.match(/\s/)) {
    result.loginResult = false;
  } else {
    result.loginResult = true;
  }

  if (pass.length < 6 || pass.match(/\s/)) {
    result.passResult = false;
  } else {
    result.passResult = true;
  }

  return result;
}
