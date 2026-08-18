import { Request, Response, NextFunction } from "express";
import { verifyAccessToken, TokenPayload, UserRole } from "../utils/jwt.js";
import { AppError } from "../utils/appError.js";
import { User, IUser } from "../modules/users/user.model.js";

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
      tokenPayload?: TokenPayload;
    }
  }
}

export const protect = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token: string | undefined;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      throw new AppError("Authentication required. Please log in.", 401);
    }

    const payload = verifyAccessToken(token);

    const currentUser = await User.findById(payload.userId);
    if (!currentUser) {
      throw new AppError(
        "The user belonging to this token no longer exists.",
        401
      );
    }

    req.user = currentUser;
    req.tokenPayload = payload;
    next();
  } catch (error) {
    next(error);
  }
};

export const authorizeRole = (...roles: UserRole[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      next(
        new AppError(
          "You do not have permission to perform this action.",
          403
        )
      );
      return;
    }
    next();
  };
};
