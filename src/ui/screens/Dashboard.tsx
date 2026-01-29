import { Box, Text } from "ink";
import BigText from "ink-big-text";
import Gradient from "ink-gradient";
import { LoadingSpinner } from "../components/Spinner.js";
import { useProjectStatus } from "../hooks/useProjectStatus.js";

export const Dashboard = () => {
	const { status, loading, error } = useProjectStatus();

	if (loading) {
		return (
			<Box
				height={10}
				flexDirection="column"
				justifyContent="center"
				alignItems="center"
			>
				<LoadingSpinner label="Loading Project Status..." />
			</Box>
		);
	}

	if (error) {
		return (
			<Box borderColor="red" borderStyle="single" padding={1}>
				<Text color="red">Error loading status: {error.message}</Text>
			</Box>
		);
	}

	if (!status) return <Text color="red">No status data available.</Text>;

	return (
		<Box flexDirection="column">
			<Box marginBottom={1}>
				<Gradient name="pastel">
					<BigText text="UDD" font="block" />
				</Gradient>
			</Box>

			<Box flexDirection="row" gap={2}>
				<Box
					flexDirection="column"
					borderStyle="round"
					padding={1}
					borderColor="cyan"
					flexGrow={1}
				>
					<Text bold underline>
						Current Phase
					</Text>
					<Box marginTop={1}>
						<Text color="cyan" bold>
							Phase {status.current_phase}
						</Text>
					</Box>
					<Text italic>{status.phases[status.current_phase] || "Unknown"}</Text>
				</Box>

				<Box
					flexDirection="column"
					borderStyle="round"
					padding={1}
					borderColor="green"
					flexGrow={1}
				>
					<Text bold underline>
						Git Status
					</Text>
					<Box marginTop={1}>
						<Text>
							Branch:{" "}
							<Text color="green" bold>
								{status.git.branch}
							</Text>
						</Text>
						<Text>
							State:{" "}
							{status.git.clean ? (
								<Text color="green">Clean</Text>
							) : (
								<Text color="yellow">Dirty</Text>
							)}
						</Text>
						{!status.git.clean && (
							<Box flexDirection="column" marginLeft={2}>
								{status.git.modified > 0 && (
									<Text color="yellow">M: {status.git.modified}</Text>
								)}
								{status.git.staged > 0 && (
									<Text color="green">S: {status.git.staged}</Text>
								)}
								{status.git.untracked > 0 && (
									<Text color="red">?: {status.git.untracked}</Text>
								)}
							</Box>
						)}
					</Box>
				</Box>
			</Box>

			<Box
				borderStyle="round"
				padding={1}
				flexDirection="column"
				marginTop={1}
				borderColor="magenta"
			>
				<Text bold underline>
					Project Overview
				</Text>
				<Box flexDirection="row" justifyContent="space-between" marginTop={1}>
					<Text>
						Journeys:{" "}
						<Text bold color="white">
							{Object.keys(status.journeys).length}
						</Text>
					</Text>
					<Text>
						Active Features:{" "}
						<Text bold color="white">
							{status.active_features.length}
						</Text>
					</Text>
					<Text>
						Use Cases:{" "}
						<Text bold color="white">
							{Object.keys(status.use_cases).length}
						</Text>
					</Text>
					<Text>
						Orphaned Scenarios:{" "}
						<Text
							bold
							color={status.orphaned_scenarios.length > 0 ? "red" : "green"}
						>
							{status.orphaned_scenarios.length}
						</Text>
					</Text>
				</Box>
			</Box>
		</Box>
	);
};
