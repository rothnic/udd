import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import { Header } from './components/Header.js';
import { Dashboard } from './screens/Dashboard.js';
import { Actors } from './screens/Actors.js';
import { Journeys } from './screens/Journeys.js';

type Tab = 'dashboard' | 'actors' | 'journeys';

export const App = () => {
	const [activeTab, setActiveTab] = useState<Tab>('dashboard');

	useInput((input) => {
		if (input === 'd') setActiveTab('dashboard');
		if (input === 'a') setActiveTab('actors');
		if (input === 'j') setActiveTab('journeys');
	});

	return (
		<Box flexDirection="column" padding={1} width="100%">
			<Header />

			<Box flexDirection="row" marginBottom={1} borderStyle="single" borderColor="gray">
				<Box marginRight={2}>
					<Text inverse={activeTab === 'dashboard'} color={activeTab === 'dashboard' ? 'cyan' : 'white'}> [D]ashboard </Text>
				</Box>
				<Box marginRight={2}>
					<Text inverse={activeTab === 'actors'} color={activeTab === 'actors' ? 'magenta' : 'white'}> [A]ctors </Text>
				</Box>
				<Box>
					<Text inverse={activeTab === 'journeys'} color={activeTab === 'journeys' ? 'blue' : 'white'}> [J]ourneys </Text>
				</Box>
			</Box>

			<Box minHeight={15}>
				{activeTab === 'dashboard' && <Dashboard />}
				{activeTab === 'actors' && <Actors />}
				{activeTab === 'journeys' && <Journeys />}
			</Box>

			<Box marginTop={1} borderStyle="single" borderColor="gray">
				<Text color="gray">Press key to switch tabs | Ctrl+C to exit</Text>
			</Box>
		</Box>
	);
};
