import fs from "node:fs/promises";
import path from "node:path";
import { Box, Text } from "ink";
import { useEffect, useState } from "react";

export const Journeys = () => {
	const [journeys, setJourneys] = useState<string[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const loadJourneys = async () => {
			try {
				const journeysDir = path.join(process.cwd(), "product/journeys");
				const files = await fs.readdir(journeysDir);
				setJourneys(
					files.filter((f) => f.endsWith(".md") && !f.startsWith("_")),
				);
			} catch (e: unknown) {
				const err = e as { code?: string; message: string };
				if (err.code === "ENOENT") {
					// directory doesn't exist, just empty list
				} else {
					setError(err.message);
				}
			} finally {
				setLoading(false);
			}
		};
		loadJourneys();
	}, []);

	if (loading) return <Text>Loading journeys...</Text>;

	if (error) return <Text color="red">Error: {error}</Text>;

	if (journeys.length === 0) {
		return <Text>No journeys found in product/journeys/.</Text>;
	}

	return (
		<Box flexDirection="column">
			<Text bold underline>
				Journeys
			</Text>
			<Box flexDirection="column" marginTop={1}>
				{journeys.map((j) => (
					<Text key={j}>• {j.replace(".md", "").replace(/_/g, " ")}</Text>
				))}
			</Box>
		</Box>
	);
};
