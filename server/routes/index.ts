import userRoutes from './users';
import postRoutes from './posts';
import commentRoutes from './comments';

const constructorMethod = (app : any) => {
        app.use('/posts',postRoutes);
        app.use('/comments',commentRoutes);
        app.use('/', userRoutes);
    };


export default constructorMethod;