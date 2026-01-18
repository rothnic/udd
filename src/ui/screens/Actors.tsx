import React, { useState, useEffect } from 'react';
import { Box, Text } from 'ink';
import { getActors, Actor } from '../../lib/actors.js';
import { theme } from '../theme.js';

export const Actors = () => {
	const [actors, setActors] = useState<Actor[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const load = async () => {
			const data = await getActors();
			setActors(data);
			setLoading(false);
		};
		load();
	}, []);

	if (loading) return <Text>Loading actors...</Text>;

	if (actors.length === 0) {
		return (
			<Box borderStyle="single" borderColor={theme.colors.warning} padding={1}>
				<Text color={theme.colors.warning}>No actors found in product/actors.md</Text>
			</Box>
		);
	}

	return (
		<Box flexDirection="column" borderStyle="round" borderColor={theme.colors.secondary} padding={1}>
			<Box marginBottom={1}>
				<Text bold color={theme.colors.secondary}> SYSTEM ACTORS </Text>
			</Box>

			<Box flexDirection="row" flexWrap="wrap" gap={2}>
				{actors.map((actor, i) => (
					<Box key={i} borderStyle="double" borderColor={theme.colors.primary} padding={1} flexDirection="column" width={34}>
						<Text bold color={theme.colors.primary} underline>{actor.name}</Text>
                        <Box marginTop={1}>
						    <Text color={theme.colors.text}>{actor.description}</Text>
                        </Box>
					</Box>
				))}
			</Box>
		</Box>
	);
};
