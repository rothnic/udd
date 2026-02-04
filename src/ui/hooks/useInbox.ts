import fs from "node:fs/promises";
import path from "node:path";
import { useEffect, useState } from "react";
import yaml from "yaml";

export interface InboxItem {
	id: string;
	title: string;
	description: string;
	research?: string;
	created: string;
}

export function useInbox() {
	const [items, setItems] = useState<InboxItem[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);

	useEffect(() => {
		async function loadInbox() {
			try {
				const content = await fs.readFile(
					path.join(process.cwd(), "specs/inbox.yml"),
					"utf-8",
				);
				const data = yaml.parse(content);
				setItems(data.items || []);
				setLoading(false);
			} catch (err) {
				setError(err as Error);
				setLoading(false);
			}
		}
		loadInbox();
	}, []);

	return { items, loading, error };
}
