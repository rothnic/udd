import { Box, Text } from "ink";
import type React from "react";

type Props = {
	title: string;
	children: React.ReactNode;
	borderColor?: string;
};

export const Panel = ({ title, children, borderColor = "gray" }: Props) => {
	return (
		<Box
			flexDirection="column"
			borderStyle="round"
			borderColor={borderColor}
			padding={1}
			marginBottom={1}
		>
			<Box marginTop={-2} marginLeft={1}>
				<Text bold backgroundColor="black" color={borderColor}>
					{" "}
					{title}{" "}
				</Text>
			</Box>
			<Box flexDirection="column" marginTop={0}>
				{children}
			</Box>
		</Box>
	);
};
