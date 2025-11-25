import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		include: ["tests/**/*.test.ts"],
		exclude: ["tests/e2e/my_area/**/*", "node_modules/**/*"],
		testTimeout: 30000,
		fileParallelism: true,
		reporters: ["default", "json"],
		outputFile: ".udd/results.json",
		setupFiles: ["./vitest.setup.ts"],
	},
});
