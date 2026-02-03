import fs from "node:fs/promises";
import path from "node:path";
import { Box, Text } from "ink";
import type React from "react";
import { useEffect, useState } from "react";
import yaml from "yaml";

interface InboxItem {
	id: string;
	title: string;
	description: string;
	created: string;
}

export const Inbox: React.FC = () => {
	const [items, setItems] = useState<InboxItem[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		let mounted = true;
		async function loadInbox() {
			try {
				const content = await fs.readFile(
					path.join(process.cwd(), "specs/inbox.yml"),
					"utf-8",
				);
				const data = yaml.parse(content);
				if (mounted) {
					setItems(data.items || []);
				}
			} catch (e) {
				// Ignore or show empty
				if (mounted) setItems([]);
			} finally {
				if (mounted) setLoading(false);
			}
		}
		loadInbox();
		return () => {
			mounted = false;
		};
	}, []);

	if (loading) return <Text>Loading inbox...</Text>;

	return (
		<Box flexDirection="column" gap={1}>
			<Text bold underline>
				Inbox
			</Text>
			{items.length === 0 ? (
				<Text italic>Inbox is empty.</Text>
			) : (
				items.map((item) => (
					<Box
						key={item.id}
						flexDirection="column"
						borderStyle="single"
						borderColor="yellow"
						padding={1}
					>
						<Text bold>{item.title}</Text>
						<Text>{item.description}</Text>
						<Text color="dim">{item.created}</Text>
					</Box>
				))
			)}
		</Box>
	);
};
