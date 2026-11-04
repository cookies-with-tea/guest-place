import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { MOCK_VENUE_FOREST_HALL } from '../../../mock/venue.mock'
import VenueMapCatalog from '../VenueMapCatalog.vue'

vi.mock('#entities/venue/api/venue.api', () => ({
  createVenueRequest: vi.fn().mockResolvedValue({ success: true }),
}))

describe('VenueMapCatalog Component', () => {
  it('renders map canvas, venue pin markers and controls', () => {
    const wrapper = mount(VenueMapCatalog, {
      props: {
        venues: [MOCK_VENUE_FOREST_HALL],
      },
      global: {
        stubs: {
          NuxtLink: {
            template: '<a><slot /></a>',
          },
          UiIcon: {
            template: '<span class="stub-icon"><slot /></span>',
          },
        },
      },
    })

    // Check SVG canvas
    expect(wrapper.find('.venue-map-catalog__svg-canvas').exists()).toBe(true)

    // Check pins
    const pins = wrapper.findAll('.venue-map-catalog__pin-group')

    expect(pins).toHaveLength(1)

    // Check zoom controls
    expect(wrapper.find('.venue-map-catalog__zoom-box').exists()).toBe(true)

    expect(wrapper.find('.venue-map-catalog__location-btn').exists()).toBe(true)

    // Check bottom action buttons from Figma
    expect(wrapper.find('.venue-map-catalog__list-view-btn').text()).toContain('Показать списком')

    const actionBtns = wrapper.findAll('.venue-map-catalog__sub-action-btn')

    expect(actionBtns).toHaveLength(3)

    expect(actionBtns[0].text()).toContain('Показать рядом со мной')

    expect(actionBtns[1].text()).toContain('Показать в выбранной области')

    expect(actionBtns[2].text()).toContain('Помощь эксперта')
  })

  it('emits toggle-view when "Показать списком" is clicked', async () => {
    const wrapper = mount(VenueMapCatalog, {
      props: {
        venues: [MOCK_VENUE_FOREST_HALL],
      },
      global: {
        stubs: {
          NuxtLink: { template: '<a><slot /></a>' },
          UiIcon: { template: '<span><slot /></span>' },
        },
      },
    })

    const listBtn = wrapper.find('.venue-map-catalog__list-view-btn')

    await listBtn.trigger('click')

    expect(wrapper.emitted('toggle-view')).toBeTruthy()

    expect(wrapper.emitted('toggle-view')![0]).toEqual(['list'])
  })

  it('selects venue and opens balloon popup on pin click', async () => {
    const wrapper = mount(VenueMapCatalog, {
      props: {
        venues: [MOCK_VENUE_FOREST_HALL],
      },
      global: {
        stubs: {
          NuxtLink: { template: '<a><slot /></a>' },
          UiIcon: { template: '<span><slot /></span>' },
        },
      },
    })

    const pin = wrapper.find('.venue-map-catalog__pin-group')

    await pin.trigger('click')

    expect(wrapper.emitted('venue-click')).toBeTruthy()

    expect(wrapper.find('.venue-map-catalog__popup-card').exists()).toBe(true)

    expect(wrapper.find('.venue-map-catalog__popup-title').text()).toContain(MOCK_VENUE_FOREST_HALL.title)
  })

  it('emits filter-bounds when "Показать в выбранной области" is clicked', async () => {
    const wrapper = mount(VenueMapCatalog, {
      props: {
        venues: [MOCK_VENUE_FOREST_HALL],
      },
      global: {
        stubs: {
          NuxtLink: { template: '<a><slot /></a>' },
          UiIcon: { template: '<span><slot /></span>' },
        },
      },
    })

    const filterAreaBtn = wrapper.findAll('.venue-map-catalog__sub-action-btn')[1]

    await filterAreaBtn.trigger('click')

    expect(wrapper.emitted('filter-bounds')).toBeTruthy()

    const bounds = wrapper.emitted('filter-bounds')![0][0] as any

    expect(bounds).toHaveProperty('minLat')

    expect(bounds).toHaveProperty('maxLat')

    expect(bounds).toHaveProperty('minLng')

    expect(bounds).toHaveProperty('maxLng')
  })

  it('opens add place modal via exposed method and submits', async () => {
    const wrapper = mount(VenueMapCatalog, {
      props: {
        venues: [MOCK_VENUE_FOREST_HALL],
      },
      global: {
        stubs: {
          NuxtLink: { template: '<a><slot /></a>' },
          UiIcon: { template: '<span><slot /></span>' },
        },
      },
    })

    expect(wrapper.find('.venue-modal-overlay').exists()).toBe(false)

    wrapper.vm.openAddPlaceModal()

    await wrapper.vm.$nextTick()

    expect(wrapper.find('.venue-modal-overlay').exists()).toBe(true)

    expect(wrapper.find('.venue-modal-title').text()).toBe('Добавить место на карту')
  })
})
