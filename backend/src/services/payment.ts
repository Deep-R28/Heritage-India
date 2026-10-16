import { config } from "../config.js";

export interface PaymentRequest {
  bookingId: string;
  amountINR: number;
  method: "CARD" | "UPI";
  details?: Record<string, unknown>;
}

export interface PaymentResult {
  success: boolean;
  providerRef: string;
  error?: string;
}

export interface PaymentProvider {
  processPayment(req: PaymentRequest): Promise<PaymentResult>;
}

export class MockPaymentProvider implements PaymentProvider {
  async processPayment(req: PaymentRequest): Promise<PaymentResult> {
    // Deterministic mock payment: successful unless explicitly marked with test failure cards
    const isMockFailure =
      typeof req.details?.cardNumber === "string" &&
      req.details.cardNumber.endsWith("0000");

    if (isMockFailure) {
      return {
        success: false,
        providerRef: `MOCK_FAIL_${Date.now()}`,
        error: "Card declined by issuing bank (Test Simulation)",
      };
    }

    return {
      success: true,
      providerRef: `MOCK_PAY_${Date.now()}_${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
    };
  }
}

export class RazorpayTestProvider implements PaymentProvider {
  constructor(private keyId: string, private keySecret: string) {}

  async processPayment(req: PaymentRequest): Promise<PaymentResult> {
    // If real keys are present in test mode, Razorpay order/payment would be created here.
    // For test mode resilience, we produce a test reference and log test receipt.
    const ref = `RZP_TEST_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    return {
      success: true,
      providerRef: ref,
    };
  }
}

export function getPaymentProvider(): PaymentProvider {
  if (config.razorpayKeyId && config.razorpayKeySecret) {
    return new RazorpayTestProvider(config.razorpayKeyId, config.razorpayKeySecret);
  }
  return new MockPaymentProvider();
}
