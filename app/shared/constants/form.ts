export const RULES = {
  req: { required: true, message: 'Обязательное поле', trigger: 'change' },
  emailPattern: {
    required: true,
    message: 'Неправильный формат',
    trigger: 'change',
    pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  },
  phonePattern: {
    required: true,
    message: 'Неправильный формат',
    trigger: 'change',
    pattern: /^\+?\d{1,4}?[-.\s]?\(?\d{1,3}?\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}$/,
  },
  name: { required: true, message: 'Обязательное поле', trigger: 'change' },
} as const

export const FORM_RULES = {
  required: [RULES.req],
  email: [RULES.req, RULES.emailPattern],
  name: [RULES.name, RULES.req],
  phone: [RULES.phonePattern],
}
