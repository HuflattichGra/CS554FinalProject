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
    createdAt: string;
    conventionName?: string;
    posterName?: string;
}

type SearchType = 'content' | 'convention' | 'poster' | null;

const POSTS_PER_PAGE = 5;

const PostList: React.FC = () => {
    const { user } = useContext(userContext);
    const [dataType, setDataType] = useState("posts");
    const [loading, setLoading] = useState(true);
    const [posts, setPosts] = useState<Post[]>([]);
    const [allPosts, setAllPosts] = useState<Post[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchType, setSearchType] = useState<SearchType>('poster');

    const fetchData = async (pageNum: number = 1) => {
        try {
            const userData = await axios.get(`${API_BASE}/posts`);
            const postsWithDetails = await Promise.all(
                userData.data.map(async (post: Post) => {
                    try {
                        // Get convention details
                        const conventionData = await axios.get(`${API_BASE}/conventions/${post.conventionID}`);
                        // Get user details
                        const userData = await axios.get(`${API_BASE}/user/${post.userID}`);
                        return {
                            ...post,
                            conventionName: conventionData.data.name,
                            posterName: userData.data.username
                        };
                    } catch (e) {
                        console.error('Error fetching post details:', e);
                        return post;
                    }
                })
            );
            
            // Sort posts by createdAt date (most recent first)
            const sortedPosts = postsWithDetails.sort((a: Post, b: Post) => 
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );

            setAllPosts(sortedPosts);
            filterAndSetPosts(sortedPosts, searchQuery, searchType, pageNum);
            setLoading(false);
        } catch (e) {
            console.log(e);
            setPosts([]);
            setAllPosts([]);
            setLoading(false);
        }
    };

    const filterAndSetPosts = (postsToFilter: Post[], query: string, type: SearchType, pageNum: number) => {
        const filteredPosts = query && type
            ? postsToFilter.filter(post => {
                switch (type) {
                    case 'content':
                        return post.text.toLowerCase().includes(query.toLowerCase());
                    case 'convention':
                        return post.conventionName?.toLowerCase().includes(query.toLowerCase());
                    case 'poster':
                        return post.posterName?.toLowerCase().includes(query.toLowerCase());
                    default:
                        return true;
                }
            })
            : postsToFilter;

        const startIndex = 0;
        const endIndex = pageNum * POSTS_PER_PAGE;
        const postsForPage = filteredPosts.slice(startIndex, endIndex);

        setPosts(postsForPage);
        setHasMore(endIndex < filteredPosts.length);
    };

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value;
        setSearchQuery(query);
        setPage(1);
        filterAndSetPosts(allPosts, query, searchType, 1);
    };

    const handleSearchTypeChange = (type: SearchType) => {
        setSearchType(type);
        setPage(1);
        filterAndSetPosts(allPosts, searchQuery, type, 1);
    };

    const loadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        filterAndSetPosts(allPosts, searchQuery, searchType, nextPage);
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
                <div className="flex flex-col gap-4">
                    <div className="flex justify-end">
                        <button 
                            onClick={() => setShowModal(true)}
                            className="px-4 py-2 bg-black text-white rounded"
                        >
                            Make a Post
                        </button>
                    </div>
                    <br />
                    <div className="flex gap-2">
                        <button
                            onClick={() => handleSearchTypeChange('poster')}
                            className={`px-4 py-2 rounded transition ${
                                searchType === 'poster'
                                    ? 'bg-blue-600 text-white font-semibold'
                                    : 'bg-gray-200 hover:bg-gray-300'
                            }`}
                        >
                            Search by Poster
                        </button>
                        <button
                            onClick={() => handleSearchTypeChange('content')}
                            className={`px-4 py-2 rounded transition ${
                                searchType === 'content'
                                    ? 'bg-blue-600 text-white font-semibold'
                                    : 'bg-gray-200 hover:bg-gray-300'
                            }`}
                        >
                            Search by Content
                        </button>
                        <button
                            onClick={() => handleSearchTypeChange('convention')}
                            className={`px-4 py-2 rounded transition ${
                                searchType === 'convention'
                                    ? 'bg-blue-600 text-white font-semibold'
                                    : 'bg-gray-200 hover:bg-gray-300'
                            }`}
                        >
                            Search by Convention
                        </button>
                    </div>
                    <div className="flex gap-4">
                        <input
                            type="text"
                            placeholder={searchType ? `Search by ${searchType}...` : "Select a search type..."}
                            value={searchQuery}
                            onChange={handleSearch}
                            disabled={!searchType}
                            className="flex-1 px-6 py-3 text-lg border"
                        />
                        {/* <button
                            onClick={() => filterAndSetPosts(allPosts, searchQuery, searchType, 1)}
                            disabled={!searchType}
                            className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            Search
                        </button> */}
                    </div>
                </div>
            </div>
            <br />

            {posts.length === 0 ? (
                <div className="text-center text-gray-500 mt-4">
                    {searchQuery && searchType ? 'No posts found matching your search.' : 'No posts available.'}
                </div>
            ) : (
                <>
                    {posts.map((post: Post) => (
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

                    {hasMore && (
                        <div className="flex justify-center mt-4 mb-4">
                            <button
                                onClick={loadMore}
                                className="px-4 py-2 bg-black text-white rounded"
                            >
                                Load More
                            </button>
                        </div>
                    )}
                </>
            )}

            {showModal && (
                <PostModal
                    isOpen={showModal}
                    onClose={() => setShowModal(false)}
                    onPostCreated={() => {
                        setPage(1);
                        setSearchQuery('');
                        setSearchType(null);
                        fetchData(1);
                    }}
                />
            )}
        </>
    );
};

export default PostList;