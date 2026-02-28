# Audit that quick-capture assertions are meaningful (@Sisyphus-Junior subagent)

**ID**: ses_36f176c35ffeQ87pDq9P9BfjPI
**Project ID**: ad761ea6174e58ed763fc75290c3f403ed51079d
**Created**: 2/24/2026, 12:28:07 PM
**Stats**: 1 files changed, +4 -3

---

## USER (12:28:07 PM)

import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { expect } from "vitest";

const feature = await loadFeature(
	"specs/features/tasks/quick_capture/voice_input.feature",
);

describeFeature(feature, ({ Scenario }) => {
	Scenario(
		"Create a new task using voice input from quick capture",
		({ Given, When, Then, And }) => {
			const inbox: Array<{ title: string }> = [];
			let voicePermissionGranted = false;
			let quickCaptureVisible = false;
			let transcription: string | null = null;
			let confirmationMessage: string | null = null;

			Given(
				"the mobile app is installed and voice capture permission is granted",
				() => {
					voicePermissionGranted = true;
				},
			);

			And("the quick capture entry point is visible", () => {
				quickCaptureVisible = true;
			});

			When(
				"the user activates voice capture and says {string}",
				(_, phrase: string) => {
					if (!voicePermissionGranted)
						throw new Error("Voice permission not granted");
					if (!quickCaptureVisible)
						throw new Error("Quick capture not visible");
					// Simulate voice-to-text transcription
					transcription = phrase;
				},
			);

			And("the user confirms the transcription", () => {
				if (!transcription) throw new Error("No transcription to confirm");
				inbox.push({ title: transcription });
				confirmationMessage = `Voice capture saved: ${transcription}`;
			});

			Then(
				'a new task with title "Call Sarah tomorrow" should be created in the user\'s inbox',
				() => {
					expect(inbox).toHaveLength(1);
					expect(inbox[0].title).toBe("Call Sarah tomorrow");
				},
			);

			And(
				"the app should show a confirmation that voice capture saved the task",
				() => {
					// Assert exact confirmation text to validate concrete outcome
					expect(confirmationMessage).toBe(
						"Voice capture saved: Call Sarah tomorrow",
					);
				},
			);
		},
	);
});


