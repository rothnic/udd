import { Box, Text } from "ink";
import Spinner from "ink-spinner";
import type React from "react";
import { useEffect, useState } from "react";
import { getProjectStatus, type ProjectStatus } from "../../lib/status.js";
import { Layout } from "../components/Layout.js";
import { theme } from "../theme.js";

export const Journeys: React.FC = () => {
	const [status, setStatus] = useState<ProjectStatus | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		getProjectStatus().then((s) => {
			setStatus(s);
			setLoading(false);
		});
	}, []);

	if (loading) {
		return (
			<Layout title="Journeys">
				<Text color="green">
					<Spinner type="dots" /> Loading...
				</Text>
			</Layout>
		);
	}

	if (!status) return null;

	const journeys = Object.values(status.journeys);

	return (
		<Layout title="Journeys">
			{journeys.length === 0 ? (
				<Text color={theme.colors.dim}>No journeys found.</Text>
			) : (
				journeys.map((journey) => (
					<Box
						key={journey.name}
						flexDirection="column"
						marginBottom={1}
						borderStyle="single"
						borderColor={theme.colors.dim}
						padding={1}
					>
						<Box justifyContent="space-between">
							<Text bold color={theme.colors.secondary}>
								{journey.name}
							</Text>
							<Text color={theme.colors.dim}>{journey.actor}</Text>
						</Box>
						<Text italic>{journey.goal}</Text>
						<Box marginTop={1}>
							<Text color={theme.colors.success}>
								Passing: {journey.scenariosPassing}
							</Text>
							<Text> | </Text>
							<Text color={theme.colors.error}>
								Failing: {journey.scenariosFailing}
							</Text>
							<Text> | </Text>
							<Text color={theme.colors.warning}>
								Missing: {journey.scenariosMissing}
							</Text>
						</Box>
					</Box>
				))
			)}
		</Layout>
	);
};
