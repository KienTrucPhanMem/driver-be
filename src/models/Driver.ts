import { model, Schema, Document } from "mongoose";
import { SoftDeleteModel } from "mongoose-delete";

export enum Gender {
  MALE = "MALE",
  FEMALE = "FEMALE",
}

export interface IDriver extends Document {
  phone: string;
  fullName: string;
  email?: string;
  gender: Gender;
  FCM_token?: string;
}

const DriverSchema = new Schema<IDriver>(
  {
    phone: {
      type: String,
      required: true,
      unique: true,
      validate: {
        validator: (value: string) =>
          RegExp(/^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-s./0-9]*$/).test(value),
        message: (props) => `${props.value} is not a valid phone number`,
      },
    },
    fullName: { type: String, required: true },
    email: { type: String },
    gender: {
      type: String,
      enum: Gender,
      required: true,
      default: Gender.MALE,
    },
    FCM_token: { type: String },
  },
  {
    timestamps: true,
  }
);

const Driver = model<IDriver>(
  "Driver",
  DriverSchema
) as SoftDeleteModel<IDriver>;
export default Driver;
