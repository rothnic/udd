import { Box, Text } from "ink";
import Spinner from "ink-spinner";
import React, { useEffect, useState } from "react";
import { getProjectStatus } from "../../lib/status.js";
import { KeyValue } from "../components/KeyValue.js";
import { Panel } from "../components/Panel.js";
import { Section } from "../components/Section.js";

export const Dashboard = () => {
	const [status, setStatus] = useState<any>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		getProjectStatus().then((s) => {
			setStatus(s);
			setLoading(false);
		});
	}, []);

	if (loading) {
		return (
			<Box>
				<Text color="green">
					<Spinner type="dots" /> Loading project status...
				</Text>
			</Box>
		);
	}

	const { current_phase, phases, git } = status;
	const phaseName = phases[current_phase] || "Unknown";

	return (
		<Box flexDirection="column">
			<Panel title="Project Overview" borderColor="cyan">
				<KeyValue
					label="Current Phase"
					value={`${current_phase}: ${phaseName}`}
					color="cyan"
				/>
			</Panel>

			<Panel title="Health Summary" borderColor="white">
				<Box flexDirection="row" justifyContent="space-between">
					<Box flexDirection="column" marginRight={2}>
						<KeyValue
							label="Active Features"
							value={status.active_features.length}
							color="blue"
						/>
						<KeyValue
							label="Orphaned Scenarios"
							value={status.orphaned_scenarios.length}
							color={status.orphaned_scenarios.length > 0 ? "red" : "green"}
						/>
					</Box>
				</Box>
			</Panel>

			<Panel title="Git Status" borderColor={git.clean ? "green" : "yellow"}>
				<KeyValue label="Branch" value={git.branch} />
				<KeyValue
					label="State"
					value={git.clean ? "Clean" : "Dirty"}
					color={git.clean ? "green" : "red"}
				/>
				{!git.clean && (
					<Box flexDirection="column" marginTop={1}>
						{git.staged > 0 && (
							<KeyValue label="Staged" value={git.staged} color="green" />
						)}
						{git.modified > 0 && (
							<KeyValue label="Modified" value={git.modified} color="yellow" />
						)}
						{git.untracked > 0 && (
							<KeyValue label="Untracked" value={git.untracked} color="red" />
						)}
					</Box>
				)}
			</Panel>
		</Box>
	);
};
