import { login } from "@/actions/login";

export default async function Page() {
    return (
        <>
            <h1>Create an account</h1>
            <form action={login}>
                <label htmlFor="email">Email</label>
                <input name="email" id="email" required />
                <br />

                <label htmlFor="password">Password</label>
                <input type="password" name="password" id="password" />
                <br />
                <button type="submit">Continue</button>
            </form>
        </>
    );
}
