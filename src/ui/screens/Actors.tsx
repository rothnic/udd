import fs from "node:fs/promises";
import path from "node:path";
import { htmlToText } from "html-to-text";
import { Box, Text } from "ink";
import { marked } from "marked";
import { useEffect, useState } from "react";

export const Actors = () => {
	const [content, setContent] = useState<string>("");
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const loadActors = async () => {
			try {
				const actorsPath = path.join(process.cwd(), "product/actors.md");
				const md = await fs.readFile(actorsPath, "utf-8");
				const html = await marked.parse(md);
				const text = htmlToText(html, {
					wordwrap: 80,
					selectors: [
						{
							selector: "h1",
							format: "uppercase",
							options: { leadingLineBreaks: 1, trailingLineBreaks: 1 },
						},
						{
							selector: "h2",
							options: { leadingLineBreaks: 2, trailingLineBreaks: 1 },
						},
					],
				});
				setContent(text);
			} catch (e: unknown) {
				const err = e as { code?: string; message: string };
				if (err.code === "ENOENT") {
					setContent(
						"No actors defined. Create product/actors.md to define them.",
					);
				} else {
					setContent(`Error loading actors: ${err.message}`);
				}
			} finally {
				setLoading(false);
			}
		};
		loadActors();
	}, []);

	if (loading) return <Text>Loading actors...</Text>;

	return (
		<Box flexDirection="column">
			<Text>{content}</Text>
		</Box>
	);
};
