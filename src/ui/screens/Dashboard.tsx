import React from 'react';
import { Box, Text } from 'ink';

const Dashboard: React.FC = () => {
	return (
		<Box flexDirection="column">
			<Text bold>Welcome to User Driven Development</Text>
			<Box marginTop={1}>
				<Text>Press tabs to navigate.</Text>
			</Box>
		</Box>
	);
};

export default Dashboard;
