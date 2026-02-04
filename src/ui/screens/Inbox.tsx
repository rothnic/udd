import { Box, Text } from "ink";
import Spinner from "ink-spinner";
import { useInbox } from "../hooks/useInbox.js";

// biome-ignore lint/suspicious/noExplicitAny: ink-spinner types mismatch
const SpinnerAny = Spinner as any;

export function Inbox() {
	const { items, loading, error } = useInbox();

	if (loading)
		return (
			<Text color="green">
				<SpinnerAny type="dots" /> Loading Inbox...
			</Text>
		);
	if (error) return <Text color="red">Error: {error.message}</Text>;

	if (items.length === 0) {
		return <Text>Inbox is empty.</Text>;
	}

	return (
		<Box flexDirection="column">
			<Box marginBottom={1}>
				<Text underline>Inbox ({items.length})</Text>
			</Box>
			{items.map((item) => (
				<Box
					key={item.id}
					flexDirection="column"
					marginBottom={1}
					borderStyle="single"
					borderColor="magenta"
					paddingX={1}
				>
					<Text bold color="magenta">
						{item.title}
					</Text>
					<Text>{item.description}</Text>
					<Box marginTop={1} justifyContent="space-between">
						<Text color="gray">{item.created}</Text>
						{item.research && (
							<Text color="yellow">Research: {item.research}</Text>
						)}
					</Box>
				</Box>
			))}
		</Box>
	);
}
