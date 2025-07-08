module.exports = {
  Alert: {
    alert: jest.fn(),
  },
  Platform: {
    OS: "ios",
    select: (obj) => obj.ios,
  },
};
