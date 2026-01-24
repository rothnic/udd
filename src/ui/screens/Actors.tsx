import fs from "node:fs";
import path from "node:path";
import { htmlToText } from "html-to-text";
import { Box, Text } from "ink";
import { marked } from "marked";
import { useEffect, useState } from "react";

const Actors = () => {
	const [content, setContent] = useState<string>("Loading...");
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const loadActors = async () => {
			try {
				const actorsPath = path.join(process.cwd(), "product/actors.md");
				try {
					const markdown = await fs.promises.readFile(actorsPath, "utf-8");
					const html = await marked(markdown);
					const text = htmlToText(html, {
						wordwrap: 80,
					});
					setContent(text);
				} catch (readError: any) {
					if (readError.code === "ENOENT") {
						setContent(
							'No product/actors.md found. Run "udd init" or create the file.',
						);
					} else {
						throw readError;
					}
				}
			} catch (e: unknown) {
				if (e instanceof Error) {
					setError(e.message);
				} else {
					setError(String(e));
				}
			}
		};

		loadActors();
	}, []);

	if (error) {
		return <Text color="red">Error loading actors: {error}</Text>;
	}

	return (
		<Box flexDirection="column">
			<Text bold underline>
				Actors & Personas
			</Text>
			<Box marginTop={1}>
				<Text>{content}</Text>
			</Box>
		</Box>
	);
};

export default Actors;
