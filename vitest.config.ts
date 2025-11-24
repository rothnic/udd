import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		include: ["tests/**/*.test.ts"],
		testTimeout: 10000,
		fileParallelism: false,
		reporters: ["default", "json"],
		outputFile: ".udd/results.json",
	},
});
