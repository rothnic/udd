import { Box, useInput } from "ink";
import type React from "react";
import { useState } from "react";
import { TabBar } from "./components/TabBar.js";
import { Dashboard } from "./screens/Dashboard.js";
import { Journeys } from "./screens/Journeys.js";

type Screen = "dashboard" | "journeys";
const SCREENS: Screen[] = ["dashboard", "journeys"];

const App: React.FC = () => {
	const [screenIndex, setScreenIndex] = useState(0);
	const activeScreen = SCREENS[screenIndex];

	useInput((input, key) => {
		if (input === "q") {
			process.exit(0);
		}
		if (key.leftArrow) {
			setScreenIndex((prev) => (prev > 0 ? prev - 1 : SCREENS.length - 1));
		}
		if (key.rightArrow) {
			setScreenIndex((prev) => (prev < SCREENS.length - 1 ? prev + 1 : 0));
		}
		// Number keys for direct access
		const num = parseInt(input, 10);
		if (!Number.isNaN(num) && num > 0 && num <= SCREENS.length) {
			setScreenIndex(num - 1);
		}
	});

	return (
		<Box flexDirection="column" width="100%" height="100%">
			<TabBar tabs={SCREENS} activeTab={activeScreen} />

			<Box flexGrow={1}>
				{activeScreen === "dashboard" && <Dashboard />}
				{activeScreen === "journeys" && <Journeys />}
			</Box>
		</Box>
	);
};

export default App;
