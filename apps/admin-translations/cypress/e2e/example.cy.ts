describe('App Translations Page', () => {
	it('should render the translations page', () => {
		cy.visit('/')
		cy.contains('h1', 'Translations')
	})
})
