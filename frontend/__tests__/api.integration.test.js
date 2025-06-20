jest.mock("@react-native-async-storage/async-storage");
const useStore = require("../store/useStore").default;
const api = require("../services/api").default;

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
    useStore.setState({
      auth: {
        jwt: {
          access: expiredAccessToken,
          refresh: refreshToken,
        },
        user: loginResponse.data.user,
      },
    });
  });

  test("should refresh token on 401 and retry original request", async () => {
    // 3. Make protected API call that should return 401 for expired token, then refresh automatically
    const response = await api.get("/protected/");

    // 4. Assertions:
    expect(response.status).toBe(200);

    // 5. Check AsyncStorage for new access token, different from expired token
    const newAccessToken = useStore.getState().auth.jwt?.access;
    expect(newAccessToken).toBeDefined();
    expect(newAccessToken).not.toBe(expiredAccessToken);
  });

  // Optional cleanup if needed
  afterAll(async () => {
    useStore.setState({
      auth: {
        jwt: { access: null, refresh: null },
        user: null,
      },
    });
  });
});
