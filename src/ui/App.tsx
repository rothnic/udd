import { Box, Text, useApp, useInput } from "ink";
import React, { useState } from "react";
import { Layout } from "./components/Layout.js";
import { Actors } from "./screens/Actors.js";
import { Dashboard } from "./screens/Dashboard.js";
import { Journeys } from "./screens/Journeys.js";

const TABS = ["Dashboard", "Actors", "Journeys"];

export default function App() {
	const { exit } = useApp();
	const [activeTab, setActiveTab] = useState(0);

	useInput((input, key) => {
		if (key.leftArrow) {
			setActiveTab((prev) => (prev > 0 ? prev - 1 : TABS.length - 1));
		}
		if (key.rightArrow) {
			setActiveTab((prev) => (prev < TABS.length - 1 ? prev + 1 : 0));
		}
		// Number keys
		if (input === "1") setActiveTab(0);
		if (input === "2") setActiveTab(1);
		if (input === "3") setActiveTab(2);
		if (input === "q") exit();
	});

	return (
		<Layout title={TABS[activeTab]}>
			<Box flexDirection="row" marginBottom={1}>
				{TABS.map((tab, index) => (
					<Box key={tab} marginRight={2}>
						<Text
							color={index === activeTab ? "black" : "gray"}
							bold={index === activeTab}
							backgroundColor={index === activeTab ? "green" : undefined}
						>
							{index === activeTab
								? ` [${index + 1}. ${tab}] `
								: `  ${index + 1}. ${tab}  `}
						</Text>
					</Box>
				))}
				<Box marginLeft={2}>
					<Text color="gray">(Use arrows or 1-3 to navigate, q to quit)</Text>
				</Box>
			</Box>
			<Box flexGrow={1} flexDirection="column">
				{activeTab === 0 && <Dashboard />}
				{activeTab === 1 && <Actors />}
				{activeTab === 2 && <Journeys />}
			</Box>
		</Layout>
	);
}
