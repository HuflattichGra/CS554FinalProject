import React from 'react';
import { useEffect, useState, useContext } from 'react';
import { useLocation } from 'react-router-dom';
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

const Home: React.FC = () => {
    const { user } = useContext(userContext);
    const [loading, setLoading] = useState(true);
    const [bookmarkedPosts, setBookmarkedPosts] = useState<Post[]>([]);
    const [showModal, setShowModal] = useState(false);
    const location = useLocation();

    const fetchData = async () => {
        try {
            if (!user) {
                setBookmarkedPosts([]);
                setLoading(false);
                return;
            }

            // Get user's bookmarks
            const userData = await axios.get(`${API_BASE}/user/${user._id}`);
            const bookmarks = userData.data.bookmarks || [];

            if (bookmarks.length === 0) {
                setBookmarkedPosts([]);
                setLoading(false);
                return;
            }

            // Get all posts and filter bookmarked ones
            const postsData = await axios.get(`${API_BASE}/posts`);
            const filteredPosts = postsData.data.filter((post: Post) => 
                bookmarks.includes(post._id)
            );
            setBookmarkedPosts(filteredPosts);
            setLoading(false);
        } catch (e) {
            console.log(e);
            setBookmarkedPosts([]);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [location.pathname, user?._id]); // Refetch when pathname changes or user changes

    if (loading) {
        return (<div>Loading...</div>);
    }

    return (
        <>
            <div>
                <button onClick={() => setShowModal(true)}> Make a Post</button>
            </div>

            {!user ? (
                <div>Please log in to see your bookmarked posts</div>
            ) : bookmarkedPosts.length === 0 ? (
                <div>No bookmarked posts yet</div>
            ) : (
                bookmarkedPosts.map((post: Post) => (
                    <PostView
                        key={post._id}
                        _id={post._id}
                        conventionID={post.conventionID}
                        userID={post.userID}
                        text={post.text}
                        images={post.images}
                        likes={post.likes}
                        onBookmarkChange={fetchData}
                    />
                ))
            )}

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