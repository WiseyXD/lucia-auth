import { lucia } from "@/lib/auth";
import db from "@/lib/db";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { NextRequest } from "next/server";
import { decode } from "punycode";

export async function GET(req: NextRequest) {
    const url = new URL(req.url);
    const searchParams = url.searchParams;
    const token = searchParams.get("token");

    if (!token) {
        return Response.json(
            {
                error: "Token Not Found",
            },
            {
                status: 400,
            }
        );
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
            email: string;
            userId: string;
            code: string;
        };

        const { email, userId, code } = decoded;

        await db.emailVerification.deleteMany({
            where: {
                code: code,
            },
        });

        await db.user.update({
            where: {
                id: userId,
            },
            data: {
                isEmailVerified: true,
            },
        });

        const session = await lucia.createSession(userId, {});
        const sessionCookie = lucia.createSessionCookie(session.id);
        cookies().set(
            sessionCookie.name,
            sessionCookie.value,
            sessionCookie.attributes
        );

        const baseUrl = new URL(process.env.NEXT_BASE_URL!);

        return Response.redirect(baseUrl);
    } catch (error: any) {
        return Response.json(
            {
                error: "Something went wrong while verification",
                description: error.message,
            },
            {
                status: 400,
            }
        );
    }
}
