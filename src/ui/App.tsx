import { Box, Text, useApp, useInput } from "ink";
import BigText from "ink-big-text";
import Gradient from "ink-gradient";
import { useState } from "react";
import Actors from "./screens/Actors.js";
import Dashboard from "./screens/Dashboard.js";
import Journeys from "./screens/Journeys.js";

type Tab = "dashboard" | "actors" | "journeys";

const App = () => {
	const [activeTab, setActiveTab] = useState<Tab>("dashboard");
	const { exit } = useApp();

	useInput((input, key) => {
		if (key.escape) {
			exit();
		}

		if (input === "d") {
			setActiveTab("dashboard");
		} else if (input === "a") {
			setActiveTab("actors");
		} else if (input === "j") {
			setActiveTab("journeys");
		}
	});

	return (
		<Box
			flexDirection="column"
			padding={1}
			borderColor="cyan"
			borderStyle="round"
		>
			<Box flexDirection="column" alignItems="center" marginBottom={1}>
				<Gradient name="pastel">
					<BigText text="UDD" font="block" />
				</Gradient>
				<Text>User Driven Development</Text>
			</Box>

			<Box
				marginBottom={1}
				borderStyle="single"
				borderColor="gray"
				paddingX={1}
			>
				<Text
					color={activeTab === "dashboard" ? "green" : "white"}
					bold={activeTab === "dashboard"}
				>
					{" "}
					[D]ashboard{" "}
				</Text>
				<Text> | </Text>
				<Text
					color={activeTab === "actors" ? "green" : "white"}
					bold={activeTab === "actors"}
				>
					{" "}
					[A]ctors{" "}
				</Text>
				<Text> | </Text>
				<Text
					color={activeTab === "journeys" ? "green" : "white"}
					bold={activeTab === "journeys"}
				>
					{" "}
					[J]ourneys{" "}
				</Text>
				<Text> | </Text>
				<Text color="red"> [Esc] Quit </Text>
			</Box>

			<Box flexGrow={1} minHeight={10} flexDirection="column">
				{activeTab === "dashboard" && <Dashboard />}
				{activeTab === "actors" && <Actors />}
				{activeTab === "journeys" && <Journeys />}
			</Box>
		</Box>
	);
};

export default App;
