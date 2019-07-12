import * as index from './index';
describe('index', () => {
  it('should export interfaces', () => {
    expect(index).toBeTruthy();
  });
  it('should export redoc-module', () => {
    expect(index).toHaveProperty('RedocModule');
  });
});
