export type TaskState = "Backlog" | "In Progress" | "Blocked" | "Done";

export interface Task {
	id: string;
	title: string;
	description?: string;
	source?: string;
	priority: "low" | "normal" | "high";
	owner?: string;
	state: TaskState;
	blockedReason?: string;
	reviewNote?: string;
}

export class TaskBoard {
	private tasks: Task[] = [];

	capture(input: {
		title?: string;
		description?: string;
		source?: string;
	}): Task {
		if (!input.title?.trim()) throw new Error("Title is required");
		const task: Task = {
			id: `task-${this.tasks.length + 1}`,
			title: input.title,
			description: input.description,
			source: input.source,
			priority: "normal",
			state: "Backlog",
		};
		this.tasks.push(task);
		return task;
	}

	all(): Task[] {
		return [...this.tasks];
	}

	setPriority(title: string, priority: Task["priority"]): void {
		this.find(title).priority = priority;
	}

	moveBefore(title: string, beforeTitle: string): void {
		this.find(title);
		this.find(beforeTitle);
		const task = this.remove(title);
		const index = this.tasks.findIndex((item) => item.title === beforeTitle);
		this.tasks.splice(index, 0, task);
	}

	assign(title: string, owner: string): void {
		this.find(title).owner = owner;
	}

	unassigned(): Task[] {
		return this.tasks.filter((task) => !task.owner);
	}

	start(title: string): void {
		this.find(title).state = "In Progress";
	}

	block(title: string, reason: string): void {
		const task = this.find(title);
		task.state = "Blocked";
		task.blockedReason = reason;
	}

	complete(title: string, note: string): void {
		const task = this.find(title);
		task.state = "Done";
		task.reviewNote = note;
	}

	countByState(): Record<TaskState, number> {
		return {
			Backlog: this.tasks.filter((task) => task.state === "Backlog").length,
			"In Progress": this.tasks.filter((task) => task.state === "In Progress")
				.length,
			Blocked: this.tasks.filter((task) => task.state === "Blocked").length,
			Done: this.tasks.filter((task) => task.state === "Done").length,
		};
	}

	filterByOwner(owner: string): Task[] {
		return this.tasks.filter((task) => task.owner === owner);
	}

	private find(title: string): Task {
		const task = this.tasks.find((item) => item.title === title);
		if (!task) throw new Error(`Task not found: ${title}`);
		return task;
	}

	private remove(title: string): Task {
		const index = this.tasks.findIndex((item) => item.title === title);
		if (index < 0) throw new Error(`Task not found: ${title}`);
		return this.tasks.splice(index, 1)[0];
	}
}
