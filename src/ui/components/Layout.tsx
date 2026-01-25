import { Box, Text } from "ink";
import BigText from "ink-big-text";
import Gradient from "ink-gradient";

// import React is not needed with react-jsx

interface LayoutProps {
	children: React.ReactNode;
	activeTab: string;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeTab }) => {
	return (
		<Box flexDirection="column" padding={1}>
			<Box marginBottom={1}>
				<Gradient name="pastel">
					<BigText text="UDD" font="block" />
				</Gradient>
			</Box>

			<Box marginBottom={1} flexDirection="row">
				<Tab label="Dashboard" isActive={activeTab === "dashboard"} />
				<Tab label="Actors" isActive={activeTab === "actors"} />
				<Tab label="Journeys" isActive={activeTab === "journeys"} />
			</Box>

			<Box
				borderStyle="single"
				padding={1}
				minHeight={20}
				flexDirection="column"
			>
				{children}
			</Box>

			<Box marginTop={1}>
				<Text color="gray">
					Use Left/Right arrows to navigate, 'q' to quit.
				</Text>
			</Box>
		</Box>
	);
};

const Tab = ({ label, isActive }: { label: string; isActive: boolean }) => (
	<Box marginRight={2}>
		<Text
			color={isActive ? "green" : "white"}
			bold={isActive}
			underline={isActive}
		>
			{isActive ? `[ ${label} ]` : `  ${label}  `}
		</Text>
	</Box>
);
