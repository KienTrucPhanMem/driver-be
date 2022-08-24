import axios from "axios";
import { NextFunction } from "express";
import { Response, Request } from "express";

export function validateToken(role: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    console.log("Role: ", role);

    try {
      const token = req.headers.authorization?.split(" ")[1];

      if (token) {
        console.log(token);

        //Validate by role
        const res = await axios.post(
          "https://ktpm-gateway.herokuapp.com/auth/validate-token",
          { token }
        );

        console.log(res);

        next();
      } else {
        return res.status(401).send("Unauthorized");
      }
    } catch (e: any) {
      console.log(e.message);

      return res.status(401).send("Unauthorized");
    }
  };
}
