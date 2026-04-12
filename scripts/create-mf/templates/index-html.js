export function getIndexHtml(name, displayName) {
	const mfName = name.replace(/^admin-/, '')
	const mountId = `__MF_${mfName.toUpperCase().replace(/-/g, '_')}__`
	return `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8" />
	<link rel="icon" href="/favicon.ico" />
	<meta name="viewport" content="width=device-width, initial-scale=1.0" />
	<title>${displayName}</title>
</head>
<body>
	<div id="${mountId}"></div>
	<script type="module" src="/src/main.ts"></script>
</body>
</html>
`
}
