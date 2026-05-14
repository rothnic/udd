import { useEffect, useState } from "react";
import { getProjectStatus, type ProjectStatus } from "../../lib/status.js";

export function useProjectStatus() {
	const [status, setStatus] = useState<ProjectStatus | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		let mounted = true;

		const fetchStatus = async () => {
			try {
				const data = await getProjectStatus();
				if (mounted) {
					setStatus(data);
					setLoading(false);
				}
			} catch (error) {
				console.error("Failed to fetch status", error);
				if (mounted) setLoading(false);
			}
		};

		fetchStatus();

		return () => {
			mounted = false;
		};
	}, []);

	return { status, loading };
}
