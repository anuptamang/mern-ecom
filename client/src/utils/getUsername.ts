export const getUserName = (text: string): string => {
  let index = text.indexOf('@');
  let result = text.slice(0, index);
  return result;
};
