import fs from "fs";
import { htmlToText } from "html-to-text";
import { Box, Text } from "ink";
import { marked } from "marked";
import path from "path";
import React, { useEffect, useState } from "react";
import { Panel } from "../components/Panel.js";

export const Actors = () => {
	const [content, setContent] = useState<string>("");
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		try {
			const actorsPath = path.join(process.cwd(), "product/actors.md");
			if (fs.existsSync(actorsPath)) {
				const rawMarkdown = fs.readFileSync(actorsPath, "utf8");
				// Use marked to parse markdown to HTML, then html-to-text to strip tags but keep structure somewhat
				// For TUI, simple text display is easier than full markdown rendering
				const html = marked.parse(rawMarkdown);
				// @ts-expect-error
				const text = htmlToText(html, {
					wordwrap: 80,
				});
				setContent(text);
			} else {
				setContent("No product/actors.md file found.");
			}
		} catch (e) {
			setContent("Error reading actors file.");
		} finally {
			setLoading(false);
		}
	}, []);

	return (
		<Box flexDirection="column">
			<Panel title="System Actors" borderColor="magenta">
				{loading ? <Text>Loading...</Text> : <Text>{content}</Text>}
			</Panel>
		</Box>
	);
};
