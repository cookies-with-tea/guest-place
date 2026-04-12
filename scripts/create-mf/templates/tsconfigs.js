export function getTsConfig() {
	return `{
	"extends": "@admin-panel/typescript-config",
	"compilerOptions": {
		"composite": true,
		"baseUrl": ".",
		"paths": {
			"@/*": ["./src/*"],
			"#app/*": ["./src/app/*"],
			"#pages/*": ["./src/pages/*"],
			"#widgets/*": ["./src/widgets/*"],
			"#features/*": ["./src/features/*"],
			"#entities/*": ["./src/entities/*"],
			"#shared/*": ["./src/shared/*"]
		}
	},
	"include": ["src/**/*.ts", "src/**/*.d.ts", "src/**/*.tsx", "src/**/*.vue"],
	"exclude": ["node_modules", "dist"]
}
`
}

export function getTsConfigApp() {
	return `{
	"extends": "./tsconfig.json",
	"compilerOptions": {
		"noEmit": true,
		"isolatedModules": false
	},
	"include": ["env.d.ts", "src/**/*.ts", "src/**/*.d.ts", "src/**/*.tsx", "src/**/*.vue"]
}
`
}

export function getTsConfigNode() {
	return `{
	"extends": "./tsconfig.json",
	"compilerOptions": {
		"composite": true,
		"module": "ESNext",
		"moduleResolution": "bundler",
		"noEmit": true
	},
	"include": ["vite.config.ts", "scripts/**/*.ts"]
}
`
}
