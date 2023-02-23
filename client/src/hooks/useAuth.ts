import { isTokenValid } from 'utils';

function useAuth() {
  const auth = { token: null };
  let validAuth = {
    ...auth,
  };

  if (auth?.token) {
    if (!isTokenValid(auth.token)) {
      validAuth.token = null;
    }
  }

  return validAuth;
}

export { useAuth };
