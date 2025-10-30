describe('admin-translations smoke', () => {
	it('opens root page', () => {
		cy.visit('/')
		cy.contains('Translations').should('exist')
	})
})


