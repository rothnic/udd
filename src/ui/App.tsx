import { Box, Text, useApp, useInput } from "ink";
import React, { useState } from "react";
import { Layout } from "./components/Layout.js";
import { Loading } from "./components/Loading.js";
import { useProjectStatus } from "./hooks/useProjectStatus.js";
import { Dashboard } from "./screens/Dashboard.js";

type Tab = "dashboard" | "journeys" | "specs" | "tests";

const App = () => {
	const { exit } = useApp();
	const [activeTab, setActiveTab] = useState<Tab>("dashboard");
	const { status, loading, error } = useProjectStatus();

	useInput((input, key) => {
		if (input === "q") {
			exit();
		}
		if (input === "1") setActiveTab("dashboard");
		if (input === "2") setActiveTab("journeys");
	});

	if (loading) {
		return <Loading text="Loading project status..." />;
	}

	if (error) {
		return <Text color="red">Error: {error.message}</Text>;
	}

	if (!status) {
		return <Text color="red">No status available.</Text>;
	}

	return (
		<Layout>
			<Box gap={2}>
				<Text
					color={activeTab === "dashboard" ? "green" : undefined}
					bold={activeTab === "dashboard"}
				>
					1. Dashboard
				</Text>
				<Text
					color={activeTab === "journeys" ? "green" : undefined}
					bold={activeTab === "journeys"}
				>
					2. Journeys
				</Text>
				<Text>q. Quit</Text>
			</Box>

			<Box marginTop={1}>
				{activeTab === "dashboard" && <Dashboard status={status} />}
				{activeTab === "journeys" && (
					<Text>Journeys screen coming soon...</Text>
				)}
			</Box>
		</Layout>
	);
};

export default App;
