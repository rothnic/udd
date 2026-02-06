import { useApp, useInput } from "ink";
import BigText from "ink-big-text";
import React, { useState } from "react";
import { Layout } from "./components/Layout.js";
import { Dashboard } from "./screens/Dashboard.js";

// biome-ignore lint/suspicious/noExplicitAny: library types issue
const BigTextAny = BigText as any;

export const App = () => {
	const { exit } = useApp();
	const [activeTab, setActiveTab] = useState("dashboard");

	useInput((input, key) => {
		if (input === "q") {
			exit();
		}
		if (input === "1") {
			setActiveTab("dashboard");
		}
		if (input === "2") {
			setActiveTab("journeys");
		}
		if (input === "3") {
			setActiveTab("inbox");
		}
		if (input === "4") {
			setActiveTab("help");
		}
	});

	return (
		<Layout activeTab={activeTab}>
			{activeTab === "dashboard" && <Dashboard />}
			{activeTab === "journeys" && <Placeholder name="Journeys" />}
			{activeTab === "inbox" && <Placeholder name="Inbox" />}
			{activeTab === "help" && <Placeholder name="Help" />}
		</Layout>
	);
};

const Placeholder = ({ name }: { name: string }) => {
	return <BigTextAny text={name} />;
};
