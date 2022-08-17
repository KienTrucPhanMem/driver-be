import { Request } from "express";
import { PassportStatic } from "passport";
import { Strategy, ExtractJwt, VerifiedCallback } from "passport-jwt";
import User, { IDriver } from "../models/Driver";

declare global {
  namespace Express {
    interface User extends IDriver {}
  }
}

const passportJwt = (passport: PassportStatic) => {
  passport.use(
    new Strategy(
      {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: process.env.SECRET_KEY,
        algorithms: ["HS256"],
        passReqToCallback: true,
      },
      (req: Request, jwt_payload: any, done: VerifiedCallback) => {
        User.findById(jwt_payload._id)
          .exec()
          .then((user) => {
            if (!user) return done(null, false);
            req.user = user;
            return done(null, user);
          })
          .catch((err) => {
            return done(err, false);
          });
      }
    )
  );

  passport.serializeUser((user: any, done: any) => {
    done(null, user.id);
  });

  passport.deserializeUser((id: any, done: any) => {
    User.findById(id)
      .exec()
      .then((user) => {
        if (!user) return done(null, false);
        return done(null, user);
      })
      .catch((err) => {
        return done(err, false);
      });
  });
};

module.exports = passportJwt;
