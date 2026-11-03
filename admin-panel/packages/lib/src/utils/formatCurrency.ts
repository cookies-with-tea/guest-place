export const formatCurrency = (amount: number, locale = 'ru-RU', currency = 'RUB') => {
	return new Intl.NumberFormat(locale, { style: 'currency', currency, maximumFractionDigits: 2 }).format(amount)
}
