import * as yup from 'yup';

const phoneRegExp =
  /^((\\+[1-9]{1,4}[ \\-]*)|(\\([0-9]{2,3}\\)[ \\-]*)|([0-9]{2,4})[ \\-]*)*?[0-9]{3,4}?[ \\-]*[0-9]{3,4}?$/;
const alphabetRegExp = /^[aA-zZ\s]+$/;
export const textValidation = yup
  .string()
  .required('Required!')
  .nullable()
  .min(2, 'Name must be at least 2 character')
  .max(20, 'Name must be less than 20 characters')
  .matches(alphabetRegExp, 'Only alphabets are allowed for this field ');

export const emailValidation = yup
  .string()
  .required('Required!')
  .nullable()
  .min(4, 'Email must be at least 4 character')
  .email('Email is not Valid!');

export const phoneValidation = yup
  .string()
  .required('Required!')
  .nullable()
  .matches(phoneRegExp, 'Phone number is not valid');

export const messageValidation = yup
  .string()
  .required('Required!')
  .nullable()
  .min(2, 'Last Name must be at least 2 character')
  .max(100, 'Last Name must be less than 20 characters');

export const dateValidation = yup.string().required('Required!');
export const isRequired = yup.string().required('Required!');

export const passwordValidation = yup.string().required('Required!');
export const confirmPasswordValidation = yup.string().required('Required!').oneOf([yup.ref('password')], 'Passwords must match');

export const contactFormSchema = yup.object({
  firstName: textValidation,
  lastName: textValidation,
  email: emailValidation,
  phone: phoneValidation,
  message: messageValidation,
});

export const loginFormSchema = yup.object({
  email: emailValidation,
  password: passwordValidation,
});

export const registerFormSchema = yup.object({
  firstName: textValidation,
  lastName: textValidation,
  email: emailValidation,
  phone: phoneValidation,
  password: passwordValidation,
  confirmPassword: confirmPasswordValidation
});

export const postCreateFormSchema = yup.object({
  title: isRequired,
  categories: isRequired,
  tag: isRequired,
  // thumbnail: isRequired,
  // author: textValidation,
  // status: textValidation,
  // date: dateValidation,
  // body: messageValidation,
});

export const tasksSchema = yup.object({
  task: textValidation,
});

export const userInfoSchema = yup.object({
  fullName: textValidation
});

export const commentSchema = yup.object({
  text: yup.string().required('Required!')
});

export const chatSchema = yup.object({
  text: yup.string().required('Required!')
});

export const searchSchema = yup.object({
  text: yup.string()
});
