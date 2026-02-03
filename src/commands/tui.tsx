import { Command } from "commander";
import { render, Text } from "ink";
import React, { useState } from "react";
import { Layout } from "../ui/components/Layout.js";
import { useProjectStatus } from "../ui/hooks/useProjectStatus.js";
import { Dashboard } from "../ui/screens/Dashboard.js";
import { Help } from "../ui/screens/Help.js";
import { Inbox } from "../ui/screens/Inbox.js";
import { Journeys } from "../ui/screens/Journeys.js";

const App = () => {
	const [activeTab, setActiveTab] = useState("dashboard");
	const { status, loading, error } = useProjectStatus();

	if (loading) return <Text>Loading project status...</Text>;
	if (error)
		return <Text color="red">Error loading status: {error.message}</Text>;
	if (!status) return <Text color="red">No status available.</Text>;

	return (
		<Layout activeTab={activeTab} onTabChange={setActiveTab}>
			{activeTab === "dashboard" && <Dashboard status={status} />}
			{activeTab === "journeys" && <Journeys status={status} />}
			{activeTab === "inbox" && <Inbox />}
			{activeTab === "help" && <Help />}
		</Layout>
	);
};

export const tuiCommand = new Command("tui")
	.description("Start the interactive TUI mode")
	.action(() => {
		// Run the Ink app
		render(<App />);
	});
