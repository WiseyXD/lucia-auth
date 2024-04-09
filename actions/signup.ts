"use server";

import { Argon2id } from "oslo/password";
import { cookies } from "next/headers";
import { ActionResult, lucia } from "@/lib/auth";
import jwt from "jsonwebtoken";
import { redirect } from "next/navigation";

import db from "@/lib/db";

export async function signup(formData: FormData): Promise<ActionResult | null> {
    const username = formData.get("username");
    const email = formData.get("email");

    // username must be between 4 ~ 31 characters, and only consists of lowercase letters, 0-9, -, and _
    // keep in mind some database (e.g. mysql) are case insensitive
    if (typeof email !== "string") {
        return {
            error: "Invalid email",
        };
    }

    if (
        typeof username !== "string" ||
        username.length < 3 ||
        username.length > 31 ||
        !/^[a-z0-9_-]+$/.test(username)
    ) {
        return {
            error: "Invalid username",
        };
    }
    const password = formData.get("password");
    if (
        typeof password !== "string" ||
        password.length < 6 ||
        password.length > 255
    ) {
        return {
            error: "Invalid password",
        };
    }

    const hashedPassword = await new Argon2id().hash(password);

    // TODO: check if username is already used
    const userAlredayExists = await db.user.findUnique({
        where: {
            email,
            username,
        },
    });

    if (userAlredayExists)
        return {
            error: "User Alredy Existis in DB",
        };

    const newUser = await db.user.create({
        data: {
            email,
            hashed_password: hashedPassword,
            username,
        },
    });
    // generate a random 6 character long string
    const code = Math.random().toString(36).substring(2, 8);
    const token = jwt.sign(
        { email, userId: newUser.id, code },
        process.env.JWT_SECRET!,
        {
            expiresIn: "5m",
        }
    );

    const newEmailVerificationToken = await db.emailVerification.create({
        data: {
            code: code,
            user: { connect: { id: newUser.id } },
        },
    });

    const url = `${process.env.NEXT_BASE_URL}/api/verify-email?token=${token}`;

    console.log(url);

    // send mail

    return null;
}
