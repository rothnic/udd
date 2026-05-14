import { Box, Text } from "ink";
import { useInbox } from "../hooks/useInbox.js";

export function Inbox() {
	const { items, loading } = useInbox();

	if (loading) return <Text>Loading inbox...</Text>;

	if (items.length === 0) {
		return <Text>Inbox is empty.</Text>;
	}

	return (
		<Box flexDirection="column">
			<Text bold underline>
				Inbox
			</Text>
			{items.map((item, index) => (
				<Box
					// biome-ignore lint/suspicious/noArrayIndexKey: simple list
					key={index}
					marginTop={1}
					borderStyle="single"
					padding={1}
					flexDirection="column"
				>
					<Text bold>{item.title || "Untitled"}</Text>
					<Text>{item.description || "No description"}</Text>
				</Box>
			))}
		</Box>
	);
}
