import { useApp, useInput } from "ink";
import React, { useState } from "react";
import { Layout } from "./components/Layout.js";
import { Dashboard } from "./screens/Dashboard.js";
import { Help } from "./screens/Help.js";
import { Inbox } from "./screens/Inbox.js";
import { Journeys } from "./screens/Journeys.js";

export const App = () => {
	const [activeTab, setActiveTab] = useState("dashboard");
	const { exit } = useApp();

	useInput((input, key) => {
		if (input === "q") {
			exit();
		}
		if (input === "1") setActiveTab("dashboard");
		if (input === "2") setActiveTab("journeys");
		if (input === "3") setActiveTab("inbox");
		if (input === "4") setActiveTab("help");
	});

	return (
		<Layout activeTab={activeTab}>
			{activeTab === "dashboard" && <Dashboard />}
			{activeTab === "journeys" && <Journeys />}
			{activeTab === "inbox" && <Inbox />}
			{activeTab === "help" && <Help />}
		</Layout>
	);
};
