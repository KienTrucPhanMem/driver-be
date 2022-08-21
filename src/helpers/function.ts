import axios from "axios";
import { getUsers } from "src/services/driver.service";
import { createPassengerRequest } from "src/services/passengerRequest.service";
import moment from "../configs/moment";

export function foreach<T>(
  array: T[],
  callback: (item: T, index: number, array: T[]) => any
) {
  try {
    for (let i = 0; i < array.length; i++) {
      callback(array[i], i, array);
    }
  } catch (ex) {
    throw ex;
  }
}

export async function asyncForeach<T>(
  array: T[],
  callback: (item: T, index: number, array: T[]) => any
) {
  try {
    for (let i = 0; i < array.length; i++) {
      await callback(array[i], i, array);
    }
  } catch (ex) {
    throw ex;
  }
}

export async function asyncMap<T>(
  array: T[],
  callback: (item: T, index: number, array: T[]) => any
) {
  try {
    let newArr = Array(array.length);
    for (let i = 0; i < array.length; i++) {
      newArr[i] = await callback(array[i], i, array);
    }
    return newArr;
  } catch (ex) {
    throw ex;
  }
}

export function chunks(array: any[], size: number) {
  return Array.from(new Array(Math.ceil(array.length / size)), (_, i) =>
    array.slice(i * size, i * size + size)
  );
}

export function removeEmptyOrNull(obj: any) {
  Object.keys(obj).forEach(
    (k) =>
      (obj[k] && typeof obj[k] === "object" && removeEmptyOrNull(obj[k])) ||
      (!obj[k] && delete obj[k])
  );
  return obj;
}

export function mergeDeep(target: any, source: any, isMergingArrays = false) {
  target = ((obj) => {
    let cloneObj;
    try {
      cloneObj = JSON.parse(JSON.stringify(obj));
    } catch (err) {
      // If the stringify fails due to circular reference, the merge defaults
      //   to a less-safe assignment that may still mutate elements in the target.
      // You can change this part to throw an error for a truly safe deep merge.
      cloneObj = Object.assign({}, obj);
    }
    return cloneObj;
  })(target);

  const isObject = (obj: any) => obj && typeof obj === "object";

  if (!isObject(target) || !isObject(source)) return source;

  Object.keys(source).forEach((key) => {
    const targetValue = target[key];
    const sourceValue = source[key];

    if (Array.isArray(targetValue) && Array.isArray(sourceValue))
      if (isMergingArrays) {
        target[key] = targetValue.map((x, i) =>
          sourceValue.length <= i
            ? x
            : module.exports.mergeDeep(x, sourceValue[i], isMergingArrays)
        );
        if (sourceValue.length > targetValue.length)
          target[key] = target[key].concat(
            sourceValue.slice(targetValue.length)
          );
      } else {
        target[key] = targetValue.concat(sourceValue);
      }
    else if (isObject(targetValue) && isObject(sourceValue))
      target[key] = module.exports.mergeDeep(
        Object.assign({}, targetValue),
        sourceValue,
        isMergingArrays
      );
    else target[key] = sourceValue;
  });

  return target;
}

/**
 * Transform Date object into formatted string.
 * For more format info, visit: https://momentjs.com/docs/#/displaying/format/
 * @param date JavaScript's Date object
 * @param format string format, i.e. YYYY-MM-DD HH:mm:ss.SSS
 * @returns
 */
export function formatDate(date: Date, format: string) {
  return moment(date).format(format);
}

export function generateNumber(length: number): number;
export function generateNumber(length: number, returnString: false): number;
export function generateNumber(length: number, returnString: true): string;
export function generateNumber(
  length: number,
  returnString: boolean = false
): string | number {
  let num = Math.floor(Math.random() * Math.pow(10, length));
  if (returnString) {
    let str = new Array(length + 1).join("0");
    return (str + num).slice(-length);
  }
  return num;
}

export function generateString(
  length: number,
  allowRepeat: boolean = true,
  caseSensitive: boolean = false,
  includeNumber: boolean = false,
  includeSpecialCharacter: boolean = false
): string {
  let result = "";

  let characters = "abcdefghijklmnopqrstuvwxyz";
  if (caseSensitive) characters += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  if (includeNumber) characters += "0123456789";
  if (includeSpecialCharacter) characters += " !@#$%^&*()+-.,/:;<=>?_~";

  for (var i = 0; i < length; i++) {
    let character = characters.charAt(
      Math.floor(Math.random() * characters.length)
    );
    if (!allowRepeat) characters.replace(character, "");
    result += character;
  }
  return result;
}

export function generateUniqueString(): string {
  let ts = new Date().getTime().toString();
  let out = "";
  let i = 0;

  while (i < ts.length) {
    let gap = 4;
    if (parseInt(ts.substring(i, i + gap)) > 1295) gap = 3;

    out += parseInt(ts.substring(i, i + gap)).toString(36);
    i += gap;
  }

  return out.toUpperCase();
}

export async function booking(data: any) {
  // Create user
  let booking = await createPassengerRequest(data);

  let drivers = await getUsers({ FCM_token: { $ne: null as any } });
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
}
