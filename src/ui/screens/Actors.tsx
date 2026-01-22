import fs from "node:fs/promises";
import path from "node:path";
import { convert } from "html-to-text";
import { Box, Text } from "ink";
import { marked } from "marked";
import React, { useEffect, useState } from "react";

export const Actors = () => {
	const [content, setContent] = useState<string>("");

	useEffect(() => {
		const loadActors = async () => {
			try {
				const text = await fs.readFile(
					path.join(process.cwd(), "product/actors.md"),
					"utf-8",
				);
				const html = await marked.parse(text);
				const formatted = convert(html, { wordwrap: 80 });
				setContent(formatted);
			} catch (e) {
				setContent("Could not load product/actors.md. Does it exist?");
			}
		};
		loadActors();
	}, []);

	return (
		<Box flexDirection="column">
			<Text>{content}</Text>
		</Box>
	);
};
