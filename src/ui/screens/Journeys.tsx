import { Box, Text } from "ink";
import Spinner from "ink-spinner";
import React, { useEffect, useState } from "react";
import { getProjectStatus, type ProjectStatus } from "../../lib/status.js";
import { KeyValue } from "../components/KeyValue.js";
import { Panel } from "../components/Panel.js";

export function Journeys() {
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
			<Text color="green">
				<Spinner type="dots" /> Loading journeys...
			</Text>
		);
	}

	const journeyKeys = Object.keys(status.journeys);

	if (journeyKeys.length === 0) {
		return (
			<Panel title="Journeys">
				<Text color="yellow">No journeys found in product/journeys/</Text>
				<Text>Run `udd new journey &lt;name&gt;` to create one.</Text>
			</Panel>
		);
	}

	return (
		<Box flexDirection="column" gap={1}>
			{journeyKeys.map((key) => {
				const j = status.journeys[key];
				return (
					<Panel
						key={key}
						title={j.name}
						borderColor={j.isStale ? "yellow" : "gray"}
					>
						<KeyValue label="Actor" value={j.actor} />
						<KeyValue label="Goal" value={j.goal} />
						<Box marginTop={1}>
							<Text>
								Scenarios:{" "}
								<Text color="green">{j.scenariosPassing} passing</Text>,{" "}
								<Text color="red">{j.scenariosFailing} failing</Text>,{" "}
								<Text color="gray">{j.scenariosMissing} missing</Text>
							</Text>
						</Box>
						{j.isStale && (
							<Text color="yellow" italic>
								{" "}
								(Needs sync)
							</Text>
						)}
					</Panel>
				);
			})}
		</Box>
	);
}
