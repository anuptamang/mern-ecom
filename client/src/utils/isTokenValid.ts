import jwtDecode from "jwt-decode";

interface IDecodedToken {
  exp: number
}

export const isTokenValid = (token: string) => {
  const decodedToken: IDecodedToken = jwtDecode(token);
  if (decodedToken.exp * 1000 < Date.now()) {
    localStorage.removeItem('user');
    return false
  } else {
    return true
  }
}