describe('App Analytics Page', () => {
	it('should render the analytics page', () => {
		cy.visit('/')
		cy.contains('h1', 'Analytics')
	})
})
