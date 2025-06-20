import useStore from "../store/useStore";
import api from "../services/api";

jest.mock("axios", () => {
  const handlers = { fulfilled: jest.fn(), rejected: jest.fn() };
  const interceptors = {
    request: { use: jest.fn() },
    response: { use: jest.fn() },
  };
  return {
    create: jest.fn(() => ({
      post: jest.fn().mockResolvedValue({
        data: {
          access: "mock-access-token",
          refresh: "mock-refresh-token",
          user: { id: 1, username: "user1", password: "user1" },
        },
      }),
      interceptors,
    })),
  };
});

test("login updates zustand auth state", async () => {
  
  useStore.setState({ auth: { jwt: null, user: null } });

  // Call login API (mocked)
  const res = await api.post("/login/", {
    username: "user1",
    password: "user1",
  });

  // Update zustand store
  useStore
    .getState()
    .setAuth(
      { access: res.data.access, refresh: res.data.refresh },
      res.data.user,
    );
    const auth = useStore.getState().auth;
    console.log("Current auth state:", auth);
    console.log("Global state:", useStore.getState());
  // Assert zustand state updated
  expect(auth.jwt?.access).toBe("mock-access-token");
  expect(auth.jwt?.refresh).toBe("mock-refresh-token");
  expect(auth.user?.username).toBe("user1");
  expect(auth.user?.password).toBe("user1");
});
