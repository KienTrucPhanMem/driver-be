import { FilterQuery } from "mongoose";
import { processFilterOptions } from "../commons/functions";
import { CreateInput, FilterOptions, UpdateInput } from "../commons/interfaces";
import User, { IDriver } from "../models/Driver";

export async function isUserExist(options: {
  id?: IDriver["_id"];
  phoneNumber?: IDriver["_id"];
}): Promise<boolean> {
  try {
    let exists = await User.exists({
      $or: [{ _id: options.id }, { phone: options.phoneNumber }],
    });
    return exists;
  } catch (e: any) {
    console.error(e);
    return false;
  }
}

export function getUsers(
  filter: FilterQuery<IDriver> = {},
  options: Omit<FilterOptions<IDriver>, "select"> = {}
) {
  let query = User.find(filter);

  (options as FilterOptions<IDriver>).select = "-password";
  query = processFilterOptions(query, options);

  return query.lean();
}

export function getUser(
  filter: FilterQuery<IDriver> = {},
  options: Omit<FilterOptions<IDriver>, "select"> = {},
  includePassword: boolean = false
) {
  let query = User.findOne(filter);

  if (!includePassword)
    (options as FilterOptions<IDriver>).select = "-password";
  query = processFilterOptions(query, options);

  return query.lean();
}

export async function createUser(
  data: CreateInput<IDriver>,
  options: Omit<FilterOptions<IDriver>, "select"> = {},
  includePassword: boolean = false
) {
  let user = await User.create(data);
  return getUser({ _id: user._id }, options, includePassword);
}

export async function updateUser(
  filter: FilterQuery<IDriver>,
  data: UpdateInput<IDriver>,
  options: Omit<FilterOptions<IDriver>, "select"> = {},
  allowUpdatePhone: boolean = false,
  includePassword: boolean = false
) {
  if (!allowUpdatePhone) delete data.phone;

  let user = await User.findOneAndUpdate(filter, data, {
    new: true,
    lean: true,
  });

  if (user) return getUser({ _id: user._id }, options, includePassword);
  else return null;
}

export async function upsertUserByPhone(
  filter: Pick<IDriver, "phone">,
  data: UpdateInput<IDriver>,
  options: Omit<FilterOptions<IDriver>, "select"> = {},
  includePassword: boolean = false
) {
  data.phone = filter.phone;

  let user = await User.findOneAndUpdate(filter, data, {
    upsert: true,
    new: true,
    lean: true,
  });
  return getUser({ _id: user._id }, options, includePassword);
}

export async function deleteUser(
  filter: FilterQuery<IDriver>,
  deleteBy: IDriver["_id"],
  includePassword: boolean = false
) {
  let user = await getUser(filter, {}, includePassword);
  await User.delete(filter, deleteBy);
  return user;
}

export async function countUser(filter: FilterQuery<IDriver>) {
  let count = await User.countDocuments(filter);
  return count;
}
