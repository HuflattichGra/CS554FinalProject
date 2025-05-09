import React from 'react';
import { Card } from '../ui/card';
import { CalendarIcon, MapPinIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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
}

const ConventionCard: React.FC<ConventionCardProps> = ({
  _id,
  name,
  tags,
  startDate,
  endDate,
  address,
  imageUrl = '/default-convention-banner.png',
  countdownDays,

}) => {
  const navigate = useNavigate();
  // const con = { _id, name, tags, startDate, endDate, address, imageUrl, countdownDays, productCount, groupCount };

  // console.log('convention object:', con);
  const handleClick = () => {
    navigate(`/conventions/${_id}`);
  };

  
  return (
    <Card
      className="cursor-pointer"
      onClick={handleClick}
    >
      <img
        src={imageUrl}
        alt="Convention Banner"
        className="w-full sm:w-64 h-40 object-cover rounded-xl"
      />

      <div className="flex-1 flex flex-col justify-between">
        <div>
          <h2 className="text-xl font-bold mb-1">{name}</h2>

          <div className="text-sm text-gray-500 flex items-center gap-1">
            <CalendarIcon size={16} />
            <span>{startDate} ~ {endDate}</span>
          </div>

          <div className="text-sm text-gray-500 flex items-center gap-1 mt-1">
            <MapPinIcon size={16} />
            <span>{address}</span>
          </div>

          <div className="flex flex-wrap mt-2 text-xs gap-2">
            {tags?.map((tag, index) => (
              <span
                key={index}
                className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full"
              >
                #{tag}
              </span>
            ))}

          </div>
        </div>

        <div className="mt-2 flex justify-between text-sm text-gray-600">
          <div className="text-center">
            <div className="text-xs text-gray-400">Count down</div>
            <div className="text-lg font-bold text-black">{countdownDays} Day</div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ConventionCard;
