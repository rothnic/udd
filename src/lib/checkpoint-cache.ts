import fs from "node:fs/promises";
import path from "node:path";
import yaml from "yaml";
export interface CheckpointResponse {
	checkpointId: string;
	question: string;
	response: string;
	timestamp: string;
	context?: Record<string, unknown>;
}

export interface CheckpointCache {
	responses: CheckpointResponse[];
	lastUpdated: string;
}

const DEFAULT_CACHE: CheckpointCache = {
	responses: [],
	lastUpdated: "",
};

const CACHE_PATH = path.join(process.cwd(), ".udd", "checkpoints.yml");

async function ensureCacheDir() {
	await fs.mkdir(path.dirname(CACHE_PATH), { recursive: true });
}

export async function loadCheckpointCache(): Promise<CheckpointCache> {
	try {
		const content = await fs.readFile(CACHE_PATH, "utf-8");
		const parsed = yaml.parse(content) as unknown;
		if (!parsed || typeof parsed !== "object") return DEFAULT_CACHE;
		const asCache = parsed as CheckpointCache;
		return {
			responses: Array.isArray(asCache.responses) ? asCache.responses : [],
			lastUpdated:
				typeof asCache.lastUpdated === "string" ? asCache.lastUpdated : "",
		};
	} catch (err) {
		return DEFAULT_CACHE;
	}
}

export async function saveCheckpointResponse(
	checkpointId: string,
	response: string,
	question = "",
	context?: Record<string, unknown>,
): Promise<void> {
	const cache = await loadCheckpointCache();
	const now = new Date().toISOString();

	const existingIndex = cache.responses.findIndex(
		(r) => r.checkpointId === checkpointId,
	);
	const record: CheckpointResponse = {
		checkpointId,
		question,
		response,
		timestamp: now,
		context,
	};

	if (existingIndex >= 0) {
		cache.responses[existingIndex] = record;
	} else {
		cache.responses.push(record);
	}

	cache.lastUpdated = now;

	await ensureCacheDir();
	const serialized = yaml.stringify(cache);
	await fs.writeFile(CACHE_PATH, serialized, "utf-8");
}

export async function getCachedResponse(
	checkpointId: string,
): Promise<CheckpointResponse | undefined> {
	const cache = await loadCheckpointCache();
	return cache.responses.find((r) => r.checkpointId === checkpointId);
}

export async function hasCachedResponse(
	checkpointId: string,
): Promise<boolean> {
	const c = await getCachedResponse(checkpointId);
	return !!c;
}

export async function clearCheckpointCache(): Promise<void> {
	await ensureCacheDir();
	const empty: CheckpointCache = {
		responses: [],
		lastUpdated: new Date().toISOString(),
	};
	await fs.writeFile(CACHE_PATH, yaml.stringify(empty), "utf-8");
}

export default {
	loadCheckpointCache,
	saveCheckpointResponse,
	getCachedResponse,
	hasCachedResponse,
	clearCheckpointCache,
};
