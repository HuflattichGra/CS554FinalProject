import userRoutes from "./users";
import imageRoutes from "./image";

const constructorMethod = (app: any) => {
  app.use("/", userRoutes);
  app.use("/image", imageRoutes);
};

export default constructorMethod;
