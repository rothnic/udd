import { Box, Text, useInput } from "ink";
import type React from "react";

export type TabName = "dashboard" | "journeys" | "inbox" | "help";

interface LayoutProps {
	children: React.ReactNode;
	activeTab: TabName;
	setActiveTab: (tab: TabName) => void;
}

const TabItem = ({
	name,
	label,
	index,
	activeTab,
}: {
	name: TabName;
	label: string;
	index: number;
	activeTab: TabName;
}) => (
	<Box marginRight={3}>
		<Text
			color={activeTab === name ? "cyan" : "gray"}
			bold={activeTab === name}
			underline={activeTab === name}
		>
			{index}. {label}
		</Text>
	</Box>
);

export const Layout = ({ children, activeTab, setActiveTab }: LayoutProps) => {
	useInput((input, key) => {
		if (input === "1") setActiveTab("dashboard");
		if (input === "2") setActiveTab("journeys");
		if (input === "3") setActiveTab("inbox");
		if (input === "4") setActiveTab("help");
		if (key.escape || input === "q") {
			process.exit(0);
		}
	});

	return (
		<Box flexDirection="column" padding={1}>
			<Box borderStyle="round" borderColor="cyan" paddingX={2} width="100%">
				<TabItem
					name="dashboard"
					label="Dashboard"
					index={1}
					activeTab={activeTab}
				/>
				<TabItem
					name="journeys"
					label="Journeys"
					index={2}
					activeTab={activeTab}
				/>
				<TabItem name="inbox" label="Inbox" index={3} activeTab={activeTab} />
				<TabItem name="help" label="Help" index={4} activeTab={activeTab} />
				<Box flexGrow={1} />
				<Text color="dim">q to quit</Text>
			</Box>
			<Box marginTop={1} flexDirection="column" flexGrow={1}>
				{children}
			</Box>
		</Box>
	);
};
