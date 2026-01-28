import { Box, Text } from "ink";
import BigText from "ink-big-text";
import Gradient from "ink-gradient";
import type React from "react";

interface HeaderProps {
	phase?: number;
	phaseName?: string;
}

export const Header: React.FC<HeaderProps> = ({ phase, phaseName }) => {
	return (
		<Box flexDirection="column" marginBottom={1}>
			<Gradient name="morning">
				<BigText text="UDD" font="block" />
			</Gradient>
			<Box>
				<Text bold>User Driven Development Tool</Text>
				{phase && (
					<Text>
						{" "}
						| Phase {phase}: {phaseName || "Unknown"}
					</Text>
				)}
			</Box>
			<Text dimColor>----------------------------------------</Text>
		</Box>
	);
};
