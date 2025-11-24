'use client';

import React from 'react';

/* eslint-disable @next/next/no-img-element */

import IconShow from '@/public/icons/show.svg';
import IconShow1 from '@/public/icons/show2.svg';
import Image from 'next/image';
import { getProxyUrl } from '../../utils/utils';

interface ChatHeaderProps {
  chatName: string;
  isGroup: boolean;
  memberCount: number;
  showPopup: boolean;
  onTogglePopup: () => void;
  onOpenMembers: () => void;
  avatar?: string;
}

export default function ChatHeader({
  chatName,
  isGroup,
  memberCount,
  showPopup,
  onTogglePopup,
  onOpenMembers,
  avatar,
}: ChatHeaderProps) {
  const avatarChar = chatName?.trim()?.charAt(0)?.toUpperCase() || (isGroup ? 'N' : 'U');

  return (
    <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-white shadow-sm">
      <div className="flex items-center space-x-3">
        {/* Avatar nhóm hoặc user */}
        <div className="relative flex-shrink-0">
          <div
            className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm sm:text-base
                        ${isGroup ? 'bg-blue-500' : 'bg-gray-400'} overflow-hidden`}
          >
            {avatar ? (
              // Dùng <img> + proxy để load avatar nhóm/user từ Mega hoặc nguồn ngoài
              <img src={getProxyUrl(avatar)} alt={chatName} className="w-full h-full object-cover" />
            ) : (
              avatarChar
            )}
          </div>
        </div>

        {/* Tên & trạng thái */}
        <div
          className="truncate hover:bg-gray-100 hover:cursor-pointer rounded-lg px-1 py-1 sm:px-2 sm:py-2"
          onClick={onOpenMembers}
        >
          <h1 className="font-semibold text-gray-900 text-sm sm:text-base truncate">{chatName}</h1>
          <p className="text-xs text-gray-500">{isGroup ? `${memberCount} thành viên` : 'Đang hoạt động'}</p>
        </div>
      </div>
      <button className="p-1 sm:p-2 rounded-full hover:bg-gray-100 cursor-pointer" onClick={onTogglePopup}>
        <Image
          src={showPopup ? IconShow1.src : IconShow.src}
          width={20}
          height={20}
          alt="More"
          className="w-5 h-5 sm:w-6 sm:h-6 object-contain "
        />
      </button>
    </div>
  );
}
