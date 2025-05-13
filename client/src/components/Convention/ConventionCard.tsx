import React, { useContext, useState, useEffect } from 'react';
import { Card } from '../ui/card.tsx';
import { CalendarIcon, MapPinIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import userContext from '../../context/userContext';
import { followConvention, unfollowConvention, getUserFollowingConventions } from '../../api/conventions';
import { Button } from '../ui/button.tsx'
import '../ui/Card.css'
export interface ConventionCardProps {
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
  owners?: string[];
  onDeleted?: () => void;
  isClickable?: boolean;
  currentTab?: string;
  isOnline?: boolean;
}

const ConventionCard: React.FC<ConventionCardProps> = ({
  _id,
  name,
  tags,
  startDate,
  endDate,
  address,
  owners,
  imageUrl = '/default-convention-banner.png',
  countdownDays,
  currentTab,
  isOnline
}) => {
  const navigate = useNavigate();
  const { user } = useContext(userContext);
  const [isFollowing, setIsFollowing] = useState<boolean | undefined>(undefined);

const isNotOnline = !isOnline
  // const con = { _id, name, tags, startDate, endDate, address, imageUrl, countdownDays, productCount, groupCount };
  const isEnded = new Date(endDate) < new Date();
  const isAdmin = Array.isArray(owners) && owners.includes(user._id);
  const cantFollow = isAdmin || isEnded

  const isClickable = isAdmin || !isEnded;
  // console.log('convention object:', con);
  const handleClick = () => {
    if (isClickable !== false) {
      if (currentTab) {
        sessionStorage.setItem('conventionTab', currentTab);
      }
      navigate(`/conventions/${_id}`, {
        state: { fromTab: currentTab }
      });
    }
  };
  const handleToggleFollow = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (isFollowing) {
        await unfollowConvention(_id);
        setIsFollowing(false);
      } else {
        await followConvention(_id);
        setIsFollowing(true);
      }

    } catch (e) {
      console.error('Follow toggle failed', e);
    }
  };
  useEffect(() => {
    const fetchFollow = async () => {
      try {
        if (!user?._id) return;
        const res = await getUserFollowingConventions(user._id, 1, 9999);
        const ids = (res.conventions || []).map((c: any) => c._id?.toString?.() ?? c._id);
        setIsFollowing(ids.includes(_id));
      } catch (e) {

        console.error('Failed to load following status', e);
        setIsFollowing(false);
      }
    };
    if (user?._id) fetchFollow();
  }, [user, _id]);



  return (
    <Card
      className={isEnded ? 'expired cursor-pointer convention-card' : 'cursor-pointer convention-card'}

      onClick={handleClick}
    >
      <img
        src={imageUrl}
        alt="Convention Banner"
        className="convention-card-image"
      />

      <div className="convention-card-content">
        <div>
          <h2 className="convention-card-title">{name}</h2>
          {!cantFollow && (
            <Button
              className="btn"
              onClick={handleToggleFollow}
              disabled={isFollowing === undefined}
            >
              {isFollowing === undefined
                ? 'Loading...'
                : isFollowing
                  ? 'Unfollow'
                  : 'Follow'}
            </Button>
          )}


          <div className="convention-card-detail">
            <CalendarIcon size={16} />
            <span>
              {new Date(startDate).toLocaleString(undefined, {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
              })} -{' '}
              {new Date(endDate).toLocaleString(undefined, {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>


          </div>

          <div className="convention-card-detail">
            <MapPinIcon size={16} />
            <span>{isOnline ? 'Online' : address}</span>
          </div>


          <div className="tag-container">
            {tags?.map((tag, index) => (
              <span
                key={index}
                className="tag-badge"
              >
                #{tag}
              </span>
            ))}

          </div>
        </div>

        <div className="convention-card-footer">
          <div className="countdown-text">
            {isEnded ? 'This Event Has Ended' : `${countdownDays} Day to Go`}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ConventionCard;
