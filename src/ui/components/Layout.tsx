import { Box, Text } from "ink";
import BigText from "ink-big-text";
import Gradient from "ink-gradient";
import type React from "react";

type Props = {
	children: React.ReactNode;
	title?: string;
};

export function Layout({ children, title }: Props) {
	return (
		<Box flexDirection="column" padding={1} height="100%">
			<Box marginBottom={1}>
				<Gradient name="morning">
					<BigText text="UDD" font="block" colors={["cyan", "magenta"]} />
				</Gradient>
			</Box>
			{title && (
				<Box marginBottom={1}>
					<Text bold color="green">
						{title}
					</Text>
				</Box>
			)}
			<Box flexGrow={1} flexDirection="column">
				{children}
			</Box>
		</Box>
	);
}
