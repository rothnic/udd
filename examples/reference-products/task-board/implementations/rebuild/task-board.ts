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
	private order: string[] = [];
	private records = new Map<string, Task>();

	capture(input: {
		title?: string;
		description?: string;
		source?: string;
	}): Task {
		if (!input.title?.trim()) throw new Error("Title is required");
		const task: Task = {
			id: `task-${this.order.length + 1}`,
			title: input.title,
			description: input.description,
			source: input.source,
			priority: "normal",
			state: "Backlog",
		};
		this.order.push(task.id);
		this.records.set(task.id, task);
		return task;
	}

	all(): Task[] {
		return this.order.map((id) => this.requireById(id));
	}

	setPriority(title: string, priority: Task["priority"]): void {
		this.find(title).priority = priority;
	}

	moveBefore(title: string, beforeTitle: string): void {
		const moving = this.find(title);
		const before = this.find(beforeTitle);
		this.order = this.order.filter((id) => id !== moving.id);
		const index = this.order.indexOf(before.id);
		this.order.splice(index < 0 ? 0 : index, 0, moving.id);
	}

	assign(title: string, owner: string): void {
		this.find(title).owner = owner;
	}

	unassigned(): Task[] {
		return this.all().filter((task) => !task.owner);
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
		return this.all().reduce(
			(counts, task) => {
				counts[task.state] += 1;
				return counts;
			},
			{ Backlog: 0, "In Progress": 0, Blocked: 0, Done: 0 },
		);
	}

	filterByOwner(owner: string): Task[] {
		return this.all().filter((task) => task.owner === owner);
	}

	private find(title: string): Task {
		const task = this.all().find((item) => item.title === title);
		if (!task) throw new Error(`Task not found: ${title}`);
		return task;
	}

	private requireById(id: string): Task {
		const task = this.records.get(id);
		if (!task) throw new Error(`Task not found: ${id}`);
		return task;
	}
}
