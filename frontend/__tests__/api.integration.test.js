jest.mock("@react-native-async-storage/async-storage");
const api = require("../services/api").default;
const AsyncStorage = require("@react-native-async-storage/async-storage");

describe("Update access token based on refresh token and expired access token", () => {
  let refreshToken;
  const expiredAccessToken = "some-expired-token"; // dummy expired token

  beforeAll(async () => {
    // 1. Login to get valid refresh token from backend
    const loginResponse = await api.post("/login/", {
      username: "user1",
      password: "user1",
    });
    refreshToken = loginResponse.data.refresh;

    // 2. Seed AsyncStorage with expired access token and valid refresh token
    await AsyncStorage.setItem("access", expiredAccessToken);
    await AsyncStorage.setItem("refresh", refreshToken);
  });

  test("should refresh token on 401 and retry original request", async () => {
    // 3. Make protected API call that should return 401 for expired token, then refresh automatically
    const response = await api.get("/protected/");

    // 4. Assertions:
    expect(response.status).toBe(200);

    // 5. Check AsyncStorage for new access token, different from expired token
    const newAccessToken = await AsyncStorage.getItem("access");
    expect(newAccessToken).toBeDefined();
    expect(newAccessToken).not.toBe(expiredAccessToken);
  });

  // Optional cleanup if needed
  afterAll(async () => {
    await AsyncStorage.removeItem("access");
    await AsyncStorage.removeItem("refresh");
  });
});
