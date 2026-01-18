import React, { useState, useEffect } from 'react';
import { Box, Text } from 'ink';
import { getProjectStatus, ProjectStatus } from '../../lib/status.js';

export const Journeys = () => {
	const [status, setStatus] = useState<ProjectStatus | null>(null);

	useEffect(() => {
		const load = async () => {
			const data = await getProjectStatus();
			setStatus(data);
		};
		load();
	}, []);

	if (!status) return <Text>Loading journeys...</Text>;

    const journeys = Object.values(status.journeys);

    if (journeys.length === 0) {
        return (
            <Box borderStyle="single" borderColor="yellow" padding={1}>
                <Text color="yellow">No journeys found.</Text>
            </Box>
        )
    }

	return (
		<Box flexDirection="column" borderStyle="round" borderColor="blue" padding={1}>
			<Box marginBottom={1}>
				<Text bold underline color="blue">User Journeys</Text>
			</Box>

			{journeys.map((j, i) => (
				<Box key={i} flexDirection="column" marginBottom={1} borderStyle="single" borderColor="gray" paddingX={1}>
					<Box flexDirection="row" justifyContent="space-between">
						<Text bold>{j.name}</Text>
						<Text>
                            <Text color="green">✓ {j.scenariosPassing}</Text> |
                            <Text color="red"> ✗ {j.scenariosFailing}</Text> |
                            <Text color="yellow"> ? {j.scenariosMissing}</Text>
                        </Text>
					</Box>
                    <Box marginLeft={2}>
                        <Text italic dimColor>Goal: {j.goal}</Text>
                    </Box>
				</Box>
			))}
		</Box>
	);
};
