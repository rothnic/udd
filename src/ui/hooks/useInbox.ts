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
	const [error, _setError] = useState<Error | null>(null);

	useEffect(() => {
		let mounted = true;
		async function fetchInbox() {
			try {
				const content = await fs.readFile(
					path.join(process.cwd(), "specs/inbox.yml"),
					"utf-8",
				);
				const parsed = yaml.parse(content) as { items: InboxItem[] };
				if (mounted) {
					setItems(parsed.items || []);
				}
			} catch (err) {
				// If file doesn't exist or error, return empty or handle
				if (mounted) {
					console.error("Error loading inbox:", err);
					setItems([]);
				}
			} finally {
				if (mounted) {
					setLoading(false);
				}
			}
		}
		fetchInbox();
		return () => {
			mounted = false;
		};
	}, []);

	return { items, loading, error };
}
