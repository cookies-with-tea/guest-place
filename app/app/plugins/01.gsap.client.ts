import { defineNuxtPlugin } from '#app'
import gsap from 'gsap'
import DrawSVGPlugin from 'gsap/DrawSVGPlugin'

export default defineNuxtPlugin(() => {
  gsap.registerPlugin(DrawSVGPlugin)

  return {
    provide: {
      gsap,
    },
  }
})
