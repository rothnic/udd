import { Box, Text } from "ink";
import BigText from "ink-big-text";
import Gradient from "ink-gradient";
import type React from "react";
import type { ProjectStatus } from "../../lib/status.js";

// Cast to any to avoid type issues if types are missing or incompatible
const GradientAny = Gradient as any;
const BigTextAny = BigText as any;

interface DashboardProps {
	status: ProjectStatus;
}

export const Dashboard: React.FC<DashboardProps> = ({ status }) => {
	return (
		<Box flexDirection="column" gap={1}>
			<GradientAny name="morning">
				<BigTextAny text="UDD" font="block" />
			</GradientAny>

			<Box borderStyle="single" padding={1} flexDirection="column">
				<Text bold>Project Status</Text>
				<Box marginTop={1} flexDirection="column">
					<Text>
						Phase: <Text color="yellow">{status.current_phase}</Text>
					</Text>
					<Text>
						Branch: <Text color="blue">{status.git.branch}</Text>
					</Text>
					<Text>
						Git:
						{status.git.clean ? (
							<Text color="green"> Clean</Text>
						) : (
							<Text color="red"> Dirty</Text>
						)}
					</Text>
				</Box>
			</Box>

			<Box flexDirection="row" gap={2}>
				<Box
					borderStyle="single"
					padding={1}
					flexDirection="column"
					flexGrow={1}
				>
					<Text bold color="cyan">
						Features
					</Text>
					<Text>{status.active_features.length} Active</Text>
				</Box>
				<Box
					borderStyle="single"
					padding={1}
					flexDirection="column"
					flexGrow={1}
				>
					<Text bold color="magenta">
						Use Cases
					</Text>
					<Text>{Object.keys(status.use_cases).length} Total</Text>
				</Box>
				<Box
					borderStyle="single"
					padding={1}
					flexDirection="column"
					flexGrow={1}
				>
					<Text bold color="green">
						Journeys
					</Text>
					<Text>{Object.keys(status.journeys).length} Defined</Text>
				</Box>
			</Box>
		</Box>
	);
};
