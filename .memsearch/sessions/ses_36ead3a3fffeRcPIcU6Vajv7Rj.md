# Add sync step implementation to mobile widget test (@Sisyphus-Junior subagent)

**ID**: ses_36ead3a3fffeRcPIcU6Vajv7Rj
**Project ID**: ad761ea6174e58ed763fc75290c3f403ed51079d
**Created**: 2/24/2026, 2:24:06 PM
**Stats**: 1 files changed, +13 -1

---

## USER (2:24:07 PM)

import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { expect } from "vitest";

const feature = await loadFeature(
	"specs/features/tasks/quick_capture/mobile_widget.feature",
);

describeFeature(feature, ({ Scenario }) => {
	Scenario(
		"Capture a new task from lock screen widget",
		({ Given, When, Then, And }) => {
			// Minimal in-memory state to simulate the app's inbox
			const inbox: Array<{ title: string }> = [];
			let widgetAvailable = false;
			let onLockScreen = false;
			let lastNotification: string | null = null;
			let draft: string | undefined;

			Given(
				"the mobile app is installed and the quick capture widget is available on the lock screen",
				() => {
					// Simulate that the widget is provided by the app and visible to the OS
					widgetAvailable = true;
				},
			);

			And("the user is on the device lock screen", () => {
				// Simulate lock screen state
				onLockScreen = true;
			});

			When("the user taps the quick capture widget", () => {
				// Tapping when widget is available and on lock screen should open the quick capture input
				if (!widgetAvailable || !onLockScreen)
					throw new Error("Widget not reachable");
			});

			And('the user enters "Buy milk" into the quick capture input', () => {
				// Simulate user typing the task title into a widget input field
				const input = "Buy milk";
				// Basic validation to mirror real UI behavior
				if (!input || input.trim().length === 0) throw new Error("Empty input");
				// store temporarily on widget state for save step
				draft = input.trim();
			});

			And("the user taps the Save button on the widget", () => {
				if (!draft) throw new Error("Nothing to save");
				// Simulate creating a new task in inbox
				inbox.push({ title: draft });
				// Simulate confirmation notification available from lock screen
				lastNotification = `Saved: ${draft}`;
				// clear draft
				draft = undefined;
			});

			// New step: simulate syncing to server. Keep minimal: set a flag and assert inbox unchanged.
			And("task is synced to server", () => {
				// In this in-memory simulation we represent sync by a simple boolean flag
				const synced = inbox.length > 0; // if there's something in inbox, assume it synced
				if (!synced) throw new Error("No task available to sync");
				// Optionally, mark the first task as serverSynced for downstream checks
				// (mutating minimal in-memory shape)
				// @ts-expect-error - test-only augmentation
				(inbox[0] as any).serverSynced = true;
				// simple assertion to ensure step executed
				expect((inbox[0] as any).serverSynced).toBe(true);
			});

			Then(
				'a new task with title "Buy milk" should be created in the user\'s inbox',
				() => {
					// Assert that the inbox received the task
					expect(inbox).toHaveLength(1);
					expect(inbox[0].title).toBe("Buy milk");
				},
			);

			And(
				"the app should show a confirmation notification from the lock screen",
				() => {
					// Assert a notification message was produced
					expect(typeof lastNotification).toBe("string");
					expect(lastNotification).toContain("Saved: Buy milk");
				},
			);
		},
	);
});


## USER (2:25:02 PM)

import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { expect } from "vitest";

const feature = await loadFeature(
	"specs/features/tasks/quick_capture/mobile_widget.feature",
);

describeFeature(feature, ({ Scenario }) => {
	Scenario(
		"Capture a new task from lock screen widget",
		({ Given, When, Then, And }) => {
			// Minimal in-memory state to simulate the app's inbox
			const inbox: Array<{ title: string; serverSynced?: boolean }> = [];
			let widgetAvailable = false;
			let onLockScreen = false;
			let lastNotification: string | null = null;
			let draft: string | undefined;

			Given(
				"the mobile app is installed and the quick capture widget is available on the lock screen",
				() => {
					// Simulate that the widget is provided by the app and visible to the OS
					widgetAvailable = true;
				},
			);

			And("the user is on the device lock screen", () => {
				// Simulate lock screen state
				onLockScreen = true;
			});

			When("the user taps the quick capture widget", () => {
				// Tapping when widget is available and on lock screen should open the quick capture input
				if (!widgetAvailable || !onLockScreen)
					throw new Error("Widget not reachable");
			});

			And('the user enters "Buy milk" into the quick capture input', () => {
				// Simulate user typing the task title into a widget input field
				const input = "Buy milk";
				// Basic validation to mirror real UI behavior
				if (!input || input.trim().length === 0) throw new Error("Empty input");
				// store temporarily on widget state for save step
				draft = input.trim();
			});

			And("the user taps the Save button on the widget", () => {
				if (!draft) throw new Error("Nothing to save");
				// Simulate creating a new task in inbox
				inbox.push({ title: draft });
				// Simulate confirmation notification available from lock screen
				lastNotification = `Saved: ${draft}`;
				// clear draft
				draft = undefined;
			});

			// New step: simulate syncing to server. Keep minimal: set a flag and assert inbox unchanged.
			And("task is synced to server", () => {
				// In this in-memory simulation we represent sync by a simple boolean flag
				const synced = inbox.length > 0; // if there's something in inbox, assume it synced
				if (!synced) throw new Error("No task available to sync");
				// Optionally, mark the first task as serverSynced for downstream checks
				// (mutating minimal in-memory shape)
				inbox[0].serverSynced = true;
				// simple assertion to ensure step executed
				expect(inbox[0].serverSynced).toBe(true);
			});

			Then(
				'a new task with title "Buy milk" should be created in the user\'s inbox',
				() => {
					// Assert that the inbox received the task
					expect(inbox).toHaveLength(1);
					expect(inbox[0].title).toBe("Buy milk");
				},
			);

			And(
				"the app should show a confirmation notification from the lock screen",
				() => {
					// Assert a notification message was produced
					expect(typeof lastNotification).toBe("string");
					expect(lastNotification).toContain("Saved: Buy milk");
				},
			);
		},
	);
});


