// Source - https://stackoverflow.com/a
// Posted by lukeic
// Retrieved 2025-12-25, License - CC BY-SA 4.0

/// <reference types="vite/client" />

interface ImportMetaEnv {
	readonly VITE_CUSTOM_ENV_VARIABLE: string
}

interface ImportMeta {
	readonly env: ImportMetaEnv
}
