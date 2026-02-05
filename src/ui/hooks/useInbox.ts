import fs from "node:fs/promises";
import path from "node:path";
import { useEffect, useState } from "react";
import yaml from "yaml";

export function useInbox() {
	// biome-ignore lint/suspicious/noExplicitAny: inbox items are loosely defined
	const [items, setItems] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchInbox = async () => {
			try {
				const content = await fs.readFile(
					path.join(process.cwd(), "specs/inbox.yml"),
					"utf-8",
				);
				const parsed = yaml.parse(content);
				setItems(Array.isArray(parsed) ? parsed : []);
				setLoading(false);
			} catch (_e) {
				// file might not exist
				setItems([]);
				setLoading(false);
			}
		};
		fetchInbox();
	}, []);

	return { items, loading };
}
