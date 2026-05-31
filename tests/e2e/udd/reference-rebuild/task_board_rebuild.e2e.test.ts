import { describe, expect, it } from "vitest";

// @feature udd/reference-rebuild/task_board_rebuild.feature
interface Task {
	title: string;
}

interface Board {
	capture(input: {
		title?: string;
		description?: string;
		source?: string;
	}): Task;
	all(): Array<Task & Record<string, unknown>>;
	setPriority(title: string, priority: "low" | "normal" | "high"): void;
	moveBefore(title: string, beforeTitle: string): void;
	assign(title: string, owner: string): void;
	unassigned(): Task[];
	start(title: string): void;
	block(title: string, reason: string): void;
	complete(title: string, note: string): void;
	countByState(): Record<string, number>;
	filterByOwner(owner: string): Task[];
}

async function loadBoard() {
	const implementation =
		process.env.UDD_REFERENCE_IMPL === "rebuild" ? "rebuild" : "baseline";
	const module = await import(
		`../../../../examples/reference-products/task-board/implementations/${implementation}/task-board.ts`
	);
	return { TaskBoard: module.TaskBoard as new () => Board, implementation };
}

describe("task board reference rebuild proof", async () => {
	const { TaskBoard, implementation } = await loadBoard();

	it(`creates a backlog item in ${implementation}`, () => {
		const board = new TaskBoard();
		board.capture({
			title: "Review signup flow",
			description: "Check first-run clarity",
		});
		expect(board.all()).toContainEqual(
			expect.objectContaining({
				title: "Review signup flow",
				state: "Backlog",
			}),
		);
	});

	it("rejects tasks without a title", () => {
		const board = new TaskBoard();
		expect(() => board.capture({ description: "No title" })).toThrow(
			"Title is required",
		);
	});

	it("records source tags", () => {
		const board = new TaskBoard();
		board.capture({ title: "Fix onboarding copy", source: "customer-call" });
		expect(board.all()[0].source).toBe("customer-call");
	});

	it("sets priority", () => {
		const board = new TaskBoard();
		board.capture({ title: "Fix onboarding copy" });
		board.setPriority("Fix onboarding copy", "high");
		expect(board.all()[0].priority).toBe("high");
	});

	it("reorders backlog tasks", () => {
		const board = new TaskBoard();
		board.capture({ title: "A" });
		board.capture({ title: "B" });
		board.moveBefore("B", "A");
		expect(board.all()[0].title).toBe("B");
	});

	it("rejects reordering before a missing task without changing order", () => {
		const board = new TaskBoard();
		board.capture({ title: "A" });
		board.capture({ title: "B" });
		expect(() => board.moveBefore("B", "Missing")).toThrow(
			"Task not found: Missing",
		);
		expect(board.all().map((task) => task.title)).toEqual(["A", "B"]);
	});

	it("assigns an owner", () => {
		const board = new TaskBoard();
		board.capture({ title: "Fix onboarding copy" });
		board.assign("Fix onboarding copy", "Nora");
		expect(board.all()[0].owner).toBe("Nora");
	});

	it("shows unassigned work", () => {
		const board = new TaskBoard();
		board.capture({ title: "Unowned" });
		expect(board.unassigned().map((task) => task.title)).toEqual(["Unowned"]);
	});

	it("starts work", () => {
		const board = new TaskBoard();
		board.capture({ title: "Build" });
		board.start("Build");
		expect(board.all()[0].state).toBe("In Progress");
	});

	it("blocks work with a visible reason", () => {
		const board = new TaskBoard();
		board.capture({ title: "Build" });
		board.start("Build");
		board.block("Build", "Waiting on design");
		expect(board.all()[0]).toMatchObject({
			state: "Blocked",
			blockedReason: "Waiting on design",
		});
	});

	it("completes work with a review note", () => {
		const board = new TaskBoard();
		board.capture({ title: "Build" });
		board.start("Build");
		board.complete("Build", "Released");
		expect(board.all()[0]).toMatchObject({
			state: "Done",
			reviewNote: "Released",
		});
	});

	it("reports counts by state", () => {
		const board = new TaskBoard();
		board.capture({ title: "A" });
		board.capture({ title: "B" });
		board.capture({ title: "C" });
		board.start("B");
		board.complete("C", "done");
		expect(board.countByState()).toMatchObject({
			Backlog: 1,
			"In Progress": 1,
			Done: 1,
		});
	});

	it("filters by owner", () => {
		const board = new TaskBoard();
		board.capture({ title: "Nora task" });
		board.capture({ title: "Ike task" });
		board.assign("Nora task", "Nora");
		board.assign("Ike task", "Ike");
		expect(board.filterByOwner("Nora").map((task) => task.title)).toEqual([
			"Nora task",
		]);
	});
});
