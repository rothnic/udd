import React, { useState } from 'react';
import { useInput, useApp } from 'ink';
import { Layout } from './components/Layout.js';
import { Dashboard } from './screens/Dashboard.js';
import { Journeys } from './screens/Journeys.js';
import { Inbox } from './screens/Inbox.js';
import { Help } from './screens/Help.js';

export const App = () => {
	const { exit } = useApp();
	const [activeTab, setActiveTab] = useState('dashboard');

	useInput((input) => {
		if (input === '1') setActiveTab('dashboard');
		if (input === '2') setActiveTab('journeys');
		if (input === '3') setActiveTab('inbox');
		if (input === '4') setActiveTab('help');
		if (input === 'q') exit();
	});

	return (
		<Layout activeTab={activeTab}>
			{activeTab === 'dashboard' && <Dashboard />}
			{activeTab === 'journeys' && <Journeys />}
			{activeTab === 'inbox' && <Inbox />}
			{activeTab === 'help' && <Help />}
		</Layout>
	);
};
