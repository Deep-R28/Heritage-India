import { Router } from "express";
import { z } from "zod";
import prisma from "../lib/prisma.js";

const router = Router();

const contactSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email is required"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

router.post("/", async (req, res, next) => {
  try {
    const { name, email, message } = contactSchema.parse(req.body);

    const saved = await prisma.contactMessage.create({
      data: { name, email, message },
    });

    return res.status(201).json({
      data: {
        id: saved.id,
        message: "Your message has been received. Our concierge team will reach out shortly.",
      },
      error: null,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
