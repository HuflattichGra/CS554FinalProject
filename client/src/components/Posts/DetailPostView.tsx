import React from 'react';
import { useEffect, useState, useContext } from 'react';
import axios from 'axios';

import userContext from "../../context/userContext";
import { useParams, Link } from 'react-router-dom';
import { API_BASE } from '../../api';
import styles from "./PostView.module.css";
import CommentModal from './CommentModal';
import { Heart, Bookmark, BookmarkCheck, User } from "lucide-react";

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
    const { user, setUser } = useContext(userContext);
    const [loading, setLoading] = useState(true);
    const [post, setPost] = useState<Post>();
    const [comments, setComments] = useState<any>([]);
    const [commenters, setCommenters] = useState<any>([]);
    const [showModal, setShowModal] = useState(false);
    const [poster, setPoster] = useState<any>(undefined);
    const [bookmarked, setBookmarked] = useState(false);
    const [liked, setLiked] = useState(false);
    const [postImages, setPostImages] = useState<string[]>([]);
    const [convention, setConvention] = useState<any>(null);
    let id = useParams().id;

    const fetchData = async () => {
        setLoading(true);
        try {
            const postData: any = await axios.get(`${API_BASE}/posts/${id}`);
            var newPost = postData.data;

            setPost(postData.data);


            if (newPost) {

                // Process only the first image if any exist in the post
                if (newPost.images && newPost.images.length > 0) {
                    // Create image URL for the first image only
                    const firstImageId = newPost.images[0];
                    setPostImages([`${API_BASE}/image/download/${firstImageId}`]);
                }

                const userData = await axios.get(
                    `${API_BASE}/user/${newPost.userID}`
                );

                setPoster(userData.data);

                // Fetch convention data if conventionID exists
                if (newPost.conventionID) {
                    try {
                        const conventionData = await axios.get(
                            `${API_BASE}/conventions/${newPost.conventionID}`
                        );
                        setConvention(conventionData.data);
                    } catch (err) {
                        console.log("Error fetching convention data:", err);
                    }
                }

                // Check if user is logged in
                if (user && user._id) {
                    // Check if post is liked by current user
                    setLiked(newPost.likes?.includes(user._id) || false);

                    // Check if post is bookmarked by current user
                    const currentUserData = await axios.get(`${API_BASE}/user/${user._id}`);
                    const userBookmarks = currentUserData.data.bookmarks || [];
                    setBookmarked(userBookmarks.includes(newPost._id) || false);
                }

                if (postData.data) {
                    var commentFetch = await axios.get(`${API_BASE}/comments/posts/${id}`);

                    setComments(commentFetch.data);


                    var commenters: any[] = [];
                    for (let i = 0; i < commentFetch.data.length; i++) {
                        var userfetch = await axios.get(`${API_BASE}/user/${commentFetch.data[i].userID}`);

                        commenters = [...commenters, userfetch.data];
                    }

                    setCommenters(commenters);
                }
            }

            setLoading(false);
        } catch (e) {
            console.log(e);
            setPoster("Not Found");
            setLoading(false);
        }
        setLoading(false);
    };



    const onSubmitBookmark: any = async (e: any) => {
        e.preventDefault();
        try {
            // Update user's bookmarks array
            let newUser = await axios.patch(`${API_BASE}/user/${user?._id}`, {
                bookmarks: post?._id,
            }, 
            {
                withCredentials: true,
            });

            //Update User context
            setUser(newUser.data);

            // Toggle the bookmarked state
            setBookmarked(!bookmarked);
            //alert(currentBookmarks.includes(props._id) ? "Post unbookmarked!" : "Post bookmarked!");
        } catch (error) {
            console.error("Error updating bookmarks:", error);
            alert("Failed to update bookmarks");
        }
    };

    const onSubmitLikes: any = async (e: any) => {
        e.preventDefault();

        if (post?.likes.includes(user._id)) {

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



    useEffect(() => {
        fetchData();
    }, []);

    const getCommenter = ((comment: any) => {
        var commenter = null;
        for (let i = 0; i < commenters.length; i++) {
            if (commenters[i]._id == comment.userID) {
                commenter = commenters[i];
            }
        }

        return <Link to={`/user/${comment.userID}`}>
            <div className={styles.userInfo}>
                <User size={18} className={styles.userIcon} />
                <p>{commenter.username}</p>
            </div>
        </Link>
    });

    if (loading) {
        return (
            <div>
                <p>loading...</p>
            </div>
        );
    } else if (poster === "Not Found") {
        return <p>Error: 404 Not Found</p>;
    }

    return (
        <>
            <div className="mb-4">
                {post ?
                    <div>
                        <div className={`Post ${styles.container}`}>
                            <div className={styles.topOfPost}>
                                { poster ? 
                                    <Link to={`/user/${post.userID}`}>
                                        <div className={styles.userInfo}>
                                            <User size={18} className={styles.userIcon} />
                                            <p>{poster.username}</p>
                                        </div>
                                    </Link> : <></> }
                                {convention && (
                                    <Link to={`/conventions/${post.conventionID}`} className={styles.conventionLink}>
                                        <p>#{convention.name}</p>
                                    </Link>
                                )}
                                {user ?
                                    <form id="bookmark" onSubmit={onSubmitBookmark}>
                                        <button onClick={onSubmitBookmark} className={styles.actionButton}>
                                            {bookmarked ? <BookmarkCheck size={20} color="#4F46E5" /> : <Bookmark size={20} color="whitesmoke" />}
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
                                        {liked ? <Heart size={20} fill="#F87171" color="#F87171" /> : <Heart size={20} color="whitesmoke" />}
                                    </button>
                                    <button className={styles.likeCount}>{post.likes?.length || 0}</button>
                                </div>
                            ) : <div className={styles.flexContainer}><Heart color="#383a61" size={20}></Heart> <button className={styles.likeCount}>{post.likes?.length || 0}</button> </div>}
                        </div>
                        <div id="CommentGroup">
                            {comments.map((x: any) =>
                                <div key={x._id} className={`Post ${styles.container}`}>
                                    <div className={styles.topOfPost}>
                                        {getCommenter(x)}
                                    </div>
                                    <p>{x.text}</p>
                                    <div className={styles.flexContainer}>
                                        {user ?
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
                                            </button> : <Heart color="#383a61" size={20} />}
                                        <p className='likeCount'>{x.likes.length}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    :
                    <p>Failed to load post</p>
                }

                {user ? <button
                    onClick={() => setShowModal(true)}
                    style={{
                        padding: '8px 16px',
                        backgroundColor: 'black',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Make a Comment
                </button> : <></>}

                {showModal && (
                    <CommentModal
                        isOpen={showModal}
                        onClose={() => setShowModal(false)}
                        onPostCreated={() => {
                            fetchData();
                        }}
                    />
                )}
            </div>
        </>
    );
};

export default DetailPostView;