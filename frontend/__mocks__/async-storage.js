const mockStorage = {};

const AsyncStorageMock = {
  getItem: jest.fn(async (key) => {
    return mockStorage.hasOwnProperty(key) ? mockStorage[key] : null;
  }),

  setItem: jest.fn(async (key, value) => {
    mockStorage[key] = value;
  }),

  removeItem: jest.fn(async (key) => {
    delete mockStorage[key];
  }),

  clear: jest.fn(async () => {
    Object.keys(mockStorage).forEach((key) => delete mockStorage[key]);
  }),
};

module.exports = AsyncStorageMock;
