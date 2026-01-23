import { Box, Text } from "ink";
import type React from "react";

type Props = {
	children: React.ReactNode;
	title?: string;
	borderColor?: string;
	flexGrow?: number;
	height?: number | string;
};

export function Panel({
	children,
	title,
	borderColor = "gray",
	flexGrow,
	height,
}: Props) {
	return (
		<Box
			borderStyle="round"
			borderColor={borderColor}
			flexDirection="column"
			paddingX={1}
			flexGrow={flexGrow}
			height={height}
		>
			{title && (
				<Box marginTop={-1} marginLeft={1}>
					<Text bold color={borderColor}>
						{" "}
						{title}{" "}
					</Text>
				</Box>
			)}
			<Box flexDirection="column">{children}</Box>
		</Box>
	);
}
