import React, { useState, useEffect } from 'react';
import { Box, Text } from 'ink';
import { getProjectStatus, ProjectStatus } from '../../lib/status.js';
import { theme, symbols } from '../theme.js';
import { ProgressBar } from '../components/ProgressBar.js';

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
            <Box borderStyle="single" borderColor={theme.colors.warning} padding={1}>
                <Text color={theme.colors.warning}>{symbols.warning} No journeys found.</Text>
            </Box>
        )
    }

	return (
		<Box flexDirection="column" borderStyle="round" borderColor={theme.colors.highlight} padding={1}>
			<Box marginBottom={1}>
				<Text bold color={theme.colors.highlight}> USER JOURNEYS </Text>
			</Box>

			{journeys.map((j, i) => {
                const total = j.scenarioCount;
                const percent = total > 0 ? (j.scenariosPassing / total) * 100 : 0;

                return (
                    <Box key={i} flexDirection="column" marginBottom={1} borderStyle="single" borderColor={theme.colors.dim} paddingX={1}>
                        <Box flexDirection="row" justifyContent="space-between">
                            <Text bold color={theme.colors.text}>{j.name}</Text>
                            <Box>
                                <Text color={theme.colors.success}>{symbols.check} {j.scenariosPassing} </Text>
                                <Text color={theme.colors.error}>{symbols.cross} {j.scenariosFailing} </Text>
                                <Text color={theme.colors.warning}>? {j.scenariosMissing}</Text>
                            </Box>
                        </Box>
                        <Box flexDirection="row" justifyContent="space-between" marginTop={0}>
                             <Text italic color={theme.colors.dim} wrap="truncate" maxWidth={50}>{j.goal}</Text>
                             <ProgressBar percent={percent} width={15} />
                        </Box>
                    </Box>
                );
            })}
		</Box>
	);
};
