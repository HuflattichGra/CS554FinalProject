import userRoutes from './users';

const constructorMethod = (app : any) => {
        app.use('/', userRoutes);
    };


export default constructorMethod;