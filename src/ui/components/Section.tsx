import { Box, Text } from "ink";
import type React from "react";

type Props = {
	title: string;
	children: React.ReactNode;
};

export const Section = ({ title, children }: Props) => {
	return (
		<Box flexDirection="column" marginBottom={1}>
			<Text underline bold>
				{title}
			</Text>
			<Box flexDirection="column" paddingLeft={1} marginTop={0}>
				{children}
			</Box>
		</Box>
	);
};
