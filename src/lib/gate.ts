import chalk from "chalk";
import type { DriftIssue } from "../commands/doctor.js";
import { detectDrift } from "../commands/doctor.js";

export interface GateResult {
	passed: boolean;
	reason?: string;
	critical: number;
	warning: number;
	info: number;
}

export interface GateCheckOptions {
	strict?: boolean;
	skipGate?: boolean;
}

export async function checkGate(
	options: GateCheckOptions = {},
): Promise<GateResult> {
	const drift = await detectDrift();
	const { critical, warning, info } = drift.summary;

	if (drift.status === "clean") {
		return { passed: true, critical: 0, warning: 0, info: 0 };
	}

	if (critical > 0) {
		const criticalIssues = drift.issues.filter(
			(i: DriftIssue) => i.severity === "critical",
		);
		const messages = criticalIssues
			.map((i: DriftIssue) => `  • ${i.message}`)
			.join("\n");

		return {
			passed: false,
			reason: `Critical drift detected (${critical} issue${critical === 1 ? "" : "s"}):\n${messages}\n\nRun 'udd doctor --fix' to resolve automatically fixable issues.`,
			critical,
			warning,
			info,
		};
	}

	if (warning > 0) {
		if (options.strict && !options.skipGate) {
			const warningIssues = drift.issues.filter(
				(i: DriftIssue) => i.severity === "warning",
			);
			const messages = warningIssues
				.map((i: DriftIssue) => `  • ${i.message}`)
				.join("\n");

			return {
				passed: false,
				reason: `Warning drift detected in strict mode (${warning} issue${warning === 1 ? "" : "s"}):\n${messages}\n\nTo bypass in strict mode, use --skip-gate (not recommended).\nRun 'udd doctor --fix' to resolve automatically fixable issues.`,
				critical,
				warning,
				info,
			};
		}

		if (!options.skipGate) {
			console.log(
				chalk.yellow(
					`\n⚠ Warning: ${warning} drift issue${warning === 1 ? "" : "s"} detected`,
				),
			);
			console.log(
				chalk.dim(
					"   Run 'udd doctor' for details or 'udd doctor --fix' to resolve\n",
				),
			);
		}
	}

	if (info > 0 && !options.skipGate) {
		console.log(
			chalk.blue(
				`\nℹ Info: ${info} improvement suggestion${info === 1 ? "" : "s"} available`,
			),
		);
		console.log(chalk.dim("   Run 'udd doctor' for details\n"));
	}

	return { passed: true, critical, warning, info };
}

export function formatGateFailure(result: GateResult): string {
	if (result.passed) {
		return "";
	}

	const lines: string[] = [];
	lines.push(chalk.red.bold("\n🚫 Gate Blocked\n"));
	lines.push(
		chalk.red("═══════════════════════════════════════════════════════════\n"),
	);
	lines.push(result.reason || "Unknown drift detected");
	lines.push("");

	if (result.critical > 0) {
		lines.push(
			chalk.yellow("⚠ Critical issues cannot be bypassed with --skip-gate"),
		);
	} else if (result.warning > 0) {
		lines.push(
			chalk.dim(
				"💡 Use --skip-gate to bypass warnings (not recommended in CI)",
			),
		);
	}

	lines.push(chalk.dim("\n📖 Run 'udd doctor' to see full drift report"));

	return lines.join("\n");
}

export function handleGateResult(result: GateResult): true {
	if (!result.passed) {
		console.error(formatGateFailure(result));
		process.exit(1);
	}
	return true;
}
