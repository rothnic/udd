import { Box, Text } from "ink";
import BigText from "ink-big-text";
import Gradient from "ink-gradient";
import Spinner from "ink-spinner";
import type React from "react";
import { useEffect, useState } from "react";
import { getProjectStatus, type ProjectStatus } from "../../lib/status.js";

const SpinnerAny = Spinner as any;

export const Dashboard: React.FC = () => {
	const [status, setStatus] = useState<ProjectStatus | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchStatus = async () => {
			try {
				const data = await getProjectStatus();
				setStatus(data);
			} catch (e) {
				console.error(e);
			} finally {
				setLoading(false);
			}
		};
		fetchStatus();
	}, []);

	if (loading) {
		return (
			<Box>
				<Text color="green">
					<SpinnerAny type="dots" /> Loading status...
				</Text>
			</Box>
		);
	}

	if (!status) {
		return <Text color="red">Failed to load status.</Text>;
	}

	return (
		<Box flexDirection="column">
			<Gradient name="pastel">
				<BigText text="UDD" font="block" />
			</Gradient>

			<Box flexDirection="column" paddingLeft={1}>
				<Text bold underline>
					Project Status
				</Text>
				<Text>Phase: {status.current_phase}</Text>
				<Text>Branch: {status.git.branch}</Text>

				<Box marginTop={1} flexDirection="column">
					<Text bold>Stats:</Text>
					<Text>Journeys: {Object.keys(status.journeys).length}</Text>
					<Text>Features: {Object.keys(status.features).length}</Text>
					<Text>Use Cases: {Object.keys(status.use_cases).length}</Text>
				</Box>
			</Box>
		</Box>
	);
};
