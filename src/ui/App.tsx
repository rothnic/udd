import React, { useState } from 'react';
import { useInput, useApp } from 'ink';
import Layout from './components/Layout.js';
import Dashboard from './screens/Dashboard.js';
import Actors from './screens/Actors.js';
import Journeys from './screens/Journeys.js';

const App: React.FC = () => {
	const [activeTab, setActiveTab] = useState<string>('dashboard');
	const { exit } = useApp();

	useInput((input, key) => {
		if (input === 'q') {
			exit();
		}
		if (input === 'd') {
			setActiveTab('dashboard');
		}
		if (input === 'a') {
			setActiveTab('actors');
		}
		if (input === 'j') {
			setActiveTab('journeys');
		}
	});

	const renderScreen = () => {
		switch (activeTab) {
			case 'dashboard':
				return <Dashboard />;
			case 'actors':
				return <Actors />;
			case 'journeys':
				return <Journeys />;
			default:
				return <Dashboard />;
		}
	};

	return (
		<Layout activeTab={activeTab}>
			{renderScreen()}
		</Layout>
	);
};

export default App;
