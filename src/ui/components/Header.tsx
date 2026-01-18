import { Box } from "ink";
import BigText from "ink-big-text";
import Gradient from "ink-gradient";
import React from "react";

export const Header = () => (
	<Box flexDirection="column" alignItems="center" marginBottom={1}>
		<Gradient name="morning">
			<BigText text="UDD" font="block" align="center" />
		</Gradient>
	</Box>
);
