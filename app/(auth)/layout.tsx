import { validateRequest } from "@/actions/validateRequests";
import { redirect } from "next/navigation";
import React from "react";

export default async function layout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { session } = await validateRequest();
    if (session) redirect("/");
    return <div>{children}</div>;
}
