import { login } from "./login";
import { settings } from "./settings";
import { logout } from "./logout";
import { del } from "./delete";

export const server = {
  login,
  settings,
  logout,
  delete: del
};
