import { Box, Text } from "ink";
import type React from "react";
import { theme } from "../theme.js";

interface TabBarProps {
	tabs: string[];
	activeTab: string;
}

export const TabBar: React.FC<TabBarProps> = ({ tabs, activeTab }) => {
	return (
		<Box
			flexDirection="row"
			borderStyle="single"
			borderColor={theme.colors.dim}
			paddingX={1}
		>
			{tabs.map((tab, index) => {
				const isActive = tab === activeTab;
				return (
					<Box key={tab} marginRight={2}>
						<Text
							color={isActive ? theme.colors.primary : theme.colors.dim}
							bold={isActive}
							underline={isActive}
						>
							{index + 1}. {tab.charAt(0).toUpperCase() + tab.slice(1)}
						</Text>
					</Box>
				);
			})}
		</Box>
	);
};
