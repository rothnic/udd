import React, { useState, useEffect } from 'react';
import { Box } from 'ink';
import fs from 'node:fs/promises';
import path from 'node:path';
import Markdown from 'ink-markdown';

const Actors: React.FC = () => {
	const [content, setContent] = useState<string>('Loading actors...');

	useEffect(() => {
		const loadActors = async () => {
			try {
				const actorsPath = path.join(process.cwd(), 'product', 'actors.md');
				const fileContent = await fs.readFile(actorsPath, 'utf-8');
				setContent(fileContent);
			} catch (error) {
				setContent('Error loading actors.md. Make sure product/actors.md exists.');
			}
		};

		loadActors();
	}, []);

	return (
		<Box flexDirection="column">
			<Markdown>{content}</Markdown>
		</Box>
	);
};

export default Actors;
