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
    /**
     * Fetches dependency data from the GitHub API.
     * @returns {Promise<any> | Promise<number>} A promise that resolves with the dependency data.
     */
    async fetchDependencies(PackageJson: any): Promise<any[] | number> {
        try {
            // Retrieve the contents of the package.json file
            
            const packageJsonContent = PackageJson;
            
            if (!packageJsonContent) {
                logger.warn("No package.json file found. Returning 0 for dependency pinning score.");
                return 0;
            }

            // Parse the JSON content to extract dependency information
            const packageJson = JSON.parse(packageJsonContent);

            // Assuming dependencies are listed under the 'dependencies' field
            const dependencies = packageJson.dependencies || {};

            // Convert dependencies object to an array of objects for consistency
            const dependenciesArray = Object.keys(dependencies).map(name => ({ name, version: dependencies[name] }));

            return dependenciesArray;
        } catch (error) {
            logger.error(`Error fetching or parsing package.json: ${error}`);
            return [];
        }
    }

    /**
 * Calculates the fraction of dependencies that are pinned (have any version specified).
 * @returns {Promise<number>} The fraction of dependencies.
 */
async calcPinnedDependenciesFraction(PackageJSON: any): Promise<number> {
    try {
        const dependencies = await this.fetchDependencies(PackageJSON);

        // Ensure dependencies is an array
        const dependenciesArray = Array.isArray(dependencies) ? dependencies : [];

        // Filter dependencies that have any version specified
        const pinnedDependencies = dependenciesArray.filter((dep: any) => {
            // Assuming the dependency version is available as 'version' property
            // You may need to adjust this based on the actual structure of your dependency data
            return dep.version !== undefined && dep.version !== null && dep.version !== '';
        });

        // Calculate the fraction of dependencies that have any version specified
        const pinnedDependenciesFraction = pinnedDependencies.length / dependenciesArray.length;
        
        return pinnedDependenciesFraction || 1.0; // If no dependencies, return 1.0
    } catch (error) {
        logger.error(`Error calculating pinned dependencies fraction: ${error}`);
        return -1;
    }
}

    /**
     * Calculates the total dependency pinning score based on the fraction of dependencies that have any version specified.
     * @param {number} pinnedDependenciesFraction - The fraction of dependencies that have any version specified.
     * @returns {number} The total dependency pinning score.
     */
    totalDependencyPinningScore(pinnedDependenciesFraction: number): number {
        logger.info("Successfully calculated dependency pinning score");
        return pinnedDependenciesFraction;
    }
}

