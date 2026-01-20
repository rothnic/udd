import { Box, Text } from "ink";
import type React from "react";
import { theme } from "../theme.js";

interface LayoutProps {
	children: React.ReactNode;
	title?: string;
}

export const Layout: React.FC<LayoutProps> = ({ children, title }) => {
	return (
		<Box flexDirection="column" padding={1}>
			{title && (
				<Box
					borderStyle="round"
					borderColor={theme.colors.primary}
					paddingX={1}
				>
					<Text color={theme.colors.primary} bold>
						{title}
					</Text>
				</Box>
			)}
			<Box flexDirection="column" marginTop={1}>
				{children}
			</Box>
			<Box marginTop={1} borderStyle="single" borderColor={theme.colors.dim}>
				<Text color={theme.colors.dim}>Use arrows to navigate • q to quit</Text>
			</Box>
		</Box>
	);
};
