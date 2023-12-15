import { DependencyPinningCalculator } from '../urlparse_cmd/metric_calc/pinned_dependencies_frac';
import { GithubAPIService } from '../urlparse_cmd/metric_calc/git_API_call';

const mockPackageJsonWithVersions = {
  "dependencies": {
    "dependency1": "1.0.0",
    "dependency2": "2.1.3",
    "dependency3": "3.5.2"
  },
  "devDependencies": {
    "devDependency1": "1.2.0"
  }
};

const mockPackageJsonWithUnpinnedDependencies = {
  "dependencies": {
    "dependency1": "",
    "dependency2": "",
    "dependency3": ""
  },
  "devDependencies": {
    "devDependency1": ""
  }
};

const mockPackageJsonWithNoDependencies = {
  "dependencies": {},
  "devDependencies": {}
};

const mockPackageJsonWithError = {
  // This could represent a malformed or incomplete JSON file
  "dependencies": {
    "dependency1": "1.0.0",
    "dependency2": "2.1.3",
    // Missing version for dependency3
  },
  "devDependencies": {
    "devDependency1": "1.2.0"
  }
}
// Mock GithubAPIService to avoid actual API calls during tests
jest.mock('./git_API_call');

describe('DependencyPinningCalculator', () => {
  let githubAPI: GithubAPIService;
  let calculator: DependencyPinningCalculator;

  beforeEach(() => {
    // Create a mock instance of GithubAPIService
    githubAPI = new GithubAPIService('dummy', 'dummy');
    // Create an instance of DependencyPinningCalculator with the mock GithubAPIService
    calculator = new DependencyPinningCalculator(githubAPI);
  });

  afterEach(() => {
    // Clear all mock calls after each test
    jest.clearAllMocks();
  });

  describe('calcPinnedDependenciesFraction', () => {
    it('calculates the fraction of pinned dependencies', async () => {
      // Mock the fetchDependencies method to return a sample list of dependencies
      (githubAPI.fetchAPIdata as jest.Mock).mockResolvedValue([
        { version: '1.0.0' },
        { version: '2.1.3' },
        { version: '' }, // unpinned dependency
      ]);

      const result = await calculator.calcPinnedDependenciesFraction(mockPackageJsonWithVersions);

      // The expected fraction is 2/3 since 2 out of 3 dependencies have a version
      expect(result).toBeCloseTo(2 / 3);
    });

    it('handles errors and returns -1', async () => {
      // Mock the fetchDependencies method to throw an error
      (githubAPI.fetchAPIdata as jest.Mock).mockRejectedValue(new Error('API error'));

      const result = await calculator.calcPinnedDependenciesFraction(mockPackageJsonWithVersions);

      // The expected result is -1 since there was an error fetching dependencies
      expect(result).toBe(-1);
    });

    // Add more test cases using different mockPackageJson data as needed

    it('handles unpinned dependencies correctly', async () => {
      (githubAPI.fetchAPIdata as jest.Mock).mockResolvedValue([
        { version: '' },
        { version: '' },
        { version: '' },
      ]);

      const result = await calculator.calcPinnedDependenciesFraction(mockPackageJsonWithUnpinnedDependencies);

      // The expected result is 0 since none of the dependencies have a version
      expect(result).toBe(0);
    });

    it('handles scenarios with no dependencies correctly', async () => {
      (githubAPI.fetchAPIdata as jest.Mock).mockResolvedValue([]);

      const result = await calculator.calcPinnedDependenciesFraction(mockPackageJsonWithNoDependencies);

      // The expected result is 1 since there are no dependencies
      expect(result).toBe(1);
    });

    it('handles scenarios with incomplete or error-prone packageJson correctly', async () => {
      // Mock the fetchDependencies method to return a sample list of dependencies
      (githubAPI.fetchAPIdata as jest.Mock).mockResolvedValue([
        { version: '1.0.0' },
        { version: '2.1.3' },
        // Missing version for dependency3
      ]);

      const result = await calculator.calcPinnedDependenciesFraction(mockPackageJsonWithError);

      // The expected result is -1 since there's an error in the packageJson
      expect(result).toBe(-1);
    });
  });

  // Add more test cases for other methods if needed
});
