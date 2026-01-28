import { useEffect, useState } from "react";
import { getProjectStatus, type ProjectStatus } from "../../lib/status.js";

export function useProjectStatus() {
	const [status, setStatus] = useState<ProjectStatus | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);

	useEffect(() => {
		async function fetchStatus() {
			try {
				const data = await getProjectStatus();
				setStatus(data);
			} catch (err) {
				setError(err instanceof Error ? err : new Error("Unknown error"));
			} finally {
				setLoading(false);
			}
		}

		fetchStatus();
	}, []);

	return { status, loading, error };
}
