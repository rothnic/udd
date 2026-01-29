import { Box, Text } from "ink";
import { LoadingSpinner } from "../components/Spinner.js";
import { useProjectStatus } from "../hooks/useProjectStatus.js";

export const Journeys = () => {
	const { status, loading, error } = useProjectStatus();

	if (loading) return <LoadingSpinner label="Loading Journeys..." />;
	if (error) return <Text color="red">Error: {error.message}</Text>;
	if (!status) return <Text color="red">No status data available.</Text>;

	const journeys = Object.values(status.journeys);

	return (
		<Box flexDirection="column">
			<Box marginBottom={1}>
				<Text bold underline>
					User Journeys
				</Text>
			</Box>

			{journeys.length === 0 ? (
				<Box
					borderStyle="round"
					padding={1}
					borderColor="gray"
					marginBottom={1}
				>
					<Text italic>No journeys found in product/journeys/.</Text>
				</Box>
			) : (
				<Box flexDirection="column" gap={1}>
					{journeys.map((journey) => (
						<Box
							key={journey.name}
							borderStyle="single"
							flexDirection="column"
							paddingX={1}
							borderColor={
								journey.scenariosFailing > 0
									? "red"
									: journey.isStale
										? "yellow"
										: "green"
							}
						>
							<Box justifyContent="space-between">
								<Text bold>{journey.name}</Text>
								<Text color="cyan">{journey.actor}</Text>
							</Box>
							<Box marginTop={0}>
								<Text italic color="dim">
									{journey.goal}
								</Text>
							</Box>
							<Box marginTop={0} flexDirection="row" gap={2}>
								<Text>Scenarios: {journey.scenarioCount}</Text>
								<Text color="green">✓ {journey.scenariosPassing}</Text>
								{journey.scenariosFailing > 0 && (
									<Text color="red">✗ {journey.scenariosFailing}</Text>
								)}
								{journey.scenariosMissing > 0 && (
									<Text color="yellow">○ {journey.scenariosMissing}</Text>
								)}
								{journey.isStale && <Text color="yellow">⚠ Stale</Text>}
							</Box>
						</Box>
					))}
				</Box>
			)}

			<Box flexDirection="column" marginTop={1}>
				<Text bold underline>
					Features ({status.active_features.length})
				</Text>
				<Box flexDirection="column">
					{status.active_features.map((f) => {
						const feature = status.features[f];
						const scenarios = Object.values(feature.scenarios);
						const passing = scenarios.filter((s) => s.e2e === "passing").length;
						// const failing = scenarios.filter(s => s.e2e === 'failing').length;

						return (
							<Box key={f} flexDirection="row" justifyContent="space-between">
								<Text>- {f}</Text>
								<Text color="dim">
									{" "}
									{passing}/{scenarios.length} passing
								</Text>
							</Box>
						);
					})}
				</Box>
			</Box>
		</Box>
	);
};
