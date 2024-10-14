import { github } from "@lib/auth/connections";
export const GET = github.callback.bind(github);
