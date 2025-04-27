import userRoutes from './users';
import postRoutes from './posts';
import commentRoutes from './comments';
import conventionRoutes from './conventions';

const constructorMethod = (app : any) => {
        app.use('/posts',postRoutes);
        app.use('/comments',commentRoutes);
        app.use('/conventions', conventionRoutes);
        app.use('/', userRoutes);
    };


export default constructorMethod;