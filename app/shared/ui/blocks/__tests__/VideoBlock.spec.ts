import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import VideoBlock from '../VideoBlock.vue'

describe('VideoBlock Component', () => {
  it('renders placeholder when no video URL is provided', () => {
    const wrapper = mount(VideoBlock, {
      props: {
        data: {
          title: 'Тестовый блок',
        },
      },
    })

    expect(wrapper.find('.video-title').text()).toBe('Тестовый блок')

    expect(wrapper.find('.video-placeholder').exists()).toBe(true)

    expect(wrapper.find('.video-hint').text()).toContain('Видео не выбрано')

    expect(wrapper.find('iframe').exists()).toBe(false)

    expect(wrapper.find('video').exists()).toBe(false)
  })

  it('renders YouTube iframe with correct embed URL', () => {
    const wrapper = mount(VideoBlock, {
      props: {
        data: {
          title: 'YouTube Видео',
          video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          aspect_ratio: '16/9',
        },
      },
    })

    const iframe = wrapper.find('iframe.video-frame')

    expect(iframe.exists()).toBe(true)

    expect(iframe.attributes('src')).toBe('https://www.youtube.com/embed/dQw4w9WgXcQ')

    expect(wrapper.find('.video-player-wrapper').attributes('style')).toContain('aspect-ratio: 16 / 9')
  })

  it('renders HTML5 video tag for direct video URLs', () => {
    const wrapper = mount(VideoBlock, {
      props: {
        data: {
          video_url: 'https://example.com/media/hotel-tour.mp4',
          poster_url: 'https://example.com/media/poster.jpg',
          caption: 'Красивый тур по территории',
        },
      },
    })

    const video = wrapper.find('video.video-element')

    expect(video.exists()).toBe(true)

    expect(video.attributes('src')).toBe('https://example.com/media/hotel-tour.mp4')

    expect(video.attributes('poster')).toBe('https://example.com/media/poster.jpg')

    expect(wrapper.find('.video-caption').text()).toBe('Красивый тур по территории')
  })

  it('applies theme and custom background styles correctly', () => {
    const wrapper = mount(VideoBlock, {
      props: {
        data: {},
        style: {
          theme: 'dark',
          backgroundColor: '#121212',
        },
      },
    })

    expect(wrapper.classes()).toContain('theme-dark')

    expect(wrapper.attributes('style')).toContain('background-color: #121212')
  })
})
