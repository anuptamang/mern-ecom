/**
 * return username from email address
 * @function
 * @param   {string} email  Email of the User
 * @returns  {string}        Username
 */

export const getUserName = (email: string): string => {
  const index = email.indexOf('@');
  const result = email.slice(0, index);
  return result;
};
