import { Box, Text } from "ink";
import Spinner from "ink-spinner";
import { useEffect, useState } from "react";
import { getProjectStatus, type ProjectStatus } from "../../lib/status.js";
import { theme } from "../theme.js";

export const Dashboard = () => {
	const [status, setStatus] = useState<ProjectStatus | null>(null);

	useEffect(() => {
		getProjectStatus().then(setStatus);
	}, []);

	if (!status) {
		return (
			<Box>
				<Text color={theme.colors.success}>
					<Spinner type="dots" /> Loading status...
				</Text>
			</Box>
		);
	}

	const journeyCount = Object.keys(status.journeys || {}).length;
	const activeFeatures = status.active_features.length;
	const useCases = Object.keys(status.use_cases || {}).length;

	return (
		<Box flexDirection="column">
			<Box marginBottom={1}>
				<Text bold>Project Overview</Text>
			</Box>

			<Box flexDirection="row" gap={2}>
				<StatBox label="Journeys" value={journeyCount} />
				<StatBox label="Features" value={activeFeatures} />
				<StatBox label="Use Cases" value={useCases} />
			</Box>

			<Box marginTop={1}>
				<Text>
					Git Branch:{" "}
					<Text color={theme.colors.secondary}>{status.git.branch}</Text>
					{status.git.clean ? (
						<Text color={theme.colors.success}> (clean)</Text>
					) : (
						<Text color={theme.colors.warning}> (dirty)</Text>
					)}
				</Text>
			</Box>
		</Box>
	);
};

const StatBox = ({ label, value }: { label: string; value: number }) => (
	<Box
		borderStyle={theme.borders.style}
		borderColor={theme.colors.primary}
		paddingX={1}
	>
		<Box flexDirection="column" alignItems="center">
			<Text color={theme.colors.secondary} bold>
				{value}
			</Text>
			<Text>{label}</Text>
		</Box>
	</Box>
);
