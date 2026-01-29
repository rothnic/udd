import { useEffect, useState } from "react";
import { getProjectStatus, type ProjectStatus } from "../../lib/status.js";

export function useProjectStatus() {
	const [status, setStatus] = useState<ProjectStatus | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);

	useEffect(() => {
		let mounted = true;
		async function fetchStatus() {
			try {
				const data = await getProjectStatus();
				if (mounted) {
					setStatus(data);
				}
			} catch (err) {
				if (mounted) {
					setError(err instanceof Error ? err : new Error(String(err)));
				}
			} finally {
				if (mounted) {
					setLoading(false);
				}
			}
		}
		fetchStatus();
		return () => {
			mounted = false;
		};
	}, []);

	return { status, loading, error };
}
