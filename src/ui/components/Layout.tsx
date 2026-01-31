import { Box, Text } from "ink";
import type React from "react";

type LayoutProps = {
	children: React.ReactNode;
	activeTab: string;
};

const Tabs = ({ activeTab }: { activeTab: string }) => {
	return (
		<Box borderStyle="single" borderColor="cyan" paddingX={1}>
			<Text>
				<Text color={activeTab === "dashboard" ? "green" : "gray"}>
					1. Dashboard
				</Text>{" "}
				|{" "}
				<Text color={activeTab === "journeys" ? "green" : "gray"}>
					2. Journeys
				</Text>{" "}
				| <Text color={activeTab === "inbox" ? "green" : "gray"}>3. Inbox</Text>{" "}
				| <Text color={activeTab === "help" ? "green" : "gray"}>4. Help</Text>
			</Text>
		</Box>
	);
};

export const Layout = ({ children, activeTab }: LayoutProps) => {
	return (
		<Box flexDirection="column" height="100%">
			<Box marginBottom={1}>
				<Text bold>UDD - User Driven Development</Text>
			</Box>
			<Tabs activeTab={activeTab} />
			<Box flexGrow={1} borderStyle="round" borderColor="gray" padding={1}>
				{children}
			</Box>
			<Box marginTop={1}>
				<Text color="gray">Press 'q' to exit</Text>
			</Box>
		</Box>
	);
};
