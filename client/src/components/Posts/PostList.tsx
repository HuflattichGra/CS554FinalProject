import React from 'react';
import { useEffect, useState, useContext } from 'react';
import axios from 'axios';

import userContext from "../../context/userContext";
import PostView from '../Posts/PostView';
import PostModal from '../Posts/PostModal';
import { API_BASE } from '../../api';

interface Post {
    _id: string;
    conventionID: string;
    userID: string;
    text: string;
    images: Array<string>;
    likes: Array<string>;
}


const PostList: React.FC = () => {

    const { user } = useContext(userContext);
    
    const [dataType, setDataType] = useState("posts");
    const [loading, setLoading] = useState(true)
    const [posts, setPosts] = useState<Post[]>([]);
    const [showModal, setShowModal] = useState(false);

    const fetchData = async () => {
        try{
            const userData = await axios.get(`${API_BASE}/posts`)

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

    if(loading){
        return(<div>Loading...</div>)
    }
    return (
        <>

            <div>
                <button onClick={() => setShowModal(true)}> Make a Post</button>
            </div>

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

export default PostList;