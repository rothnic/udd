import { Box, Text, useApp, useInput } from "ink";
import type React from "react";

interface LayoutProps {
	children: React.ReactNode;
	activeTab: string;
	onTabChange: (tab: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({
	children,
	activeTab,
	onTabChange,
}) => {
	const { exit } = useApp();

	const tabs = [
		{ id: "dashboard", label: "1. Dashboard" },
		{ id: "journeys", label: "2. Journeys" },
		{ id: "inbox", label: "3. Inbox" },
		{ id: "help", label: "4. Help" },
	];

	useInput((input, key) => {
		if (input === "1") onTabChange("dashboard");
		if (input === "2") onTabChange("journeys");
		if (input === "3") onTabChange("inbox");
		if (input === "4") onTabChange("help");
		if (key.escape || input === "q") exit();
	});

	return (
		<Box flexDirection="column" minHeight={20}>
			<Box borderStyle="round" borderColor="cyan" paddingX={1}>
				{tabs.map((tab, index) => (
					<Box key={tab.id} marginRight={2}>
						<Text
							color={activeTab === tab.id ? "green" : "gray"}
							bold={activeTab === tab.id}
						>
							{tab.label}
						</Text>
					</Box>
				))}
				<Box flexGrow={1} />
				<Text color="red">q to Quit</Text>
			</Box>
			<Box flexGrow={1} flexDirection="column" padding={1}>
				{children}
			</Box>
		</Box>
	);
};
