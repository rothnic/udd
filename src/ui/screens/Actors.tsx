import React, { useState, useEffect } from 'react';
import { Box, Text } from 'ink';
import { getActors, Actor } from '../../lib/actors.js';

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
			<Box borderStyle="single" borderColor="yellow" padding={1}>
				<Text color="yellow">No actors found in product/actors.md</Text>
			</Box>
		);
	}

	return (
		<Box flexDirection="column" borderStyle="round" borderColor="magenta" padding={1}>
			<Box marginBottom={1}>
				<Text bold underline color="magenta">System Actors (Personas)</Text>
			</Box>

			<Box flexDirection="row" flexWrap="wrap" gap={2}>
				{actors.map((actor, i) => (
					<Box key={i} borderStyle="double" borderColor="cyan" padding={1} flexDirection="column" width={30}>
						<Text bold color="cyan">{actor.name}</Text>
						<Text>{actor.description}</Text>
					</Box>
				))}
			</Box>
		</Box>
	);
};
