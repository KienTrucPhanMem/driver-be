import { Request, Response } from "express";
import { hash } from "../../helpers/password";
import {
  BadRequestResponse,
  ErrorResponse,
  NotFoundResponse,
  SuccessResponse,
} from "../../helpers/response";
import { IPassenger } from "../../models/Passenger";
import {
  createUser,
  deleteUser,
  getUser,
  getUsers,
  updateUser,
} from "../../services/user.service";

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
    let data = req.body as IPassenger;

    // Check & validate phone number
    if (!data.phone) {
      return BadRequestResponse(res, req.__("Invalid phone number"));
    }

    // Hash password if any
    if (data.password) data.password = await hash(data.password);

    // Create user
    try {
      let exitsUser = await getUser({ phone: data.phone });

      if (exitsUser) {
        return BadRequestResponse(
          res,
          req.__("Số điện thoại này đã được sử dụng")
        );
      }

      let user = await createUser(data);
      return SuccessResponse(res, user);
    } catch (err: any) {
      return ErrorResponse(res, err.message);
    }
  },

  async put(req: Request, res: Response) {
    try {
      let data = req.body as IPassenger;

      // Hash password if any
      if (data.password) data.password = await hash(data.password);

      let updatedUser = await updateUser({ _id: req.user!._id }, data);
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
