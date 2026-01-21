import { Box, Text } from "ink";
import React, { useEffect, useState } from "react";
import { getProjectStatus } from "../../lib/status.js";
import { KeyValue } from "../components/KeyValue.js";
import { Panel } from "../components/Panel.js";

export const Journeys = () => {
	const [journeys, setJourneys] = useState<any[]>([]);

	useEffect(() => {
		getProjectStatus().then((status) => {
			if (status.journeys) {
				setJourneys(Object.values(status.journeys));
			}
		});
	}, []);

	return (
		<Box flexDirection="column">
			<Box marginBottom={1}>
				<Text bold>User Journeys</Text>
			</Box>

			{journeys.length === 0 ? (
				<Text italic color="gray">
					No journeys found.
				</Text>
			) : (
				journeys.map((j: any) => (
					<Panel
						key={j.name}
						title={j.name}
						borderColor={j.isStale ? "yellow" : "green"}
					>
						<Box justifyContent="space-between" marginBottom={1}>
							<Text color={j.isStale ? "yellow" : "green"}>
								{j.isStale ? "Needs Sync" : "Synced"}
							</Text>
						</Box>

						<KeyValue
							label="Coverage"
							value={`${j.scenariosPassing}/${j.scenarioCount} Passing`}
							color={
								j.scenariosPassing === j.scenarioCount ? "green" : "yellow"
							}
						/>

						{j.scenariosMissing > 0 && (
							<KeyValue
								label="Missing Scenarios"
								value={j.scenariosMissing}
								color="red"
							/>
						)}
					</Panel>
				))
			)}
		</Box>
	);
};
