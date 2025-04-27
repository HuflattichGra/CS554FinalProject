import userRoutes from "./users";
import postRoutes from "./posts";
import commentRoutes from "./comments";
import imageRoutes from "./image";

const constructorMethod = (app: any) => {
  app.use("/", userRoutes);
  app.use("/posts", postRoutes);
  app.use("/comments", commentRoutes);
  app.use("/image", imageRoutes);
};

export default constructorMethod;
