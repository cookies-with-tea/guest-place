import { describe, it } from 'vitest';

describe('admin-statistics smoke', () => {
	it('opens root page', () => {
		cy.visit('/')
		cy.contains('Statistics').should('exist')
	})
})


