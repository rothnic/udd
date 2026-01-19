import fs from "node:fs/promises";
import path from "node:path";
import { Box, Text } from "ink";
import { useEffect, useState } from "react";
import { theme } from "../theme.js";

interface Actor {
	name: string;
	description: string;
}

export const Actors = () => {
	const [actors, setActors] = useState<Actor[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const loadActors = async () => {
			try {
				const content = await fs.readFile(
					path.join(process.cwd(), "product/actors.md"),
					"utf-8",
				);
				const parsedActors: Actor[] = [];
				// Improved parsing logic
				const lines = content.split("\n");
				let currentActor: Partial<Actor> | null = null;

				for (const line of lines) {
					const trimmedLine = line.trim();
					if (line.startsWith("## ")) {
						if (currentActor?.name) {
							parsedActors.push(currentActor as Actor);
						}
						currentActor = {
							name: line.replace(/^##\s+/, "").trim(),
							description: "",
						};
					} else if (
						currentActor &&
						trimmedLine &&
						!trimmedLine.startsWith("#")
					) {
						// Append line to description, handling spacing
						currentActor.description = currentActor.description
							? `${currentActor.description} ${trimmedLine}`
							: trimmedLine;
					}
				}
				if (currentActor?.name) {
					parsedActors.push(currentActor as Actor);
				}
				setActors(parsedActors);
			} catch (_e) {
				// actors.md might not exist
			} finally {
				setLoading(false);
			}
		};
		loadActors();
	}, []);

	if (loading) {
		return <Text>Loading actors...</Text>;
	}

	if (actors.length === 0) {
		return (
			<Text color={theme.colors.warning}>
				No actors found in product/actors.md
			</Text>
		);
	}

	return (
		<Box flexDirection="column">
			<Box marginBottom={1}>
				<Text bold>Actors</Text>
			</Box>
			{actors.map((actor, _i) => (
				<Box
					key={actor.name}
					flexDirection="column"
					marginBottom={1}
					borderStyle="single"
					borderColor={theme.colors.dim}
					paddingX={1}
				>
					<Text color={theme.colors.primary} bold>
						{actor.name}
					</Text>
					<Text>{actor.description}</Text>
				</Box>
			))}
		</Box>
	);
};
