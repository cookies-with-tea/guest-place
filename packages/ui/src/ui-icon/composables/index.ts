import { SVG_SPRITE } from '../sprite/sprite'

export const useUiIcon = () => {
	const initIcon = async () => {
		if (document.getElementById('svg-sprite')) return

		const svgText = JSON.parse(JSON.stringify(SVG_SPRITE))

		const div = document.createElement('div')

		div.id = 'svg-sprite'

		div.style.cssText = `
        display:none;
        position:absolute;
        width:0;
        height:0;
        overflow:hidden;
        visibility:hidden;
        pointer-events:none;
        z-index:-1;
      `

		div.innerHTML = svgText

		document.body.appendChild(div)
	}

	return { initIcon }
}
