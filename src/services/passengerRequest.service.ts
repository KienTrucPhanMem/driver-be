import { FilterQuery } from "mongoose";
import PassengerRequest, {
  IPassengerRequest,
} from "../models/PassengerRequest";
import { processFilterOptions } from "../commons/functions";
import { CreateInput, FilterOptions, UpdateInput } from "../commons/interfaces";

export function getPassengerRequests(
  filter: FilterQuery<IPassengerRequest> = {},
  options: Omit<FilterOptions<IPassengerRequest>, "select"> = {}
) {
  let query = PassengerRequest.find(filter);

  query = processFilterOptions(query, options);

  return query.lean();
}

export function getPassengerRequest(
  filter: FilterQuery<IPassengerRequest> = {},
  options: Omit<FilterOptions<IPassengerRequest>, "select"> = {}
) {
  let query = PassengerRequest.findOne(filter);

  query = processFilterOptions(query, options);

  return query.lean();
}

export async function createPassengerRequest(
  data: CreateInput<IPassengerRequest>,
  options: Omit<FilterOptions<IPassengerRequest>, "select"> = {}
) {
  let user = await PassengerRequest.create(data);
  return getPassengerRequest({ _id: user._id }, options);
}

export async function updatePassengerRequest(
  filter: FilterQuery<IPassengerRequest>,
  data: UpdateInput<IPassengerRequest>,
  options: Omit<FilterOptions<IPassengerRequest>, "select"> = {}
) {
  let user = await PassengerRequest.findOneAndUpdate(filter, data, {
    new: true,
    lean: true,
  });
  return getPassengerRequest({ _id: user._id }, options);
}
