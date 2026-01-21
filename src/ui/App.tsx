import { Box, Text, useApp, useInput } from "ink";
import BigText from "ink-big-text";
import Gradient from "ink-gradient";
import React, { useEffect, useState } from "react";
import { Layout } from "./components/Layout.js";
import { Actors } from "./screens/Actors.js";
import { Dashboard } from "./screens/Dashboard.js";
import { Journeys } from "./screens/Journeys.js";

type Tab = "dashboard" | "actors" | "journeys";

export const App = () => {
	const [activeTab, setActiveTab] = useState<Tab>("dashboard");
	const { exit } = useApp();

	useInput((input, key) => {
		if (key.escape) {
			exit();
		}

		if (key.leftArrow) {
			setActiveTab((prev) => {
				if (prev === "dashboard") return "journeys";
				if (prev === "actors") return "dashboard";
				if (prev === "journeys") return "actors";
				return "dashboard";
			});
		}

		if (key.rightArrow) {
			setActiveTab((prev) => {
				if (prev === "dashboard") return "actors";
				if (prev === "actors") return "journeys";
				if (prev === "journeys") return "dashboard";
				return "dashboard";
			});
		}

		if (input === "d") setActiveTab("dashboard");
		if (input === "a") setActiveTab("actors");
		if (input === "j") setActiveTab("journeys");
		if (input === "q") exit();
	});

	return (
		<Layout activeTab={activeTab}>
			{activeTab === "dashboard" && <Dashboard />}
			{activeTab === "actors" && <Actors />}
			{activeTab === "journeys" && <Journeys />}
		</Layout>
	);
};
