const mockPost = jest.fn();

jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

jest.mock("axios", () => {
  const actualAxios = jest.requireActual("axios");
  const instance = actualAxios.create();
  instance.post = mockPost;
  return {
    ...actualAxios,
    create: jest.fn(() => instance),
    post: mockPost,
  };
});

describe("API Interceptors", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const api = require("../services/api").default;
  const AsyncStorage = require("@react-native-async-storage/async-storage");

  test("does not attach token for 'api/login/ and 'api/register/", async () => {
    const urls = ["/register/", "/login/"];
    for (const url of urls) {
      const config = { url, headers: {} };
      const modified =
        await api.interceptors.request.handlers[0].fulfilled(config);
      console.log("Config URL: ", config.url);
      console.log("Config: ", config);
      console.log("Authorization Header:", config.headers.Authorization);
      expect(modified.headers.Authorization).toBeUndefined();
    }
  });

  test("attaches token for protected routes", async () => {
    AsyncStorage.getItem.mockResolvedValue("mock-token");
    const config = { url: "/protected", headers: {} };
    const modified =
      await api.interceptors.request.handlers[0].fulfilled(config);
    expect(modified.headers.Authorization).toBe("Bearer mock-token");
  });
});
