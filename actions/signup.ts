"use server";

import { Argon2id } from "oslo/password";
import { cookies } from "next/headers";
import { lucia } from "@/lib/auth";
import { redirect } from "next/navigation";

import db from "@/lib/db";

export async function signup(formData: FormData): Promise<ActionResult> {
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

    const session = await lucia.createSession(newUser.id, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    cookies().set(
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes
    );
    return redirect("/");
}

interface ActionResult {
    error: string;
}
