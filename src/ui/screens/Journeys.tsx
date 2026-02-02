import React from 'react';
import { Box, Text } from 'ink';
import { ProjectStatus } from '../../lib/status.js';

interface JourneysProps {
    status: ProjectStatus;
}

export function Journeys({ status }: JourneysProps) {
    const journeys = Object.entries(status.journeys);

    if (journeys.length === 0) {
        return <Text>No journeys found. Add them in product/journeys/.</Text>;
    }

    return (
        <Box flexDirection="column">
            <Text bold underline>Journeys</Text>
            {journeys.map(([id, journey]) => (
                <Box key={id} flexDirection="column" marginTop={1} borderStyle="round" padding={1} borderColor={journey.scenariosFailing > 0 ? 'red' : 'green'}>
                    <Text bold>{journey.name}</Text>
                    <Text italic>Actor: {journey.actor}</Text>
                    <Text>Goal: {journey.goal}</Text>
                    <Box marginTop={0}>
                         <Text color="green">✔ {journey.scenariosPassing}</Text>
                         <Text> | </Text>
                         <Text color="red">✘ {journey.scenariosFailing}</Text>
                         <Text> | </Text>
                         <Text color="yellow">? {journey.scenariosMissing}</Text>
                    </Box>
                </Box>
            ))}
        </Box>
    );
}
