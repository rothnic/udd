import { Box, Text, useApp, useInput } from "ink";
import BigText from "ink-big-text";
import Gradient from "ink-gradient";
import { useState } from "react";
import { Actors } from "./screens/Actors.js";
import { Dashboard } from "./screens/Dashboard.js";
import { Journeys } from "./screens/Journeys.js";
import { theme } from "./theme.js";

type Tab = "dashboard" | "actors" | "journeys";

export const App = () => {
	const [activeTab, setActiveTab] = useState<Tab>("dashboard");
	const { exit } = useApp();

	useInput((input, key) => {
		if (key.escape || input === "q") {
			exit();
		}
		if (key.leftArrow) {
			setActiveTab((prev) => {
				if (prev === "dashboard") return "journeys";
				if (prev === "actors") return "dashboard";
				return "actors";
			});
		}
		if (key.rightArrow) {
			setActiveTab((prev) => {
				if (prev === "dashboard") return "actors";
				if (prev === "actors") return "journeys";
				return "dashboard";
			});
		}
	});

	return (
		<Box flexDirection="column" padding={1}>
			<Box marginBottom={1}>
				<Gradient name="pastel">
					<BigText text="UDD" font="block" />
				</Gradient>
			</Box>

			<Box
				marginBottom={1}
				borderStyle={theme.borders.style}
				borderColor={theme.colors.dim}
			>
				<TabButton isActive={activeTab === "dashboard"} label="Dashboard (1)" />
				<Box width={1} />
				<TabButton isActive={activeTab === "actors"} label="Actors (2)" />
				<Box width={1} />
				<TabButton isActive={activeTab === "journeys"} label="Journeys (3)" />
			</Box>

			<Box>
				{activeTab === "dashboard" && <Dashboard />}
				{activeTab === "actors" && <Actors />}
				{activeTab === "journeys" && <Journeys />}
			</Box>

			<Box marginTop={1}>
				<Text color={theme.colors.dim}>Use ←/→ to navigate • 'q' to quit</Text>
			</Box>
		</Box>
	);
};

const TabButton = ({
	isActive,
	label,
}: {
	isActive: boolean;
	label: string;
}) => {
	return (
		<Text
			color={isActive ? theme.colors.primary : theme.colors.dim}
			bold={isActive}
		>
			{isActive ? theme.symbols.pointer : " "} {label}
		</Text>
	);
};
