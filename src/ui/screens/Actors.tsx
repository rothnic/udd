import fs from "node:fs/promises";
import { htmlToText } from "html-to-text";
import { Box, Text } from "ink";
import { marked } from "marked";
import React, { useEffect, useState } from "react";
import { Panel } from "../components/Panel.js";

export function Actors() {
	const [content, setContent] = useState<string>("");
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		async function load() {
			try {
				const text = await fs.readFile("product/actors.md", "utf-8");
				const html = await marked.parse(text);
				const formatted = htmlToText(html, {
					wordwrap: 80,
				});
				setContent(formatted);
			} catch (e: any) {
				if (e.code === "ENOENT") {
					setError(
						"product/actors.md not found. Run `udd init` or create it manually.",
					);
				} else {
					setError(e.message);
				}
			}
		}
		load();
	}, []);

	if (error) {
		return (
			<Panel title="Actors" borderColor="red">
				<Text color="red">{error}</Text>
			</Panel>
		);
	}

	return (
		<Panel title="Actors" height="100%">
			<Text>{content}</Text>
		</Panel>
	);
}
