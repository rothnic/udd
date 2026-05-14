import { Box, Text } from "ink";
import BigText from "ink-big-text";
import Gradient from "ink-gradient";
import Spinner from "ink-spinner";
import { useProjectStatus } from "../hooks/useProjectStatus.js";

// biome-ignore lint/suspicious/noExplicitAny: library types are not compatible
const GradientAny = Gradient as any;
// biome-ignore lint/suspicious/noExplicitAny: library types are not compatible
const BigTextAny = BigText as any;

export function Dashboard() {
	const { status, loading } = useProjectStatus();

	if (loading) {
		return (
			<Box>
				<Text color="green">
					<Spinner type="dots" /> Loading project status...
				</Text>
			</Box>
		);
	}

	if (!status) {
		return <Text color="red">Failed to load status.</Text>;
	}

	return (
		<Box flexDirection="column">
			<GradientAny name="rainbow">
				<BigTextAny text="UDD" font="block" />
			</GradientAny>

			<Box marginTop={1} flexDirection="column">
				<Text>
					Phase:{" "}
					<Text color="cyan" bold>
						{status.current_phase}
					</Text>
				</Text>
				<Text>
					Branch: <Text color="yellow">{status.git.branch}</Text>
				</Text>
			</Box>

			<Box marginTop={1} flexDirection="column">
				<Text bold>Stats:</Text>
				<Text> Active Features: {status.active_features.length}</Text>
				<Text> Journeys: {Object.keys(status.journeys).length}</Text>
				<Text> Use Cases: {Object.keys(status.use_cases).length}</Text>
			</Box>
		</Box>
	);
}
