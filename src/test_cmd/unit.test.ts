// Import the function to be tested
import get_metric_scores from '../urlparse_cmd/process_url';
const errorSpy = jest.spyOn(console, 'error');


describe('get_metric function', () => {
  // Test case 1: Test when input is a valid URL
  it('should return a metric for a valid file', () => {
    const file = '/home/shay/a/gardne97/461test/group5phase1/samples/SampleUrlFile.txt';
    const metric = get_metric_scores(file);
    expect(metric).toBe(10);
  });

  // Test case 2: Test when input is an invalid URL
  it('should handle invalid FILE gracefully', () => {
    const url = 'invalid-url';
    const metric = get_metric_scores(url);
    expect(metric).toBe(null);
  });

  // Add more test cases as needed
});

expect(errorSpy).not.toHaveBeenCalled();
