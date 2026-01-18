import React from 'react';
import { Box, Text } from 'ink';
import Gradient from 'ink-gradient';
import BigText from 'ink-big-text';

export const Header = () => (
	<Box flexDirection="column" alignItems="center" marginBottom={1}>
		<Gradient name="retro">
			<BigText text="UDD" font="block" align="center" height={5} />
		</Gradient>
        <Text color="gray" italic>User Driven Development CLI</Text>
	</Box>
);
