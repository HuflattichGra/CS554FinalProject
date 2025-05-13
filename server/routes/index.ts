import userRoutes from "./users";
import postRoutes from "./posts";
import commentRoutes from "./comments";
import imageRoutes from "./image";
import conventionsRouter from "./conventions.js";
import paymentRoutes from "./payment";

const constructorMethod = (app: any) => {
  app.use("/", userRoutes);
  app.use("/posts", postRoutes);
  app.use("/comments", commentRoutes);
  app.use("/conventions", conventionsRouter);
  app.use("/image", imageRoutes);
  app.use("/payment", paymentRoutes);
};

export default constructorMethod;
