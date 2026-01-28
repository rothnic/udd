import { Box, Text, useInput } from "ink";
import type React from "react";
import { Header } from "./Header.js";

interface LayoutProps {
	children: React.ReactNode;
	activeTab: string;
	onTabChange: (tab: string) => void;
	phase?: number;
	phaseName?: string;
}

export const Layout: React.FC<LayoutProps> = ({
	children,
	activeTab,
	onTabChange,
	phase,
	phaseName,
}) => {
	useInput((input) => {
		if (input === "1") {
			onTabChange("dashboard");
		}
		if (input === "2") {
			onTabChange("journeys");
		}
		if (input === "q") {
			process.exit(0);
		}
	});

	return (
		<Box flexDirection="column" padding={1}>
			<Header phase={phase} phaseName={phaseName} />
			<Box marginBottom={1}>
				<Tab label="1. Dashboard" isActive={activeTab === "dashboard"} />
				<Tab label="2. Journeys" isActive={activeTab === "journeys"} />
				<Box marginLeft={2}>
					<Text dimColor>(Press 'q' to quit)</Text>
				</Box>
			</Box>
			<Box
				borderStyle="single"
				padding={1}
				flexDirection="column"
				minHeight={20}
			>
				{children}
			</Box>
		</Box>
	);
};

const Tab: React.FC<{ label: string; isActive: boolean }> = ({
	label,
	isActive,
}) => {
	return (
		<Box marginRight={2}>
			<Text
				color={isActive ? "green" : "white"}
				bold={isActive}
				underline={isActive}
			>
				{label}
			</Text>
		</Box>
	);
};
