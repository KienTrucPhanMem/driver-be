import axios from "axios";
import { Request, Response } from "express";
import {
  createPassengerRequest,
  getPassengerRequest,
  updatePassengerRequest,
} from "../../services/passengerRequest.service";
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
import { RequestStatus } from "../../models/PassengerRequest";
import { getDistanceFromLatLonInKm } from "../../helpers";

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
      let booking = await createPassengerRequest(data);

      let drivers = await getUsers({
        FCM_token: { $ne: null as any },
        isActive: true,
      });

      let distance = 0.5;

      do {
        drivers = drivers.filter(
          (driver) =>
            getDistanceFromLatLonInKm(
              Number(driver.latitude) as any,
              Number(driver.longitude) as any,
              Number(booking?.from.latitude) as any,
              Number(booking?.from.longitude) as any
            ) <= distance
        );

        distance += 0.5;

        if (distance > 5) break;
      } while (drivers.length <= 0);

      const FCM_tokens = drivers.reduce((acc: string[], driver) => {
        if (driver.FCM_token) acc.push(driver.FCM_token);

        return acc;
      }, []);

      await axios.post(
        "https://exp.host/--/api/v2/push/send",
        JSON.stringify({
          to: FCM_tokens,
          sound: "default",
          title: "KTPM Driver",
          body: "Có khách đặt xe",
          data: booking,
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
      console.log(err);
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

  async acceptBooking(req: Request, res: Response) {
    const { driverId, bookingId } = req.body as any;

    try {
      const booking = await getPassengerRequest({ _id: bookingId });

      if (booking && booking.status !== RequestStatus.FINDING) {
        return BadRequestResponse(res, "Invalid status");
      }

      let updatedUser = await updatePassengerRequest(
        { _id: bookingId },
        {
          driverId,
          status: RequestStatus.ACCEPTED,
        }
      );

      await axios.post(
        "https://ktpm-user.herokuapp.com/api/passengers/push-notification",
        updatedUser
      );

      console.log(2);

      return SuccessResponse(res, updatedUser);
    } catch (err: any) {
      console.log(err);
      return ErrorResponse(res, err);
    }
  },

  async doneBooking(req: Request, res: Response) {
    const { bookingId } = req.body as any;

    try {
      let updatedUser = await updatePassengerRequest(
        { _id: bookingId },
        {
          status: RequestStatus.DONE,
        }
      );

      await axios.post(
        "https://ktpm-user.herokuapp.com/api/passengers/push-notification",
        updatedUser
      );

      return SuccessResponse(res, updatedUser);
    } catch (err: any) {
      return ErrorResponse(res, err.message);
    }
  },

  async cancelBooking(req: Request, res: Response) {
    const { bookingId, driverId } = req.body as any;

    try {
      let drivers = await getUsers({
        FCM_token: { $ne: null as any },
        isActive: true,
        _id: { $ne: driverId },
      });
      let booking = await getPassengerRequest({ _id: bookingId });

      let distance = 0.5;

      do {
        drivers = drivers.filter(
          (driver) =>
            getDistanceFromLatLonInKm(
              Number(driver.latitude) as any,
              Number(driver.longitude) as any,
              Number(booking?.from.latitude) as any,
              Number(booking?.from.longitude) as any
            ) <= distance
        );

        distance += 0.5;

        if (distance > 5) break;
      } while (drivers.length <= 0);

      const FCM_tokens = drivers.reduce((acc: string[], driver) => {
        if (driver.FCM_token) acc.push(driver.FCM_token);

        return acc;
      }, []);

      await axios.post(
        "https://exp.host/--/api/v2/push/send",
        JSON.stringify({
          to: FCM_tokens,
          sound: "default",
          title: "Original Title",
          body: "And here is the body!",
          data: booking,
        }),
        {
          headers: {
            Accept: "application/json",
            "Accept-encoding": "gzip, deflate",
            "Content-Type": "application/json",
          },
        }
      );

      await axios.post(
        "https://ktpm-user.herokuapp.com/api/passengers/push-notification",
        {
          code: "DRIVER_CANCEL",
        }
      );

      return SuccessResponse(res, "ok");
    } catch (err: any) {
      console.log(err);
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
