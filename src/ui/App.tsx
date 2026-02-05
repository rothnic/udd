import { Text, useApp, useInput } from "ink";
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
				<Text>Help: Press 1-4 to navigate, q to quit.</Text>
			)}
		</Layout>
	);
}
