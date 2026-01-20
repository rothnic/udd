import { Box, Text } from "ink";
import BigText from "ink-big-text";
import Gradient from "ink-gradient";
import Spinner from "ink-spinner";
import type React from "react";
import { useEffect, useState } from "react";
import { getProjectStatus, type ProjectStatus } from "../../lib/status.js";
import { Layout } from "../components/Layout.js";
import { theme } from "../theme.js";

export const Dashboard: React.FC = () => {
	const [status, setStatus] = useState<ProjectStatus | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		getProjectStatus().then((s) => {
			setStatus(s);
			setLoading(false);
		});
	}, []);

	if (loading) {
		return (
			<Layout title="Dashboard">
				<Box padding={1}>
					<Text color="green">
						<Spinner type="dots" /> Loading project status...
					</Text>
				</Box>
			</Layout>
		);
	}

	if (!status) {
		return (
			<Layout title="Dashboard">
				<Text color="red">Failed to load status.</Text>
			</Layout>
		);
	}

	const journeyCount = Object.keys(status.journeys).length;
	const featureCount = status.active_features.length;
	const passingScenarios = Object.values(status.journeys).reduce(
		(acc, j) => acc + j.scenariosPassing,
		0,
	);
	const totalScenarios = Object.values(status.journeys).reduce(
		(acc, j) => acc + j.scenarioCount,
		0,
	);

	return (
		<Layout title="Dashboard">
			<Box flexDirection="column" alignItems="center" marginBottom={1}>
				<Gradient name="pastel">
					<BigText text="UDD" font="block" />
				</Gradient>
				<Text italic>User Driven Development</Text>
			</Box>

			<Box
				flexDirection="row"
				gap={2}
				justifyContent="space-around"
				borderStyle="round"
				padding={1}
				borderColor={theme.colors.info}
			>
				<Box flexDirection="column" alignItems="center">
					<Text bold color={theme.colors.primary}>
						Journeys
					</Text>
					<Text>{journeyCount}</Text>
				</Box>
				<Box flexDirection="column" alignItems="center">
					<Text bold color={theme.colors.secondary}>
						Features
					</Text>
					<Text>{featureCount}</Text>
				</Box>
				<Box flexDirection="column" alignItems="center">
					<Text bold color={theme.colors.success}>
						Scenarios
					</Text>
					<Text>
						{passingScenarios}/{totalScenarios}
					</Text>
				</Box>
				<Box flexDirection="column" alignItems="center">
					<Text bold color={theme.colors.warning}>
						Phase
					</Text>
					<Text>{status.current_phase}</Text>
				</Box>
			</Box>

			<Box marginTop={1} flexDirection="column">
				<Text bold underline>
					Git Status
				</Text>
				<Text>
					Branch: <Text color="green">{status.git.branch}</Text>
				</Text>
				<Text>
					Modified: {status.git.modified} | Staged: {status.git.staged} |
					Untracked: {status.git.untracked}
				</Text>
			</Box>
		</Layout>
	);
};
