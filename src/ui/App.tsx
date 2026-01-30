import { Text } from "ink";
import React, { useState } from "react";
import { Layout, type Tab } from "./components/Layout.js";
import { Dashboard } from "./screens/Dashboard.js";

export const App = () => {
	const [activeTab, setActiveTab] = useState<Tab>("dashboard");

	return (
		<Layout activeTab={activeTab} onTabChange={setActiveTab}>
			{activeTab === "dashboard" && <Dashboard />}
			{activeTab === "journeys" && <Text>Journeys Screen (Coming Soon)</Text>}
			{activeTab === "inbox" && <Text>Inbox Screen (Coming Soon)</Text>}
			{activeTab === "help" && <Text>Help Screen (Coming Soon)</Text>}
		</Layout>
	);
};
