import { defineConfig } from "vitest/config";

export default defineConfig({
	cacheDir: ".udd/vite-cache",
	test: {
		include: ["tests/**/*.test.ts"],
		exclude: [
			"tests/e2e/my_area/**/*",
			"tests/e2e/opencode/integration/**/*",
			"node_modules/**/*",
		],
		testTimeout: 30000,
		fileParallelism: false,
		maxConcurrency: 1,
		reporters: ["default", "json"],
		outputFile: ".udd/results.json",
		setupFiles: ["./vitest.setup.ts"],
	},
});
