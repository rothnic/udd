// src/ui/components/Badge.tsx
import React from 'react';
import { Box, Text } from 'ink';

interface BadgeProps {
	children: React.ReactNode;
	color?: string;
}

export const Badge = ({ children, color = 'blue' }: BadgeProps) => (
	<Box borderStyle="single" borderColor={color} paddingX={1}>
		<Text color={color} bold>{children}</Text>
	</Box>
);
