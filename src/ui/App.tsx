import { useState } from "react";
import { Layout, type TabName } from "./components/Layout.js";
import { Dashboard } from "./screens/Dashboard.js";
import { Help } from "./screens/Help.js";
import { Inbox } from "./screens/Inbox.js";
import { Journeys } from "./screens/Journeys.js";

export default function App() {
	const [activeTab, setActiveTab] = useState<TabName>("dashboard");

	return (
		<Layout activeTab={activeTab} setActiveTab={setActiveTab}>
			{activeTab === "dashboard" && <Dashboard />}
			{activeTab === "journeys" && <Journeys />}
			{activeTab === "inbox" && <Inbox />}
			{activeTab === "help" && <Help />}
		</Layout>
	);
}
