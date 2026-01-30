import { Box, Text, useInput } from "ink";
import type React from "react";

export type Tab = "dashboard" | "journeys" | "inbox" | "help";

interface LayoutProps {
	children: React.ReactNode;
	activeTab: Tab;
	onTabChange: (tab: Tab) => void;
}

export const Layout: React.FC<LayoutProps> = ({
	children,
	activeTab,
	onTabChange,
}) => {
	useInput((input, key) => {
		if (input === "1") onTabChange("dashboard");
		if (input === "2") onTabChange("journeys");
		if (input === "3") onTabChange("inbox");
		if (input === "4") onTabChange("help");
		if (key.escape) process.exit(0);
	});

	return (
		<Box
			flexDirection="column"
			padding={1}
			borderStyle="round"
			borderColor="cyan"
		>
			<Box marginBottom={1}>
				<TabItem label="1. Dashboard" isActive={activeTab === "dashboard"} />
				<TabItem label="2. Journeys" isActive={activeTab === "journeys"} />
				<TabItem label="3. Inbox" isActive={activeTab === "inbox"} />
				<TabItem label="4. Help" isActive={activeTab === "help"} />
			</Box>
			<Box flexGrow={1} flexDirection="column">
				{children}
			</Box>
			<Box marginTop={1} borderStyle="single" borderColor="gray">
				<Text color="gray">Press 1-4 to navigate • Esc to quit</Text>
			</Box>
		</Box>
	);
};

const TabItem = ({ label, isActive }: { label: string; isActive: boolean }) => {
	return (
		<Box marginRight={2}>
			<Text
				color={isActive ? "green" : "gray"}
				bold={isActive}
				underline={isActive}
			>
				{label}
			</Text>
		</Box>
	);
};
