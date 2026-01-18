import React, { useState, useEffect } from 'react';
import { Box, Text } from 'ink';
import { getProjectStatus, ProjectStatus } from '../../lib/status.js';
import Spinner from 'ink-spinner';
import { theme } from '../theme.js';
import { ProgressBar } from '../components/ProgressBar.js';

export const Dashboard = () => {
	const [status, setStatus] = useState<ProjectStatus | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const loadStatus = async () => {
			try {
				const data = await getProjectStatus();
				setStatus(data);
			} catch (error) {
				console.error(error);
			} finally {
				setLoading(false);
			}
		};
		loadStatus();
	}, []);

	if (loading) {
		return (
			<Box>
				<Text color={theme.colors.success}>
					<Spinner type="dots" /> Loading project status...
				</Text>
			</Box>
		);
	}

	if (!status) {
		return <Text color={theme.colors.error}>Failed to load status.</Text>;
	}

    // Calculations
	const journeyCount = Object.keys(status.journeys).length;
	let totalScenarios = 0;
	let passingScenarios = 0;

	for (const journey of Object.values(status.journeys)) {
		totalScenarios += journey.scenarioCount;
		passingScenarios += journey.scenariosPassing;
	}

    const passRate = totalScenarios > 0 ? Math.round((passingScenarios / totalScenarios) * 100) : 0;

	return (
		<Box flexDirection="column" borderStyle="round" borderColor={theme.colors.primary} padding={1}>
			<Box marginBottom={1}>
				<Text bold color={theme.colors.primary}> SYSTEM STATUS </Text>
			</Box>

			<Box flexDirection="row" gap={4}>
                {/* Metrics Column */}
				<Box flexDirection="column" borderStyle="single" borderColor={theme.colors.dim} padding={1} minWidth={30}>
                    <Text underline color={theme.colors.secondary}>Metrics</Text>
					<Box justifyContent="space-between">
                        <Text>Journeys:</Text>
                        <Text bold color={theme.colors.highlight}>{journeyCount}</Text>
                    </Box>
                    <Box justifyContent="space-between">
                        <Text>Features:</Text>
                        <Text bold color={theme.colors.highlight}>{Object.keys(status.features).length}</Text>
                    </Box>
                    <Box justifyContent="space-between">
                        <Text>Scenarios:</Text>
                        <Text bold color={theme.colors.highlight}>{totalScenarios}</Text>
                    </Box>
				</Box>

                {/* Health Column */}
				<Box flexDirection="column" borderStyle="single" borderColor={theme.colors.dim} padding={1} minWidth={40}>
                     <Text underline color={theme.colors.success}>System Health</Text>
                     <Box marginTop={1}>
                        <Text>Test Coverage: {passRate}%</Text>
                     </Box>
                     <ProgressBar percent={passRate} width={30} />
                     <Box marginTop={1}>
                        <Text dimColor>Phase: {status.current_phase}</Text>
                        <Text dimColor>Branch: {status.git.branch}</Text>
                     </Box>
				</Box>
			</Box>

            {status.hasProductDir && (
                <Box marginTop={1}>
                    <Text italic color={theme.colors.dim}>[V2 Model Active]</Text>
                </Box>
            )}
		</Box>
	);
};
