"use server";

import { ActionResult, lucia } from "@/lib/auth";
import { validateRequest } from "./validateRequests";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function logout(): Promise<ActionResult> {
    try {
        const { session } = await validateRequest();
        if (!session) {
            return {
                error: "Unauthorized",
            };
        }

        await lucia.invalidateSession(session.id);

        const sessionCookie = lucia.createBlankSessionCookie();
        cookies().set(
            sessionCookie.name,
            sessionCookie.value,
            sessionCookie.attributes
        );
        return redirect("/singup");
    } catch (error: any) {
        console.log(error);
        return {
            error: error.message,
        };
    }
}
