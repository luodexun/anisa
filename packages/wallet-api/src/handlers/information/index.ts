import Hapi from "@hapi/hapi";
import { registerRoutes } from "./routes";
import { registerMethods } from "./methods";
export const register = (server: Hapi.Server): void => {
    registerRoutes(server);
    registerMethods(server);
};
