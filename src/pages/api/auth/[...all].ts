import { auth } from "@/shared/config/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler(auth);

export default async function handler(req: any, res: any) {
	if (req.method === "GET") {
		return GET(req, res);
	}
	if (req.method === "POST") {
		return POST(req, res);
	}
	return res.status(405).json({ error: "Method not allowed" });
}