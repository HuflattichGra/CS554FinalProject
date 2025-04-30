import React from 'react';
import { useEffect, useState, useContext } from 'react';
import axios from 'axios';

import userContext from "../../context/userContext";
import PostView from '../Posts/PostView';
import PostModal from '../Posts/PostModal';

interface Post {
    _id: string;
    conventionID: string;
    userID: string;
    text: string;
    images: Array<string>;
    likes: Array<string>;
}


const Home: React.FC = () => {

    const { user } = useContext(userContext);
    
    const [dataType, setDataType] = useState("posts");
    const [loading, setLoading] = useState(true)
    const [posts, setPosts] = useState<Post[]>([]);
    const [showModal, setShowModal] = useState(false);

    const fetchData = async () => {
        try{
            const userData = await axios.get(`http://localhost:3000/posts`)

            setPosts(userData.data)
            setLoading(false)
        } catch (e){
            console.log(e);
            setPosts([])
            setLoading(false)
        }
    }
    useEffect(()=>{
        fetchData()
    }, [])

    const samplePost = {
        _id: "123",
        conventionID: "abc",
        userID: "6802c6b0b7787265600a974a",
        text: "This is a sample post",
        images: [],
        likes: ["123","456"],
    };

    if(loading){
        return(<div>Loading...</div>)
    }
    return (
        <>

            <div>
                <button onClick={() => setShowModal(true)}> Make a Post</button>
            </div>

            
            {/* {dataType === "posts" && (
                <>
                    <PostView
                        _id={samplePost._id}
                        conventionID={samplePost.conventionID}
                        userID={samplePost.userID}
                        text={samplePost.text}
                        images={samplePost.images}
                        likes={samplePost.likes}
                    />
                    <PostView
                        _id={samplePost._id}
                        conventionID={samplePost.conventionID}
                        userID={samplePost.userID}
                        text={samplePost.text}
                        images={samplePost.images}
                        likes={samplePost.likes}
                    />
                </>
            )} */}
            {posts && posts.map((post: Post) => (
                <PostView
                    key={post._id}
                    _id={post._id}
                    conventionID={post.conventionID}
                    userID={post.userID}
                    text={post.text}
                    images={post.images}
                    likes={post.likes}
                />
            ))}

            {showModal && (
                <PostModal
                    isOpen={showModal}
                    onClose={() => setShowModal(false)}
                    onPostCreated={fetchData}
                />
            )}

        </>
    );
};

export default Home;