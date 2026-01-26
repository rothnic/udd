import React from 'react';
import { Box, Text } from 'ink';
import Gradient from 'ink-gradient';
import BigText from 'ink-big-text';

interface LayoutProps {
	children: React.ReactNode;
	activeTab: string;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab }) => {
	return (
		<Box flexDirection="column" padding={1}>
			<Box marginBottom={1}>
				<Gradient name="pastel">
					<BigText text="UDD" font="block" />
				</Gradient>
			</Box>
			<Box marginBottom={1}>
				<Text>
					<Text color={activeTab === 'dashboard' ? 'green' : 'gray'}>[d] Dashboard</Text>
					{' | '}
					<Text color={activeTab === 'actors' ? 'green' : 'gray'}>[a] Actors</Text>
					{' | '}
					<Text color={activeTab === 'journeys' ? 'green' : 'gray'}>[j] Journeys</Text>
					{' | '}
					<Text color="gray">[q] Quit</Text>
				</Text>
			</Box>
			<Box borderStyle="single" padding={1} borderColor="gray">
				{children}
			</Box>
		</Box>
	);
};

export default Layout;
