// Mock Midtrans before all tests
jest.mock("../helpers/midtrans", () => ({
  generateQRIS: jest.fn().mockResolvedValue({
    qrisUrl: "https://mock-qris-url.com/qr-code.png",
    qrisCode: "00020101021126660014COM.NOBUBANK01189360050300000870214994009999999990303UMI51440014ID.CO.QRIS.WWW0215ID10200000000010303UMI5204581253033605802ID5909Merchant659061234565802ID62410503MOCK6304ABCD",
    transactionId: "mock-transaction-id-12345",
    expiryTime: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes from now
  }),
  checkTransactionStatus: jest.fn().mockResolvedValue({
    transactionStatus: "pending",
    transactionTime: new Date().toISOString(),
  }),
  generateOrderId: jest.fn((staffId) => `ORDER-${staffId}-${Date.now()}`),
  verifySignature: jest.fn().mockReturnValue(true), // Always return true for tests
}));

// Mock OpenAI
jest.mock("../helpers/openai.lib", () => ({
  generateOpenAIContent: jest.fn().mockResolvedValue(
    "This is a mock AI response for testing purposes."
  ),
}));
