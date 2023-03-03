/**
 * This function takes a full name and returns the initials of the name
 * @function
 * @param fullName 
 * @returns full name initials
 */

export const getNameInitials = (fullName: string): string => {
  const nameArray = fullName.split(' ');
  const initials = nameArray.map((name) => name[0]).join('');
  return initials;
}