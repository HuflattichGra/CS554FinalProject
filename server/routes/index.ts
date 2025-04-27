import userRoutes from './users';
import postRoutes from './posts';
import commentRoutes from './comments';
import conventionsRouter from './conventions.js';

const constructorMethod = (app : any) => {
        app.use('/posts',postRoutes);
        app.use('/comments',commentRoutes);
        app.use('/conventions', conventionsRouter);
        app.use('/', userRoutes);
    };


export default constructorMethod;