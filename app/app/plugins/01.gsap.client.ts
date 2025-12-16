import { defineNuxtPlugin } from '#app'
import gsap from 'gsap'
import DrawSVGPlugin from 'gsap/DrawSVGPlugin'
import { MorphSVGPlugin } from 'gsap/MorphSVGPlugin'
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin'

export default defineNuxtPlugin(() => {
  gsap.registerPlugin(DrawSVGPlugin, MorphSVGPlugin, ScrambleTextPlugin)

  return {
    provide: {
      gsap,
    },
  }
})
