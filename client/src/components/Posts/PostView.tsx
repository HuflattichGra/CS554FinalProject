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

interface PostViewProps {
    props: Post;
    notifyParent?: () => void;
}


//Reusable component for anytime a post needs to be displayed on a page
//Props should accept an object with the following fields
const PostView: React.FC<PostViewProps> = ({props, notifyParent = () => {}}) => {
    const [post, setPost] = useState(props);
    const [loading, setLoading] = useState(true);
    const [poster, setPoster] = useState<any>(undefined);
    const [bookmarked, setBookmarked] = useState(false);
    const [liked, setLiked] = useState(false);
    const [postImages, setPostImages] = useState<string[]>([]);
    const [convention, setConvention] = useState<any>(null);
    const { user, setUser } = React.useContext(userContext);
    useEffect(() => {
        async function fetchData() {
            try {
                const userData = await axios.get(
                    `${API_BASE}/user/${props.userID}`,
                    { withCredentials: true }
                );
                  // Process only the first image if any exist in the post
                if (props.images && props.images.length > 0) {
                    // Create image URL for the first image only
                    const firstImageId = props.images[0];
                    setPostImages([`${API_BASE}/image/download/${firstImageId}`]);
                }
                
                setPoster(userData.data);
                
                // Fetch convention data if conventionID exists
                if (props.conventionID) {
                    try {
                        const conventionData = await axios.get(
                            `${API_BASE}/conventions/${props.conventionID}`,
                            { withCredentials: true }
                        );
                        setConvention(conventionData.data);
                    } catch (err) {
                        console.log("Error fetching convention data:", err);
                    }
                }
                
                setLoading(false);
                
                // Check if user is logged in
                if (user && user._id) {
                    // Check if post is liked by current user
                    setLiked(post.likes?.includes(user._id) || false);
                    
                    // Check if post is bookmarked by current user
                    setBookmarked(user.bookmarks.includes(props._id) || false);
                }
                
            } catch (e) {
                console.log(e)
                setPoster("Not Found");
                setLoading(false);
            }        
        }
        fetchData();
    }, [props.userID, user, post.likes, props._id, props.images, props.conventionID]);
    
    const onSubmitLikes: any = async (e: any) => {
        e.preventDefault();
        if(!user){return;}
        if (post.likes.includes(user?._id)) {

            const newUser = await axios.patch(
                `${API_BASE}/user/${user?._id}`,
                {
                    likes: post._id,
                }, 
                {
                    withCredentials: true,
                }
            );

            setUser(newUser.data)
            setPost({...post, likes: post.likes.filter((userId: string) => userId !== user?._id)});
            setLiked(false);
            notifyParent();
        } else {
            let newLikes: Array<string> = [...post.likes, user?._id!];

            const newUser = await axios.patch(
                `${API_BASE}/user/${user?._id}`,
                {
                    likes: post._id,
                }, 
                {
                    withCredentials: true,
                }
            );

            setUser(newUser.data)
            setPost({...post, likes: newLikes});
            setLiked(true);
            notifyParent()
        }
    };
    const onSubmitBookmark: any = async (e: any) => {
        e.preventDefault();
        try {
            // Update user's bookmarks array
            let newUser = await axios.patch(`${API_BASE}/user/${user?._id}`, {
                bookmarks: post._id,
            }, 
            {
                withCredentials: true,
            });

            //Update User context
            setUser(newUser.data);

            // Toggle the bookmarked state
            setBookmarked(!bookmarked);
            notifyParent();
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
        return (
            <div className={`Post ${styles.container}`}>
                <div className={styles.topOfPost}>
                    <Link to={`/user/${post.userID}`}>
                        <div className={styles.userInfo}>
                            <User size={18} className={styles.userIcon} />
                            <p>{poster.username}</p>
                        </div>
                    </Link>
                    {convention && (
                        <Link to={`/conventions/${post.conventionID}`} className={styles.conventionLink}>
                            <p>#{convention.name}</p>
                        </Link>
                    )}
                    { user ? 
                    <form id="bookmark" onSubmit={onSubmitBookmark}>
                        <button onClick={onSubmitBookmark} className={styles.actionButton}>
                            {bookmarked ? <BookmarkCheck size={20} color="#646cff" /> : <Bookmark size={20} color="#1F1F1F" />}
                        </button>
                    </form> : <></>}
                </div>
                <Link to={`/posts/${post._id}`} className={styles.postContent}>
                    <p>{post.text}</p>
                    {postImages.length > 0 && (
                        <div className={styles.postImagesContainer}>
                            <img 
                                src={postImages[0]} 
                                alt="Post image" 
                                className={styles.postImage}
                                loading="lazy"
                            />
                        </div>
                    )}
                </Link>
                {user ? (
                    <div className={styles.flexContainer}>
                        <button onClick={onSubmitLikes} name="likeButton" className={styles.actionButton}>
                            {liked ? <Heart size={20} fill="#F87171" color="#F87171" /> : <Heart size={20} color="#333333" />}
                        </button>
                        <button className={styles.likeCount}>{post.likes?.length || 0}</button>
                    </div>
                ) :  <div className={styles.flexContainer}><Heart color="#333333" size={20}></Heart> <button className={styles.likeCount}>{post.likes?.length || 0}</button> </div>}
            </div>
        );
    }
};

export default PostView;
