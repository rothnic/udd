import { Box, Text } from "ink";
import BigText from "ink-big-text";
import Gradient from "ink-gradient";
import type React from "react";

type Props = {
	children: React.ReactNode;
	activeTab: "dashboard" | "actors" | "journeys";
};

export const Layout = ({ children, activeTab }: Props) => {
	return (
		<Box flexDirection="column" padding={1}>
			<Box marginBottom={1}>
				<Gradient name="pastel">
					<BigText text="UDD" font="block" />
				</Gradient>
			</Box>

			<Box marginBottom={1} borderStyle="round" borderColor="cyan" paddingX={1}>
				<Text color={activeTab === "dashboard" ? "cyan" : "gray"}>
					[D]ashboard{" "}
				</Text>
				<Text> | </Text>
				<Text color={activeTab === "actors" ? "magenta" : "gray"}>
					{" "}
					[A]ctors{" "}
				</Text>
				<Text> | </Text>
				<Text color={activeTab === "journeys" ? "green" : "gray"}>
					{" "}
					[J]ourneys{" "}
				</Text>
				<Box flexGrow={1} />
				<Text color="gray">[Esc/q] Quit</Text>
			</Box>

			<Box flexGrow={1} flexDirection="column">
				{children}
			</Box>
		</Box>
	);
};
