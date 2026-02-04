import { Box, Text, useApp, useInput } from "ink";
import { useState } from "react";
import { Layout } from "./components/Layout.js";
import { Dashboard } from "./screens/Dashboard.js";
import { Inbox } from "./screens/Inbox.js";
import { Journeys } from "./screens/Journeys.js";

export function App() {
	const [activeTab, setActiveTab] = useState("dashboard");
	const { exit } = useApp();

	useInput((input, _key) => {
		if (input === "1") setActiveTab("dashboard");
		if (input === "2") setActiveTab("journeys");
		if (input === "3") setActiveTab("inbox");
		if (input === "4") setActiveTab("help");
		if (input === "q") exit();
	});

	return (
		<Layout activeTab={activeTab}>
			{activeTab === "dashboard" && <Dashboard />}
			{activeTab === "journeys" && <Journeys />}
			{activeTab === "inbox" && <Inbox />}
			{activeTab === "help" && (
				<Box flexDirection="column">
					<Text bold>Help</Text>
					<Text>1: Dashboard - View project status</Text>
					<Text>2: Journeys - Explore user journeys</Text>
					<Text>3: Inbox - Process incoming items</Text>
					<Text>q: Quit</Text>
				</Box>
			)}
		</Layout>
	);
}
