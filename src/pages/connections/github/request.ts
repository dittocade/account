import { github } from "@lib/auth/connections";
export const GET = github.request.bind(github);
