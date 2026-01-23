import { Box, Text } from "ink";
import Spinner from "ink-spinner";
import React, { useEffect, useState } from "react";
import { getProjectStatus, type ProjectStatus } from "../../lib/status.js";
import { KeyValue } from "../components/KeyValue.js";
import { Panel } from "../components/Panel.js";

export function Dashboard() {
	const [status, setStatus] = useState<ProjectStatus | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		getProjectStatus().then((s) => {
			setStatus(s);
			setLoading(false);
		});
	}, []);

	if (loading || !status) {
		return (
			<Box>
				<Text color="green">
					<Spinner type="dots" /> Loading status...
				</Text>
			</Box>
		);
	}

	return (
		<Box flexDirection="column" gap={1}>
			<Box flexDirection="row" gap={1}>
				<Panel title="Project Info" flexGrow={1}>
					<KeyValue
						label="Phase"
						value={`${status.current_phase} - ${status.phases[status.current_phase] || "Unknown"}`}
						color="cyan"
					/>
					<KeyValue
						label="Git Branch"
						value={status.git.branch}
						color="magenta"
					/>
					<KeyValue
						label="Git State"
						value={status.git.clean ? "Clean" : "Dirty"}
						color={status.git.clean ? "green" : "red"}
					/>
				</Panel>
				<Panel title="Counts" flexGrow={1}>
					<KeyValue
						label="Active Features"
						value={status.active_features.length}
					/>
					<KeyValue
						label="Use Cases"
						value={Object.keys(status.use_cases).length}
					/>
					<KeyValue
						label="Journeys"
						value={Object.keys(status.journeys).length}
					/>
					<KeyValue
						label="Orphaned Scenarios"
						value={status.orphaned_scenarios.length}
						color={status.orphaned_scenarios.length > 0 ? "yellow" : "gray"}
					/>
				</Panel>
			</Box>
		</Box>
	);
}
