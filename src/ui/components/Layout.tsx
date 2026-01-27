import { Box } from "ink";
import type React from "react";

type LayoutProps = {
	children: React.ReactNode;
};

export const Layout = ({ children }: LayoutProps) => {
	return (
		<Box
			flexDirection="column"
			padding={1}
			borderStyle="round"
			borderColor="cyan"
			minHeight={20}
		>
			{children}
		</Box>
	);
};
