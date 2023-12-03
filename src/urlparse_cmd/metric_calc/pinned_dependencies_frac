import { GithubAPIService } from './git_API_call';
import logger from '../../logger';

export class DependencyPinningCalculator {

    private githubAPI: GithubAPIService;

    constructor(githubAPI: GithubAPIService) {
        this.githubAPI = githubAPI;
    }

    /**
     * Fetches dependency data from the GitHub API.
     * @returns {Promise<any>} A promise that resolves with the dependency data.
     */
    async fetchDependencies() {
        try {
            // Assuming the GitHub API endpoint for fetching dependency information is 'dependencies'
            const dependencies = await this.githubAPI.fetchAPIdata('dependencies');
            return dependencies;
        } catch (error) {
            logger.error(`Error fetching dependencies: ${error}`);
            return [];
        }
    }

    /**
     * Calculates the fraction of dependencies that are pinned to at least a specific major+minor version.
     * @param {string} targetVersion - The target major+minor version (e.g., '2.3').
     * @returns {Promise<number>} The fraction of dependencies.
     */
    async calcPinnedDependenciesFraction(targetVersion: string): Promise<number> {
        try {
            const dependencies = await this.fetchDependencies();

            // Filter dependencies that satisfy the pinning condition
            const pinnedDependencies = dependencies.filter((dep: any) => {
                // Assuming the dependency version is available as 'version' property
                // You may need to adjust this based on the actual structure of your dependency data
                const depVersion = dep.version || '0.0.0';
                const depMajorMinorVersion = depVersion.split('.').slice(0, 2).join('.');

                return depMajorMinorVersion === targetVersion;
            });

            // Calculate the fraction of dependencies that satisfy the pinning condition
            const pinnedDependenciesFraction = pinnedDependencies.length / dependencies.length;

            return pinnedDependenciesFraction || 1.0; // If no dependencies, return 1.0
        } catch (error) {
            logger.error(`Error calculating pinned dependencies fraction: ${error}`);
            return -1;
        }
    }

    /**
     * Calculates the total dependency pinning score based on the fraction of dependencies that satisfy the pinning condition.
     * @param {number} pinnedDependenciesFraction - The fraction of dependencies that satisfy the pinning condition.
     * @returns {number} The total dependency pinning score.
     */
    totalDependencyPinningScore(pinnedDependenciesFraction: number): number {
        logger.info("Successfully calculated dependency pinning score");
        // You can customize the weights based on your specific criteria
        return pinnedDependenciesFraction;
    }
}
