import { Server as ServerHTTP } from "http";
import { Server } from "socket.io";
import { updateUser } from "../services/driver.service";

export const socket = (server: ServerHTTP) => {
  const io = new Server(server, {
    cors: {
      origin: "*",
    },
    path: "/drivers/socket",
  });

  io.on("connection", async (socket) => {
    console.log("Socket");

    socket.emit("TEST", "Hello");

    socket.on("join", async (userId: string) => {
      await updateUser({ _id: userId }, { isActive: true });

      socket.on("disconnect", async () => {
        await updateUser({ _id: userId }, { isActive: false });
      });

      socket.on("stop", async () => {
        await updateUser({ _id: userId }, { isActive: false });
      });

      socket.on("update-location", async ({ longitude, latitude }) => {
        await updateUser({ _id: userId }, { longitude, latitude });
      });
    });
  });
};
