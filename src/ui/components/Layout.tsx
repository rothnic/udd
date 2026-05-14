import { Box, Text } from "ink";

type Props = {
	children: React.ReactNode;
	activeTab: string;
};

export function Layout({ children, activeTab }: Props) {
	return (
		<Box
			flexDirection="column"
			padding={1}
			borderStyle="round"
			borderColor="blue"
		>
			<Box marginBottom={1}>
				<Text color="green" bold>
					UDD TUI
				</Text>
				<Box marginLeft={2}>
					<Tab
						name="Dashboard"
						id="dashboard"
						active={activeTab === "dashboard"}
					/>
					<Tab
						name="Journeys"
						id="journeys"
						active={activeTab === "journeys"}
					/>
					<Tab name="Inbox" id="inbox" active={activeTab === "inbox"} />
					<Tab name="Help" id="help" active={activeTab === "help"} />
				</Box>
			</Box>
			<Box flexGrow={1} flexDirection="column">
				{children}
			</Box>
			<Box
				marginTop={1}
				borderStyle="single"
				borderTop={true}
				borderBottom={false}
				borderLeft={false}
				borderRight={false}
				borderColor="gray"
			>
				<Text dimColor>Use keys 1-4 to navigate | q to quit</Text>
			</Box>
		</Box>
	);
}

function Tab({ name, active }: { name: string; id: string; active: boolean }) {
	return (
		<Box marginRight={2}>
			<Text color={active ? "cyan" : "gray"} bold={active} underline={active}>
				{active ? `[ ${name} ]` : name}
			</Text>
		</Box>
	);
}
