import React from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import { useContext, useEffect, useState } from "react";
import userContext from "../../context/userContext";
import "../../App.css";
import { API_BASE } from "../../api";
import { Images } from "lucide-react";

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
            } catch (e) {
                console.log(e);
                setPoster("Not Found");
                setLoading(false);
            }
        }
        fetchData();
    }, [props.userID]);

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
        }
        setLiked(!post.likes.includes(user?._id));
    };

    const onSubmitBookmark: any = async (e: any) => {
        e.preventDefault();
        setBookmarked(bookmarked!);
        try {
            // Get user's current bookmarks array
            const userResponse = await axios.get(`${API_BASE}/user/${user?._id}`);
            const currentBookmarks = userResponse.data.bookmarks || [];

            console.log(currentBookmarks);

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
            <div className="Post">
                <div className="TopOfPost">
                    <Link to={`user/${post.userID}`}>
                        <p>{poster.username}</p>
                    </Link>
                    <form id="bookmark" onSubmit={onSubmitBookmark}>
                        <button onClick={onSubmitBookmark} className="post-element">
                            {bookmarked ? <img src="/src/assets/bookmark_filled.png" className="bookmark" /> : <img className="bookmark" src="/src/assets/bookmark.png" />}
                        </button>
                    </form>
                </div>
                <Link to={`post/${post._id}`}>
                <p>{post.text}</p>
                </Link>
                {user ? (
                    <div className="flex">
                        <button onClick={onSubmitLikes} name="likeButton" className="">
                            {liked ? <img src="/src/assets/heart.png" className="like_on" /> : <img className="like_off" src="/src/assets/heart.png" />}
                        </button>
                        <button className="likeCount">{post.likes?.length || 0}</button>
                    </div>
                ) : null}
            </div>
        );
    }
};

export default PostView;
