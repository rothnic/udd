import { useEffect, useState } from "react";
import { getProjectStatus, type ProjectStatus } from "../../lib/status.js";

export function useProjectStatus() {
	const [status, setStatus] = useState<ProjectStatus | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		let mounted = true;

		async function fetchStatus() {
			try {
				const data = await getProjectStatus();
				if (mounted) {
					setStatus(data);
					setLoading(false);
				}
			} catch (error) {
				if (mounted) {
					console.error("Failed to fetch project status:", error);
					setLoading(false);
				}
			}
		}

		fetchStatus();
		// Set up polling every 5 seconds
		const interval = setInterval(fetchStatus, 5000);

		return () => {
			mounted = false;
			clearInterval(interval);
		};
	}, []);

	return { status, loading };
}
