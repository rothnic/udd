import { Box, Text } from "ink";
import BigText from "ink-big-text";
import Gradient from "ink-gradient";
import type React from "react";

// biome-ignore lint/suspicious/noExplicitAny: library type mismatch
const GradientAny = Gradient as any;
// biome-ignore lint/suspicious/noExplicitAny: library type mismatch
const BigTextAny = BigText as any;

interface LayoutProps {
	children: React.ReactNode;
	activeTab: string;
}

export const TABS = [
	{ id: "dashboard", label: "1. Dashboard" },
	{ id: "journeys", label: "2. Journeys" },
	{ id: "inbox", label: "3. Inbox" },
	{ id: "help", label: "4. Help" },
];

export function Layout({ children, activeTab }: LayoutProps) {
	return (
		<Box flexDirection="column" padding={1} minHeight={20}>
			<Box marginBottom={1}>
				<GradientAny name="morning">
					<BigTextAny text="UDD" font="block" />
				</GradientAny>
			</Box>

			<Box
				borderStyle="single"
				borderColor="blue"
				paddingX={1}
				flexDirection="row"
			>
				{TABS.map((tab) => (
					<Box key={tab.id} marginRight={4}>
						<Text
							color={activeTab === tab.id ? "green" : "gray"}
							bold={activeTab === tab.id}
							underline={activeTab === tab.id}
						>
							{tab.label}
						</Text>
					</Box>
				))}
			</Box>

			<Box marginTop={1} flexDirection="column" flexGrow={1}>
				{children}
			</Box>

			<Box marginTop={1} borderStyle="single" borderColor="gray" paddingX={1}>
				<Text color="gray">Press 1-4 to navigate • q to quit</Text>
			</Box>
		</Box>
	);
}
