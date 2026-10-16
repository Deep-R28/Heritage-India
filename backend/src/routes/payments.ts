import { Router } from "express";
import { z } from "zod";
import prisma from "../lib/prisma.js";
import { AppError } from "../middleware/error.js";
import { getPaymentProvider } from "../services/payment.js";
import { createBookingNotification } from "../services/notification.js";

const router = Router();

const paymentSchema = z.object({
  bookingId: z.string().min(1),
  method: z.enum(["CARD", "UPI"]),
  details: z.record(z.unknown()).optional(),
});

router.post("/", async (req, res, next) => {
  try {
    const { bookingId, method, details } = paymentSchema.parse(req.body);

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        site: true,
        guide: true,
        payment: true,
      },
    });

    if (!booking) {
      throw new AppError(404, "Booking not found", "NOT_FOUND");
    }

    if (booking.payment && booking.payment.status === "SUCCESS") {
      throw new AppError(400, "Booking is already paid", "ALREADY_PAID");
    }

    const provider = getPaymentProvider();
    const result = await provider.processPayment({
      bookingId: booking.id,
      amountINR: booking.totalINR,
      method,
      details,
    });

    const payment = await prisma.payment.upsert({
      where: { bookingId: booking.id },
      create: {
        bookingId: booking.id,
        method,
        status: result.success ? "SUCCESS" : "FAILED",
        providerRef: result.providerRef,
        amountINR: booking.totalINR,
      },
      update: {
        method,
        status: result.success ? "SUCCESS" : "FAILED",
        providerRef: result.providerRef,
        amountINR: booking.totalINR,
      },
    });

    if (result.success) {
      await prisma.booking.update({
        where: { id: booking.id },
        data: { status: "UPCOMING" },
      });

      // Automated notification on booking confirmation
      await createBookingNotification(
        booking.userId,
        booking.reference,
        booking.site.name,
        booking.guide?.name,
        booking.visitDate
      );
    }

    return res.status(result.success ? 200 : 400).json({
      data: {
        success: result.success,
        paymentId: payment.id,
        providerRef: payment.providerRef,
        bookingReference: booking.reference,
        error: result.error,
      },
      error: result.success ? null : { message: result.error || "Payment failed", code: "PAYMENT_FAILED" },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
