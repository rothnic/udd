import { Box, Text } from "ink";
import type React from "react";

interface LayoutProps {
	children: React.ReactNode;
	activeTab: string;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeTab }) => {
	return (
		<Box flexDirection="column" padding={1} borderStyle="single" height="100%">
			<Box paddingBottom={1}>
				<Text color="cyan" bold>
					UDD TUI
				</Text>
				<Text> | </Text>
				<Text color={activeTab === "dashboard" ? "green" : "gray"}>
					[1] Dashboard
				</Text>
				<Text> | </Text>
				<Text color={activeTab === "journeys" ? "green" : "gray"}>
					[2] Journeys
				</Text>
				<Text> | </Text>
				<Text color={activeTab === "inbox" ? "green" : "gray"}>[3] Inbox</Text>
				<Text> | </Text>
				<Text color={activeTab === "help" ? "green" : "gray"}>[4] Help</Text>
			</Box>
			<Box flexGrow={1}>{children}</Box>
			<Box
				paddingTop={1}
				borderStyle="single"
				borderTop={true}
				borderBottom={false}
				borderLeft={false}
				borderRight={false}
			>
				<Text color="gray">
					Press 'q' to quit. Use number keys to navigate.
				</Text>
			</Box>
		</Box>
	);
};
