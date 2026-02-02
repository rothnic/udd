import { Command } from "commander";
import { Box, render, Text, useApp, useInput } from "ink";
import Spinner from "ink-spinner";
import React, { useState } from "react";
import { Layout, type Tab } from "../ui/components/Layout.js";
import { useProjectStatus } from "../ui/hooks/useProjectStatus.js";
import { Dashboard } from "../ui/screens/Dashboard.js";
import { Inbox } from "../ui/screens/Inbox.js";
import { Journeys } from "../ui/screens/Journeys.js";

const SpinnerAny = Spinner as any;

function App() {
	const { status, loading, error } = useProjectStatus();
	const [activeTab, setActiveTab] = useState<Tab>("dashboard");
	const { exit } = useApp();

	useInput((input, key) => {
		if (input === "1") setActiveTab("dashboard");
		if (input === "2") setActiveTab("journeys");
		if (input === "3") setActiveTab("inbox");
		if (input === "4") setActiveTab("help");
		if (key.escape || input === "q") {
			exit();
		}
	});

	if (loading) {
		return (
			<Box>
				<Text color="green">
					<SpinnerAny type="dots" /> Loading project status...
				</Text>
			</Box>
		);
	}

	if (error || !status) {
		return (
			<Text color="red">
				Error loading status: {error?.message || "Unknown error"}
			</Text>
		);
	}

	return (
		<Layout activeTab={activeTab}>
			{activeTab === "dashboard" && <Dashboard status={status} />}
			{activeTab === "journeys" && <Journeys status={status} />}
			{activeTab === "inbox" && <Inbox />}
			{activeTab === "help" && (
				<Box flexDirection="column">
					<Text bold>Help</Text>
					<Text>Press 1-4 to switch tabs.</Text>
					<Text>Press 'q' or Esc to quit.</Text>
				</Box>
			)}
		</Layout>
	);
}

export const tuiCommand = new Command("tui")
	.description("Launch the TUI mode")
	.action(() => {
		render(<App />);
	});
