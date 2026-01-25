import { useApp, useInput } from "ink";
import { useState } from "react";
import { Layout } from "./components/Layout.js";
import { Actors } from "./screens/Actors.js";
import { Dashboard } from "./screens/Dashboard.js";
import { Journeys } from "./screens/Journeys.js";

const TABS = ["dashboard", "actors", "journeys"];

export const App = () => {
	const { exit } = useApp();
	const [activeTab, setActiveTab] = useState("dashboard");

	useInput((input, key) => {
		if (input === "q") {
			exit();
		}

		if (key.leftArrow) {
			const index = TABS.indexOf(activeTab);
			const prevIndex = (index - 1 + TABS.length) % TABS.length;
			setActiveTab(TABS[prevIndex]);
		}

		if (key.rightArrow) {
			const index = TABS.indexOf(activeTab);
			const nextIndex = (index + 1) % TABS.length;
			setActiveTab(TABS[nextIndex]);
		}
	});

	return (
		<Layout activeTab={activeTab}>
			{activeTab === "dashboard" && <Dashboard />}
			{activeTab === "actors" && <Actors />}
			{activeTab === "journeys" && <Journeys />}
		</Layout>
	);
};
