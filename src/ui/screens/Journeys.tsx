import { Box, Text } from "ink";
import React from "react";
import type { ProjectStatus } from "../../lib/status.js";

export const Journeys = ({ status }: { status: ProjectStatus }) => {
	return (
		<Box flexDirection="column">
			{Object.entries(status.journeys).map(([key, journey]) => (
				<Box
					key={key}
					flexDirection="column"
					marginBottom={1}
					borderStyle="single"
				>
					<Text bold>{journey.name}</Text>
					<Text>Actor: {journey.actor}</Text>
					<Text>Goal: {journey.goal}</Text>
					<Text>
						Scenarios: {journey.scenarioCount} ({journey.scenariosPassing}{" "}
						passing, {journey.scenariosFailing} failing)
					</Text>
				</Box>
			))}
			{Object.keys(status.journeys).length === 0 && (
				<Text>No journeys found.</Text>
			)}
		</Box>
	);
};
