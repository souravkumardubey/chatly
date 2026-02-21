import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

interface IUser {
    _id: string,
    username: string,
    email: string,
}

export interface AuthenticatedRequest extends Request {
    user?: IUser | null;
}

export const isAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ message: 'Please login - No Auth Headers' });
            return;
        }
        const token = authHeader.split(" ")[1];
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
        if (!decodedToken || !decodedToken.user) {
            res.status(401).json({ message: "Invalid Token" });
            return;
        }
        req.user = decodedToken.user;
        next();
    } catch (error: any) {
        console.error("JWT Verification Error:", error);
        res.status(401).json({ message: "Please login - Jwt Error", error: error.message });
        return;
    }
}

export default isAuth;