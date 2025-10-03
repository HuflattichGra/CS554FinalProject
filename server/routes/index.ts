import userRoutes from "./users.js";
import postRoutes from './posts.js';
import commentRoutes from './comments.js';
import imageRoutes from './image.js';
import conventionsRouter from "./conventions.js";
import paymentRoutes from "./payment.js";

const constructorMethod = (app: any) => {
  app.use("/", userRoutes);
  app.use("/posts", postRoutes);
  app.use("/comments", commentRoutes);
  app.use("/conventions", conventionsRouter);
  app.use("/image", imageRoutes);
  app.use("/payment", paymentRoutes);
};

export default constructorMethod;
