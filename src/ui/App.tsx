import { Box, Text } from "ink";
import Spinner from "ink-spinner";
import type React from "react";
import { useState } from "react";
import { Layout } from "./components/Layout.js";
import { useProjectStatus } from "./hooks/useProjectStatus.js";
import { Dashboard } from "./screens/Dashboard.js";
import { Journeys } from "./screens/Journeys.js";

// Cast Spinner to any to avoid type issues if they arise, or use it directly if types are good.
const SpinnerAny = Spinner as any;

export const App: React.FC = () => {
	const [activeTab, setActiveTab] = useState("dashboard");
	const { status, loading, error } = useProjectStatus();

	if (loading) {
		return (
			<Text>
				<Text color="green">
					<SpinnerAny type="dots" />
				</Text>{" "}
				Loading project status...
			</Text>
		);
	}

	if (error) {
		return <Text color="red">Error: {error.message}</Text>;
	}

	if (!status) {
		return <Text color="red">Could not load status.</Text>;
	}

	const currentPhaseName =
		status.phases[status.current_phase.toString()] || "Unknown Phase";

	return (
		<Layout
			activeTab={activeTab}
			onTabChange={setActiveTab}
			phase={status.current_phase}
			phaseName={currentPhaseName}
		>
			{activeTab === "dashboard" && <Dashboard status={status} />}
			{activeTab === "journeys" && <Journeys status={status} />}
		</Layout>
	);
};
