import React from 'react';
import { Box, Text } from 'ink';
import { theme } from '../theme.js';

interface TabBarProps {
	tabs: { id: string; label: string; key: string }[];
	activeTab: string;
}

export const TabBar = ({ tabs, activeTab }: TabBarProps) => {
	return (
		<Box flexDirection="row" borderStyle="single" borderColor={theme.colors.dim} paddingX={1}>
			{tabs.map((tab, index) => {
				const isActive = tab.id === activeTab;
				return (
					<Box key={tab.id} marginRight={2}>
						<Text
							color={isActive ? theme.colors.primary : theme.colors.dim}
							bold={isActive}
                            inverse={isActive}
						>
							{` [${tab.key}] ${tab.label} `}
						</Text>
					</Box>
				);
			})}
            <Box flexGrow={1} />
		</Box>
	);
};
