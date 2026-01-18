// src/ui/components/ProgressBar.tsx
import React from 'react';
import { Box, Text } from 'ink';
import { theme } from '../theme.js';

interface ProgressBarProps {
	percent: number; // 0 to 100
	width?: number;
	color?: string;
}

export const ProgressBar = ({ percent, width = 20, color = theme.colors.success }: ProgressBarProps) => {
	const completed = Math.floor((percent / 100) * width);
	const remaining = width - completed;

	const filledChar = '█';
	const emptyChar = '░';

	return (
		<Text>
			<Text color={color}>{filledChar.repeat(completed)}</Text>
			<Text color={theme.colors.dim}>{emptyChar.repeat(remaining)}</Text>
		</Text>
	);
};
