import React from 'react';
import { useEffect, useState, useContext } from 'react';
import axios from 'axios';

import userContext from "../../context/userContext";
import PostView from '../Posts/PostView';
import { useParams } from 'react-router-dom';
import { API_BASE } from '../../api';

interface Post {
    _id: string;
    conventionID: string;
    userID: string;
    text: string;
    images: Array<string>;
    likes: Array<string>;
    createdAt: string;
    conventionName?: string;
    posterName?: string;
}

const DetailPostView: React.FC = () => {
    const { user } = useContext(userContext);
    const [dataType, setDataType] = useState("posts");
    const [loading, setLoading] = useState(true);
    const [post, setPost] = useState<Post>();
    const [comments, setComments] = useState<any>([]);
    let id = useParams().id;

    const fetchData = async () => {
        try {
            const userData: any = await axios.get(`${API_BASE}/posts/${id}`);

            setPost(userData.data);

            if (post) {
                var commentFetch = await axios.get(`${API_BASE}/comments/posts/${id}`);

                setComments(commentFetch.data);
            }

            setLoading(false);
        } catch (e) {
            console.log(e);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        console.log(post)
    }, []);

    if (loading) {
        return (<div>Loading...</div>);
    }

    return (
        <>
            <div className="mb-4">
                {post ?
                    <div>
                        <PostView
                            key={post._id}
                            _id={post._id}
                            conventionID={post.conventionID}
                            userID={post.userID}
                            text={post.text}
                            images={post.images}
                            likes={post.likes}
                        />
                        <div id="CommentGroup">
                            {comments.map((x:any) => 
                                <p>{JSON.stringify(x)}</p>
                            
                            )}
                        </div>
                    </div>
                    :
                    <p>Failed to load post</p>
                }
            </div>
        </>
    );
};

export default DetailPostView;