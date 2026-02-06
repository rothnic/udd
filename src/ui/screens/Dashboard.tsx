import { Box, Text } from "ink";
import BigText from "ink-big-text";
import Gradient from "ink-gradient";
import Spinner from "ink-spinner";
import React from "react";
import { useProjectStatus } from "../hooks/useProjectStatus.js";

// biome-ignore lint/suspicious/noExplicitAny: library types issue
const BigTextAny = BigText as any;
// biome-ignore lint/suspicious/noExplicitAny: library types issue
const GradientAny = Gradient as any;

export const Dashboard = () => {
	const { status, loading } = useProjectStatus();

	if (loading || !status) {
		return (
			<Box>
				<Text color="green">
					<Spinner type="dots" /> Loading project status...
				</Text>
			</Box>
		);
	}

	const gitStatus = status.git;
	const activeFeatures = status.active_features.length;
	const journeys = Object.values(status.journeys || {});
	const totalJourneys = journeys.length;
	const passingJourneys = journeys.filter(
		(j) => j.scenariosFailing === 0 && j.scenariosMissing === 0,
	).length;

	return (
		<Box flexDirection="column" gap={1}>
			<Box>
				<GradientAny name="morning">
					<BigTextAny text="UDD" font="block" />
				</GradientAny>
			</Box>

			<Box
				flexDirection="column"
				borderStyle="round"
				borderColor="cyan"
				padding={1}
			>
				<Text bold underline>
					Project Status (Phase {status.current_phase})
				</Text>
				<Box marginTop={1} flexDirection="column">
					<Text>
						Git Branch: <Text color="yellow">{gitStatus.branch}</Text>
					</Text>
					<Text>
						Changes:{" "}
						<Text color={gitStatus.clean ? "green" : "red"}>
							{gitStatus.clean ? "Clean" : "Dirty"}
						</Text>{" "}
						({gitStatus.modified} modified, {gitStatus.staged} staged)
					</Text>
				</Box>
			</Box>

			<Box flexDirection="row" gap={2}>
				<Box
					flexDirection="column"
					borderStyle="single"
					padding={1}
					flexGrow={1}
				>
					<Text bold>Features</Text>
					<Text>{activeFeatures} active</Text>
				</Box>
				<Box
					flexDirection="column"
					borderStyle="single"
					padding={1}
					flexGrow={1}
				>
					<Text bold>Journeys</Text>
					<Text>
						{passingJourneys}/{totalJourneys} passing
					</Text>
				</Box>
			</Box>
		</Box>
	);
};
