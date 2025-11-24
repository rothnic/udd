import fs from 'fs/promises';
import path from 'path';
import yaml from 'yaml';
import { glob } from 'glob';

export interface ScenarioStatus { e2e: "missing" | "failing" | "passing"; }
export interface RequirementStatus { tests: "missing" | "failing" | "passing"; }

export interface FeatureStatus {
  scenarios: Record<string, ScenarioStatus>;
  requirements: Record<string, RequirementStatus>;
}

export interface ProjectStatus {
  active_features: string[];
  features: Record<string, FeatureStatus>;
}

export async function getProjectStatus(): Promise<ProjectStatus> {
  const rootDir = process.cwd();
  const status: ProjectStatus = {
    active_features: [],
    features: {}
  };

  // 1. Find all features
  const featureFiles = await glob('specs/features/**/_feature.yml', { cwd: rootDir });
  
  for (const file of featureFiles) {
    const content = await fs.readFile(path.join(rootDir, file), 'utf-8');
    const data = yaml.parse(content) as { id: string };
    const featureId = data.id;
    
    status.active_features.push(featureId);
    status.features[featureId] = {
        scenarios: {},
        requirements: {}
    };

    // Find scenarios for this feature
    const featureDir = path.dirname(file);
    const scenarioFiles = await glob('*.feature', { cwd: path.join(rootDir, featureDir) });
    
    for (const scenarioFile of scenarioFiles) {
        const slug = path.basename(scenarioFile, '.feature');
        // Check if E2E test exists
        // Expected path: tests/e2e/<area>/<feature>/<slug>.e2e.test.ts
        // featureDir is specs/features/<area>/<feature>
        // We need to map specs/features -> tests/e2e
        const relativeFeatureDir = path.relative('specs/features', featureDir);
        const testPath = path.join('tests/e2e', relativeFeatureDir, `${slug}.e2e.test.ts`);
        const absTestPath = path.resolve(rootDir, testPath);
        
        let e2eStatus: "missing" | "failing" | "passing" = "missing";
        try {
            await fs.access(absTestPath);
            
            // Check actual test results from .udd/results.json
            try {
                const resultsPath = path.join(rootDir, '.udd/results.json');
                const resultsContent = await fs.readFile(resultsPath, 'utf-8');
                const results = JSON.parse(resultsContent);
                
                const testResult = results.testResults?.find((r: { name: string; status: string }) => r.name === absTestPath);
                if (testResult) {
                    e2eStatus = testResult.status === 'passed' ? 'passing' : 'failing';
                } else {
                    e2eStatus = 'failing'; 
                }
            } catch {
                // No results file or parse error
                e2eStatus = 'failing';
            }
        } catch {
            e2eStatus = "missing";
        }
        
        status.features[featureId].scenarios[slug] = { e2e: e2eStatus };
    }
  }

  // 2. Find requirements
  const reqFiles = await glob('specs/requirements/*.yml', { cwd: rootDir });
  for (const file of reqFiles) {
      const content = await fs.readFile(path.join(rootDir, file), 'utf-8');
      const data = yaml.parse(content) as { feature: string; key: string };
      const featureId = data.feature;
      const reqKey = data.key;

      if (status.features[featureId]) {
          // Check if test exists
          // Expected path: tests/unit/<domain>/<key>.test.ts or similar
          // For now, let's just look for any test file with the key in filename in tests/
          const testFiles = await glob(`tests/**/${reqKey}.test.ts`, { cwd: rootDir });
          
          status.features[featureId].requirements[reqKey] = {
              tests: testFiles.length > 0 ? "passing" : "missing" // Stub logic
          };
      }
  }

  return status;
}
