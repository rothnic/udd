import chalk from "chalk";

export function userError(
	message: string,
	error?: unknown,
	code: number = 1,
): { exitCode: number } {
	// Print a concise, user-facing error message in red, then include
	// a formatted representation of the underlying error (if any).
	console.error(chalk.red(message));

	if (error) {
		// Keep the detailed error on the next line, dimmed for readability.
		console.error(chalk.dim(formatError(error)));
	}

	// Do not call process.exit here; caller may set process.exitCode.
	// Return the intended exit code so callers can set it explicitly.
	return { exitCode: code };
}

export function userWarn(message: string): void {
	console.warn(chalk.yellow(message));
}

export function formatError(err: unknown): string {
	// Handle common error shapes robustly and return a single-line
	// or multi-line string suitable for printing.
	if (err == null) return "(no error information)";

	if (typeof err === "string") return err;

	if (err instanceof Error) {
		// Include name and message, and stack if available.
		const name = err.name || "Error";
		const msg = err.message || "(no message)";
		if (err.stack) return `${name}: ${msg}\n${err.stack}`;
		return `${name}: ${msg}`;
	}

	try {
		return JSON.stringify(err, null, 2);
	} catch {
		return String(err);
	}
}

export default {
	userError,
	userWarn,
	formatError,
};
