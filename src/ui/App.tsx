import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import { Header } from './components/Header.js';
import { TabBar } from './components/TabBar.js';
import { Dashboard } from './screens/Dashboard.js';
import { Actors } from './screens/Actors.js';
import { Journeys } from './screens/Journeys.js';
import { theme } from './theme.js';

type TabId = 'dashboard' | 'actors' | 'journeys';

const TABS = [
    { id: 'dashboard', label: 'Dashboard', key: 'D' },
    { id: 'actors', label: 'Actors', key: 'A' },
    { id: 'journeys', label: 'Journeys', key: 'J' },
];

export const App = () => {
	const [activeTab, setActiveTab] = useState<TabId>('dashboard');

	useInput((input) => {
        const key = input.toLowerCase();
		if (key === 'd') setActiveTab('dashboard');
		if (key === 'a') setActiveTab('actors');
		if (key === 'j') setActiveTab('journeys');
        // Hidden shortcuts or easter eggs could go here for "nerdy" feel
        // e.g. 'h' for help, 'q' for quit (handled by ink usually)
	});

	return (
		<Box flexDirection="column" padding={1} width="100%">
			<Header />

            <TabBar tabs={TABS} activeTab={activeTab} />

			<Box minHeight={15} marginTop={1}>
				{activeTab === 'dashboard' && <Dashboard />}
				{activeTab === 'actors' && <Actors />}
				{activeTab === 'journeys' && <Journeys />}
			</Box>

			<Box marginTop={1} borderStyle="single" borderColor={theme.colors.dim} paddingX={1}>
				<Text color={theme.colors.dim}>
                    Keys: <Text bold color={theme.colors.text}>[D]</Text>ashboard  <Text bold color={theme.colors.text}>[A]</Text>ctors  <Text bold color={theme.colors.text}>[J]</Text>ourneys  |  <Text bold color={theme.colors.text}>Ctrl+C</Text> Exit
                </Text>
			</Box>
		</Box>
	);
};
