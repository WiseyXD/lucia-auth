import { logout } from "@/actions/logout";
import { validateRequest } from "@/actions/validateRequests";
import { redirect } from "next/navigation";

export default async function Home() {
    const { user } = await validateRequest();
    if (!user) redirect("/signup");
    return (
        <main className="flex min-h-screen flex-col items-center justify-between p-24">
            {JSON.stringify(user)}
            <form action={logout}>
                <button className="text-xl rounded-md bg-white text-black px-4 py-2">
                    Logout
                </button>
            </form>
        </main>
    );
}
