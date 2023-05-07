import { Router } from "express";
import { login } from "../controller/user";
import { rateLimiter } from "../middlewares/rate-limit";
const userRoutes = Router();

userRoutes.post("/login", rateLimiter, login);

export default userRoutes;
