import { Box, Text } from "ink";
import type React from "react";

export type Tab = "dashboard" | "journeys" | "inbox" | "help";

interface LayoutProps {
	children: React.ReactNode;
	activeTab: Tab;
}

export function Layout({ children, activeTab }: LayoutProps) {
	return (
		<Box flexDirection="column" padding={1}>
			<Box
				marginBottom={1}
				borderStyle="single"
				borderColor="blue"
				paddingX={1}
			>
				<Text color="cyan" bold>
					UDD TUI
				</Text>
				<Text> | </Text>
				<TabLabel label="Dashboard (1)" isActive={activeTab === "dashboard"} />
				<Text> | </Text>
				<TabLabel label="Journeys (2)" isActive={activeTab === "journeys"} />
				<Text> | </Text>
				<TabLabel label="Inbox (3)" isActive={activeTab === "inbox"} />
				<Text> | </Text>
				<TabLabel label="Help (4)" isActive={activeTab === "help"} />
			</Box>
			{children}
		</Box>
	);
}

function TabLabel({ label, isActive }: { label: string; isActive: boolean }) {
	return (
		<Text
			color={isActive ? "green" : "gray"}
			bold={isActive}
			inverse={isActive}
		>
			{" "}
			{label}{" "}
		</Text>
	);
}
