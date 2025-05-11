import React from 'react';
import { useEffect, useState, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';

import userContext from "../../context/userContext";
import PostView from '../Posts/PostView';
import PostModal from '../Posts/PostModal';
import ConventionCard from '../Convention/ConventionCard';
import { API_BASE } from '../../api';

interface Post {
    _id: string;
    conventionID: string;
    userID: string;
    text: string;
    images: Array<string>;
    likes: Array<string>;
}

interface Convention {
    _id: string;
    name: string;
    tags: string[];
    startDate: string;
    endDate: string;
    address: string;
    imageUrl?: string;
    countdownDays: number;
    productCount?: number;
    groupCount?: number;
}

const Home: React.FC = () => {
    const { user } = useContext(userContext);
    const [loading, setLoading] = useState(true);
    const [bookmarkedPosts, setBookmarkedPosts] = useState<Post[]>([]);
    const [followedConventions, setFollowedConventions] = useState<Convention[]>([]);
    const [showModal, setShowModal] = useState(false);
    const location = useLocation();

    const fetchData = async () => {
        try {
            if (!user) {
                setBookmarkedPosts([]);
                setFollowedConventions([]);
                setLoading(false);
                return;
            }

            // Get user's bookmarks
            const userData = await axios.get(`${API_BASE}/user/${user._id}`);
            const bookmarks = userData.data.bookmarks || [];

            if (bookmarks.length === 0) {
                setBookmarkedPosts([]);
            } else {
                // Get all posts and filter bookmarked ones
                const postsData = await axios.get(`${API_BASE}/posts`);
                const filteredPosts = postsData.data.filter((post: Post) => 
                    bookmarks.includes(post._id)
                );
                setBookmarkedPosts(filteredPosts);
            }

            // Get user's followed conventions
            const conventionsData = await axios.get(`${API_BASE}/conventions`);
            //console.log('User data:', userData.data);
            //console.log('Conventions following:', userData.data.conventionsFollowing);
            //console.log('All conventions:', conventionsData.data.conventions);
            const followedConvs = conventionsData.data.conventions.filter((conv: Convention) => {
                const isFollowing = userData.data.conventionsFollowing?.includes(conv._id);
                console.log('Checking convention:', conv._id, 'Is following:', isFollowing);
                return isFollowing;
            });
            //console.log('Filtered conventions:', followedConvs);
            setFollowedConventions(followedConvs);
            setLoading(false);
        } catch (e) {
            console.log(e);
            setBookmarkedPosts([]);
            setFollowedConventions([]);
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
                <div>Please log in to see your bookmarked posts and followed conventions</div>
            ) : (
                <>
                    <div className="mt-8">
                        <h2 className="text-2xl font-bold mb-4">Followed Conventions</h2>
                        {followedConventions.length === 0 ? (
                            <div>No followed conventions yet</div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {followedConventions.map((convention) => (
                                    <ConventionCard
                                        key={convention._id}
                                        _id={convention._id}
                                        name={convention.name}
                                        tags={convention.tags}
                                        startDate={convention.startDate}
                                        endDate={convention.endDate}
                                        address={convention.address}
                                        imageUrl={convention.imageUrl}
                                        countdownDays={convention.countdownDays}
                                        productCount={convention.productCount}
                                        groupCount={convention.groupCount}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="mt-8">
                        <h2 className="text-2xl font-bold mb-4">Bookmarked Posts</h2>
                        {bookmarkedPosts.length === 0 ? (
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
                    </div>
                </>
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