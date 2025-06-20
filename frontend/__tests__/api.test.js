/* The code mocks the axios library to replace real HTTP calls with controlled mock functions, 
allowing tests to run without actual network requests. It intercepts calls to axios.create() 
and HTTP methods (post, get, request), returning mocked functions instead. 
This lets your app’s api instance use the mocked axios automatically, 
so tests can simulate API responses and errors (like 401 Unauthorized) reliably and quickly, 
ensuring isolated, deterministic testing of your API logic and interceptors. */

jest.mock("axios", () => {
  const actualAxios = jest.requireActual("axios");
  const instance = actualAxios.create({
    baseURL: "http://192.168.1.4:8000/api/",
  });

  // Mock all HTTP methods you use:
  instance.post = jest.fn();
  instance.get = jest.fn();
  instance.request = jest.fn();

  return {
    ...actualAxios,
    create: jest.fn(() => instance),
    post: jest.fn(),
    get: jest.fn(),
    request: jest.fn(),
  };
});

jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

const api = require("../services/api").default;
const AsyncStorage = require("@react-native-async-storage/async-storage");

describe("API Interceptors", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("does not attach token for 'api/login/ and 'api/register/", async () => {
    const urls = ["/register/", "/login/"];
    for (const url of urls) {
      const config = { url, headers: {} };
      const modified =
        await api.interceptors.request.handlers[0].fulfilled(config);
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

  test("check axios config in request interceptor", async () => {
    const config = {
      url: "/protected/",
      headers: {},
      baseURL: "http://192.168.1.4:8000/api/",
    };
    const modifiedConfig =
      await api.interceptors.request.handlers[0].fulfilled(config);
    expect(modifiedConfig.baseURL).toBe(api.defaults.baseURL);
    expect(modifiedConfig.url).toBe("/protected/");
  });

  test("attaches token for protected routes", async () => {
    AsyncStorage.getItem.mockResolvedValue("mock-token");
    const config = {
      url: "/protected/",
      headers: {},
      baseURL: "http://192.168.1.4:8000/api/",
    };
    const modified =
      await api.interceptors.request.handlers[0].fulfilled(config);
    expect(modified.headers.Authorization).toBe("Bearer mock-token");
  });
});

test("GET /protected/ returns 401 when no token is set", async () => {
  AsyncStorage.getItem.mockResolvedValue(null);

  // Mock api.request to reject with a 401 error response:
  const axiosInstance = require("axios").create(); // your mocked instance
  axiosInstance.request.mockRejectedValue({
    response: { status: 401 },
    toJSON: () => ({ message: "Unauthorized" }),
  });

  try {
    await api.request({
      method: "get",
      url: "/protected/",
      baseURL: "http://192.168.1.4:8000/api/",
    });
    throw new Error("Request should have failed with 401");
  } catch (error) {
    console.log("Error object:", error.toJSON?.() || error);
    console.log("Response status:", error.response?.status);
    expect(error.response?.status).toBe(401);
  }
});
