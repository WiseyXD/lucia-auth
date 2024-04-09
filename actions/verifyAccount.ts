"use server";

import db from "@/lib/db";
import jwt from "jsonwebtoken";
import { redirect } from "next/navigation";

export async function verifyAccount({
    userId,
    email,
}: {
    email: string;
    userId: string;
}) {
    const code = Math.random().toString(36).substring(2, 8);
    const token = jwt.sign({ email, userId, code }, process.env.JWT_SECRET!, {
        expiresIn: "5m",
    });

    const newEmailVerificationToken = await db.emailVerification.create({
        data: {
            code: code,
            user: { connect: { id: userId } },
        },
    });

    const url = `${process.env.NEXT_BASE_URL}/api/verify-email?token=${token}`;

    console.log(url);

    // send mail
}
