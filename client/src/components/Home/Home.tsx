import React from 'react';

import userContext from "../../context/userContext";

const Home: React.FC = () => {

    const { user } = React.useContext(userContext);
    //check if user is null
    console.log('User:', user);


    return (
        <div style={{ textAlign: 'center', padding: '50px' }}>
            <h1>Welcome to Our Website</h1>
            <h1>{user?.username}</h1>
        </div>
    );
};

export default Home;