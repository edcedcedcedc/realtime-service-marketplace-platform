import { API_BASE_URL } from "../constants/network";

//Mock axios before importing anything that uses it
jest.mock("axios", () => {
  const actualAxios = jest.requireActual("axios");
  const instance = actualAxios.create({
    baseURL: API_BASE_URL,
  });

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

// Mock Zustand store with JWT
jest.mock("../store/useStore", () => ({
  __esModule: true,
  default: {
    getState: jest.fn(() => ({
      auth: {
        jwt: {
          access: "mock-token",
          refresh: "mock-refresh",
        },
        user: {
          id: 1,
          username: "test",
          email: "test@example.com",
          role: "client",
        },
      },
    })),
  },
}));

const api = require("../services/api").default;
const useStore = require("../store/useStore").default;
const axios = require("axios");

describe("API Interceptors", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mock for refresh endpoint
    axios.post.mockImplementation((url, data) => {
      if (url.endsWith("token/refresh/") && data.refresh === "mock-refresh") {
        return Promise.resolve({ data: { access: "new-access-token" } });
      }
      return Promise.reject(new Error("Unexpected POST call"));
    });
  });

  test("Does not attach token for /login/ and /register/", async () => {
    const urls = ["/login/", "/register/"];

    for (const url of urls) {
      const config = { url, headers: {} };
      const modified =
        await api.interceptors.request.handlers[0].fulfilled(config);
      expect(modified.headers.Authorization).toBeUndefined();
    }
  });

  test("Attaches token for protected routes", async () => {
    const config = { url: "/protected/", headers: {} };
    const modified =
      await api.interceptors.request.handlers[0].fulfilled(config);
    expect(modified.headers.Authorization).toBe("Bearer mock-token");
  });

  test("Preserves baseURL and URL", async () => {
    const config = {
      url: "/protected/",
      headers: {},
      baseURL: "http://192.168.1.4:8000/api/",
    };

    const modified =
      await api.interceptors.request.handlers[0].fulfilled(config);
    expect(modified.baseURL).toBe(api.defaults.baseURL);
    expect(modified.url).toBe("/protected/");
  });

  test("No token results in missing Authorization header", async () => {
    useStore.getState.mockReturnValueOnce({
      auth: { jwt: { access: null, refresh: null }, user: null },
    });

    const config = { url: "/protected/", headers: {} };
    const modified =
      await api.interceptors.request.handlers[0].fulfilled(config);
    expect(modified.headers.Authorization).toBeUndefined();
  });
});

describe("API Error Handling", () => {
  test("GET /protected/ returns 401 when no token is set", async () => {
    useStore.getState.mockReturnValueOnce({
      auth: { jwt: { access: null, refresh: null }, user: null },
    });

    const axiosInstance = axios.create();
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
      throw new Error("Expected 401 error");
    } catch (error) {
      expect(error.response?.status).toBe(401);
    }
  });
});
