import { model, Schema, Document } from "mongoose";
import { SoftDeleteModel } from "mongoose-delete";

export interface IAddress {
  address: string;
  longitude: string;
  latitude: string;
}

export enum RequestStatus {
  FINDING,
  ACCEPTED,
  DONE,
  CANCELED,
}

export interface IPassengerRequest extends Document {
  passengerId: string;
  from: IAddress;
  to: IAddress;
  status: RequestStatus;
  driverId?: string;
  cost: number;
}

const PassengerRequestSchema = new Schema<IPassengerRequest>(
  {
    passengerId: { type: String, required: true },
    driverId: { type: String },
    from: { type: Schema.Types.Mixed, required: true },
    to: { type: Schema.Types.Mixed, required: true },
    status: {
      type: Number,
      enum: RequestStatus,
      default: RequestStatus.FINDING,
    },
    cost: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

const PassengerRequest = model<IPassengerRequest>(
  "PassengerRequest",
  PassengerRequestSchema
) as SoftDeleteModel<IPassengerRequest>;
export default PassengerRequest;
