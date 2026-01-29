import { Text } from "ink";
import Spinner from "ink-spinner";

// biome-ignore lint/suspicious/noExplicitAny: library type mismatch
const SpinnerAny = Spinner as any;

interface SpinnerProps {
	type?: string;
	label?: string;
}

export const LoadingSpinner = ({
	type = "dots",
	label = "Loading...",
}: SpinnerProps) => (
	<Text>
		<Text color="green">
			<SpinnerAny type={type} />
		</Text>
		{" " + label}
	</Text>
);
