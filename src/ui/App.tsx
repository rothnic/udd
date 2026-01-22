import { Box, Text, useInput } from "ink";
import BigText from "ink-big-text";
import Gradient from "ink-gradient";
import Spinner from "ink-spinner";
import React, { useEffect, useState } from "react";
import { getProjectStatus, type ProjectStatus } from "../lib/status.js";
import { Actors } from "./screens/Actors.js";
import { Dashboard } from "./screens/Dashboard.js";
import { Journeys } from "./screens/Journeys.js";

type Tab = "dashboard" | "actors" | "journeys";

const App = () => {
	const [tab, setTab] = useState<Tab>("dashboard");
	const [status, setStatus] = useState<ProjectStatus | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		getProjectStatus().then((s) => {
			setStatus(s);
			setLoading(false);
		});
	}, []);

	useInput((input, key) => {
		if (key.leftArrow)
			setTab((prev) =>
				prev === "dashboard"
					? "journeys"
					: prev === "actors"
						? "dashboard"
						: "actors",
			);
		if (key.rightArrow)
			setTab((prev) =>
				prev === "dashboard"
					? "actors"
					: prev === "actors"
						? "journeys"
						: "dashboard",
			);
		if (input === "1") setTab("dashboard");
		if (input === "2") setTab("actors");
		if (input === "3") setTab("journeys");
		if (input === "q") process.exit(0);
	});

	if (loading)
		return (
			<Text>
				<Spinner type="dots" /> Loading...
			</Text>
		);

	return (
		<Box flexDirection="column" padding={1}>
			<Box flexDirection="column" marginBottom={1}>
				<Gradient name="pastel">
					<BigText text="UDD" font="block" />
				</Gradient>
				<Text>User Driven Development</Text>
			</Box>

			<Box flexDirection="row" borderStyle="round" borderColor="blue">
				<TabButton label="1. Dashboard" active={tab === "dashboard"} />
				<TabButton label="2. Actors" active={tab === "actors"} />
				<TabButton label="3. Journeys" active={tab === "journeys"} />
				<Text> | q: Quit</Text>
			</Box>

			<Box marginTop={1}>
				{tab === "dashboard" && status && <Dashboard status={status} />}
				{tab === "actors" && <Actors />}
				{tab === "journeys" && status && <Journeys status={status} />}
			</Box>
		</Box>
	);
};

const TabButton = ({ label, active }: { label: string; active: boolean }) => (
	<Box marginRight={2}>
		<Text color={active ? "green" : "white"} bold={active} underline={active}>
			{label}
		</Text>
	</Box>
);

export default App;
