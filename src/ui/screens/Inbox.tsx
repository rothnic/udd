import { Box, Text } from "ink";
import { LoadingSpinner } from "../components/Spinner.js";
import { useInbox } from "../hooks/useInbox.js";

export const Inbox = () => {
	const { items, loading } = useInbox();

	if (loading) return <LoadingSpinner label="Loading Inbox..." />;

	if (items.length === 0) {
		return (
			<Box borderStyle="round" padding={1} borderColor="gray">
				<Text italic>No items in inbox.</Text>
			</Box>
		);
	}

	return (
		<Box flexDirection="column">
			<Box marginBottom={1}>
				<Text bold underline>
					Inbox ({items.length})
				</Text>
			</Box>
			<Box flexDirection="column" gap={1}>
				{items.map((item) => (
					<Box
						key={item.id}
						borderStyle="single"
						flexDirection="column"
						paddingX={1}
						borderColor="gray"
					>
						<Box justifyContent="space-between">
							<Text bold color="cyan">
								{item.title}
							</Text>
							<Text color="dim">
								{item.created
									? new Date(item.created).toLocaleDateString()
									: ""}
							</Text>
						</Box>
						<Box marginTop={0}>
							<Text>{item.description}</Text>
						</Box>
						{item.research && (
							<Box marginTop={0}>
								<Text color="yellow">Research: {item.research}</Text>
							</Box>
						)}
					</Box>
				))}
			</Box>
		</Box>
	);
};
