import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { MOCK_VENUE_FOREST_HALL } from '../../../mock/venue.mock'
import VenueTabs from '../VenueTabs.vue'

describe('VenueTabs Component', () => {
  it('renders all tab navigation buttons', () => {
    const wrapper = mount(VenueTabs, {
      props: {
        venue: MOCK_VENUE_FOREST_HALL,
      },
    })

    const buttons = wrapper.findAll('.venue-tabs__nav-item')

    expect(buttons).toHaveLength(5)

    expect(buttons[0].text()).toBe('Описание')

    expect(buttons[1].text()).toBe('Цены/аренда')

    expect(buttons[2].text()).toBe('Меню')

    expect(buttons[3].text()).toBe('Лента')

    expect(buttons[4].text()).toBe('Гостевой чат')
  })

  it('renders description tab content by default', () => {
    const wrapper = mount(VenueTabs, {
      props: {
        venue: MOCK_VENUE_FOREST_HALL,
      },
    })

    const activeBtn = wrapper.find('.venue-tabs__nav-item--active')

    expect(activeBtn.text()).toBe('Описание')

    expect(wrapper.text()).toContain(MOCK_VENUE_FOREST_HALL.details.parking)
  })

  it('switches tab on click and emits tab-change event', async () => {
    const wrapper = mount(VenueTabs, {
      props: {
        venue: MOCK_VENUE_FOREST_HALL,
      },
    })

    const pricingBtn = wrapper.findAll('.venue-tabs__nav-item')[1]

    await pricingBtn.trigger('click')

    expect(wrapper.emitted('tab-change')).toBeTruthy()

    expect(wrapper.emitted('tab-change')![0]).toEqual(['pricing'])

    expect(wrapper.find('.venue-tabs__pricing-table').exists()).toBe(true)
  })

  it('respects initialTab prop', () => {
    const wrapper = mount(VenueTabs, {
      props: {
        venue: MOCK_VENUE_FOREST_HALL,
        initialTab: 'pricing',
      },
    })

    const activeBtn = wrapper.find('.venue-tabs__nav-item--active')

    expect(activeBtn.text()).toBe('Цены/аренда')

    expect(wrapper.find('.venue-tabs__pricing-table').exists()).toBe(true)
  })
})
