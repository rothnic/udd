import { Box, Text } from "ink";
import type React from "react";

interface LayoutProps {
	children: React.ReactNode;
	activeTab: string;
}

export const Layout = ({ children, activeTab }: LayoutProps) => {
	return (
		<Box flexDirection="column" height="100%">
			<Box borderStyle="single" borderColor="blue" paddingX={1}>
				<Text key="title" color="green" bold>
					UDD
				</Text>
				<Text key="sep1"> | </Text>
				<Tab
					key="t1"
					name="Dashboard"
					isActive={activeTab === "dashboard"}
					keyId="1"
				/>
				<Text key="sep2"> | </Text>
				<Tab
					key="t2"
					name="Journeys"
					isActive={activeTab === "journeys"}
					keyId="2"
				/>
				<Text key="sep3"> | </Text>
				<Tab key="t3" name="Inbox" isActive={activeTab === "inbox"} keyId="3" />
				<Text key="sep4"> | </Text>
				<Tab key="t4" name="Help" isActive={activeTab === "help"} keyId="4" />
			</Box>
			<Box flexDirection="column" padding={1} flexGrow={1}>
				{children}
			</Box>
			<Box borderStyle="single" borderColor="gray" paddingX={1}>
				<Text color="gray">Press 1-4 to navigate, q to quit</Text>
			</Box>
		</Box>
	);
};

const Tab = ({
	name,
	isActive,
	keyId,
}: {
	name: string;
	isActive: boolean;
	keyId: string;
}) => (
	<Text color={isActive ? "cyan" : "gray"} bold={isActive}>
		{keyId}. {name}
	</Text>
);
