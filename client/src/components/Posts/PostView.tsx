import React from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import { useContext, useEffect, useState } from "react";
import userContext from "../../context/userContext";
import "../../App.css";
import styles from "./PostView.module.css";
import { API_BASE } from "../../api";
import { Heart, Bookmark, BookmarkCheck, User } from "lucide-react";

interface Post {
    _id: string;
    conventionID: string;
    userID: string;
    text: string;
    images: Array<string>;
    likes: Array<string>;
}

//Reusable component for anytime a post needs to be displayed on a page
//Props should accept an object with the following fields
const PostView: React.FC<Post> = (props: any) => {
    const [post, setPost] = useState(props);
    const [loading, setLoading] = useState(true);
    const [poster, setPoster] = useState<any>(undefined);
    const [bookmarked, setBookmarked] = useState(false);
    const [liked, setLiked] = useState(false);
    const [images, setImages] = useState<any>([]);
    const { user } = React.useContext(userContext);
    useEffect(() => {
        async function fetchData() {
            try {
                const userData = await axios.get(
                    `${API_BASE}/user/${props.userID}`
                );

                // let images : any = [];

                // for(let x:number=0;x<props.images.length;x++){
                //     images.push(await axios.get(`${API_BASE}/image/download/${props.images[0]}`));
                // }
                
                setPoster(userData.data);
                setLoading(false);
                
                // Check if user is logged in
                if (user && user._id) {
                    // Check if post is liked by current user
                    setLiked(post.likes?.includes(user._id) || false);
                    
                    // Check if post is bookmarked by current user
                    const currentUserData = await axios.get(`${API_BASE}/user/${user._id}`);
                    const userBookmarks = currentUserData.data.bookmarks || [];
                    setBookmarked(userBookmarks.includes(props._id) || false);
                }
                
            } catch (e) {
                console.log(e)
                setPoster("Not Found");
                setLoading(false);
            }
        }
        fetchData();
    }, [props.userID, user, post.likes, props._id]);
    const onSubmitLikes: any = async (e: any) => {
        e.preventDefault();
        if (post.likes.includes(user?._id)) {
            let newLikes: Array<string> = post.likes.filter(
                (like: string) => like !== user?._id
            );

            const newPost = await axios.patch(
                `${API_BASE}/posts/${props._id}`,
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

            // Remove this post from user's likes
            const updatedUserLikes = currentUserLikes.filter(
                (like: string) => like !== props._id
            );

            // Update user's likes array
            await axios.patch(`${API_BASE}/user/${user?._id}`, {
                likes: updatedUserLikes,
            });
            */

            setPost(newPost.data);
            setLiked(false);
        } else {
            let newLikes: Array<string> = [...post.likes, user?._id!];

            const newPost = await axios.patch(
                `${API_BASE}/posts/${props._id}`,
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

            setPost(newPost.data);
            setLiked(true);
        }
    };
    const onSubmitBookmark: any = async (e: any) => {
        e.preventDefault();
        try {
            // Get user's current bookmarks array
            const userResponse = await axios.get(`${API_BASE}/user/${user?._id}`);
            const currentBookmarks = userResponse.data.bookmarks || [];

            let updatedBookmarks;
            if (currentBookmarks.includes(props._id)) {
                // Remove this post from bookmarks if it's already bookmarked
                updatedBookmarks = currentBookmarks.filter(
                    (bookmark: string) => bookmark !== props._id
                );
            } else {
                // Add this post to bookmarks if it's not bookmarked
                updatedBookmarks = [...currentBookmarks, props._id];
            }

            // Update user's bookmarks array
            await axios.patch(`${API_BASE}/user/${user?._id}`, {
                bookmarks: updatedBookmarks,
            });

            // Toggle the bookmarked state
            setBookmarked(!bookmarked);
            
            //alert(currentBookmarks.includes(props._id) ? "Post unbookmarked!" : "Post bookmarked!");
        } catch (error) {
            console.error("Error updating bookmarks:", error);
            alert("Failed to update bookmarks");
        }
    };

    if (loading) {
        return (
            <div>
                <p>loading...</p>
            </div>
        );
    } else if (poster === "Not Found") {
        return <p>Error: 404 Not Found</p>;
    } else {
        return (            <div className={`Post ${styles.container}`}>
                <div className={styles.topOfPost}>
                    <Link to={`/user/${post.userID}`}>
                        <div className={styles.userInfo}>
                            <User size={18} className={styles.userIcon} />
                            <p>{poster.username}</p>
                        </div>
                    </Link>
                    <form id="bookmark" onSubmit={onSubmitBookmark}>
                        <button onClick={onSubmitBookmark} className={styles.actionButton}>
                            {bookmarked ? <BookmarkCheck size={20} color="#4F46E5" /> : <Bookmark size={20} />}
                        </button>
                    </form>
                </div>
                <Link to={`/posts/${post._id}`} className={styles.postContent}>
                    <p>{post.text}</p>
                </Link>
                {user ? (
                    <div className={styles.flexContainer}>
                        <button onClick={onSubmitLikes} name="likeButton" className={styles.actionButton}>
                            {liked ? <Heart size={20} fill="#F87171" color="#F87171" /> : <Heart size={20} />}
                        </button>
                        <button className={styles.likeCount}>{post.likes?.length || 0}</button>
                    </div>
                ) : null}
            </div>
        );
    }
};

export default PostView;
