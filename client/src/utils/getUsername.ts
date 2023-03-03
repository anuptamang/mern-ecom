/**
 * return username from email address
 * @function
 * @param   {string} email  Email of the User
 * @returns  {string}        Username
 */

export const getUserName = (email: string): string => {
  let index = email.indexOf('@');
  let result = email.slice(0, index);
  return result;
};
