import axios from "axios";
import { Request, Response } from "express";
import {
  BadRequestResponse,
  ErrorResponse,
  NotFoundResponse,
  SuccessResponse,
} from "../../helpers/response";
import { IDriver } from "../../models/Driver";
import {
  createUser,
  deleteUser,
  getUser,
  getUsers,
  updateUser,
} from "../../services/driver.service";

const userController = {
  async get(_: Request, res: Response) {
    try {
      let users = await getUsers();

      return SuccessResponse(res, users);
    } catch (err: any) {
      return ErrorResponse(res, err.message);
    }
  },

  async getById(req: Request, res: Response) {
    try {
      let id = req.params.id;

      let user = await getUser({ _id: id });
      return SuccessResponse(res, user);
    } catch (e: any) {
      return ErrorResponse(res, e.message);
    }
  },

  async getByPhone(req: Request, res: Response) {
    let phone = req.params.phone || undefined;

    if (!phone) return BadRequestResponse(res, "Invalid phone number");

    let user = await getUser({ phone: phone });

    return SuccessResponse(res, user);
  },

  async post(req: Request, res: Response) {
    let data = req.body as IDriver;

    // Check & validate phone number
    if (!data.phone) {
      return BadRequestResponse(res, "Phone is invalid");
    }

    // Create user
    try {
      let exitsUser = await getUser({ phone: data.phone });

      if (exitsUser) {
        return BadRequestResponse(res, "Phone is used");
      }

      let user = await createUser(data);
      return SuccessResponse(res, user);
    } catch (err: any) {
      return ErrorResponse(res, err.message);
    }
  },

  async booking(req: Request, res: Response) {
    let data = req.body;

    // Create user
    try {
      let drivers = await getUsers({ FCM_token: { $ne: undefined } });
      const FCM_tokens = drivers.reduce((acc: string[], driver) => {
        if (driver.FCM_token) acc.push(driver.FCM_token);

        return acc;
      }, []);

      axios.post(
        "https://exp.host/--/api/v2/push/send",
        JSON.stringify({
          to: FCM_tokens,
          sound: "default",
          title: "Original Title",
          body: "And here is the body!",
          data: data,
        }),
        {
          headers: {
            Accept: "application/json",
            "Accept-encoding": "gzip, deflate",
            "Content-Type": "application/json",
          },
        }
      );

      return SuccessResponse(res, "ok");
    } catch (err: any) {
      return ErrorResponse(res, err.message);
    }
  },

  async put(req: Request, res: Response) {
    const { id } = req.params;

    try {
      let data = req.body as IDriver;

      let updatedUser = await updateUser({ _id: id }, data);
      return SuccessResponse(res, updatedUser);
    } catch (err: any) {
      return ErrorResponse(res, err.message);
    }
  },

  async delete(req: Request, res: Response) {
    let id = req.params.id;
    try {
      let user = await getUser({ _id: id });

      if (!user) return NotFoundResponse(res, "User not found");

      await deleteUser({ _id: id }, req.user!);

      return SuccessResponse(res, user);
    } catch (err: any) {
      return ErrorResponse(res, err.message);
    }
  },
};

export default userController;
