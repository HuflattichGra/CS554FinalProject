import React from 'react';
import { useEffect, useState, useContext } from 'react';
import axios from 'axios';

import userContext from "../../context/userContext";
import PostView from '../Posts/PostView';
import { useParams } from 'react-router-dom';
import { API_BASE } from '../../api';
import { Heart } from 'lucide-react';
import styles from "./PostView.module.css";

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

            if (userData.data) {
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
                            {comments.map((x: any) =>
                                <div key={x._id} className={`Post ${styles.container}`}>
                                    <p>{x.text}</p>
                                    <div className={styles.flexContainer}>
                                    {user? 
                                    <button
                                    name="likeButton"
                                    className={styles.actionButton}
                                    onClick={async (e: any) => {
                                        e.preventDefault();
                                        if (x.likes.includes(user?._id)) {
                                            let newLikes: Array<string> = x.likes.filter(
                                                (like: string) => like !== user?._id
                                            );

                                            const newComment = await axios.patch(
                                                `${API_BASE}/comments/${x._id}`,
                                                {
                                                    likes: newLikes,
                                                }
                                            );

                                            var newComments = [...comments]

                                            for (let i = 0; i < comments.length; i++) {
                                                if (comments[i]._id == x._id) {
                                                    newComments[i] = newComment.data;
                                                }
                                            }

                                            setComments(newComments);
                                        } else {
                                            let newLikes: Array<string> = [...x.likes, user?._id!];

                                            const newComment = await axios.patch(
                                                `${API_BASE}/comments/` + x._id,
                                                {
                                                    likes: newLikes,
                                                }
                                            );
                                            // Right now the patch will return a 401 because the admin file is set to false
                                            /*
                                            // Get user's current likes array
                                            const userResponse = await axios.get(
                                                `${API_BASE}/user/${user?._id}`
                                            );
                                            const currentUserLikes = userResponse.data.likes || [];
                                
                                            // Add this post to user's likes
                                            const updatedUserLikes = [...currentUserLikes, props._id];
                                
                                            // Update user's likes array
                                            await axios.patch(`${API_BASE}/user/${user?._id}`, {
                                                likes: updatedUserLikes,
                                            });
                                            */
                                            var newComments = [...comments]


                                            for (let i = 0; i < comments.length; i++) {
                                                if (comments[i]._id == x._id) {
                                                    newComments[i] = newComment.data;
                                                }
                                            }

                                            setComments(newComments);
                                        }
                                    }}>
                                        {x.likes.includes(user?._id) ? <Heart size={20} fill="#F87171" color="#F87171" /> : <Heart size={20} />}
                                    </button> : <Heart size={20} /> }
                                    <p className='likeCount'>{x.likes.length}</p>
                                    </div>
                                </div>

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