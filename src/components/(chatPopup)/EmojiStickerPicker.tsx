'use client';

import React from 'react';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';

import IconSticker from '@/public/icons/sticker.svg';

interface EmojiStickerPickerProps {
  showEmojiPicker: boolean;
  pickerTab: 'emoji' | 'sticker';
  setPickerTab: (tab: 'emoji' | 'sticker') => void;
  onEmojiClick: (emojiData: EmojiClickData) => void;
  stickers: string[];
  onSelectSticker: (url: string) => void;
}

export default function EmojiStickerPicker({
  showEmojiPicker,
  pickerTab,
  setPickerTab,
  onEmojiClick,
  stickers,
  onSelectSticker,
}: EmojiStickerPickerProps) {
  if (!showEmojiPicker) return null;

  return (
    <div className="absolute bottom-full left-0 right-0 sm:right-auto mb-2 bg-white shadow-xl border border-gray-200 rounded-xl z-50 w-full sm:w-80 md:w-96 lg:w-[28rem] xl:w-[32rem] max-w-[90vw] flex flex-col overflow-hidden">
      <div className="flex border-b">
        <button
          className={`flex-1 p-2 sm:p-3 text-xs sm:text-sm font-medium ${pickerTab === 'emoji' ? 'bg-gray-100 text-blue-600' : 'hover:bg-gray-50'}`}
          onClick={() => setPickerTab('emoji')}
        >
          Emoji
        </button>
        <button
          className={`flex-1 p-2 sm:p-3 text-xs sm:text-sm font-medium ${pickerTab === 'sticker' ? 'bg-gray-100 text-blue-600' : 'hover:bg-gray-50'}`}
          onClick={() => setPickerTab('sticker')}
        >
          <img
            src={IconSticker.src}
            alt="Sticker"
            className="inline mr-1 w-[10px] h-[10px] sm:w-[14px] sm:h-[14px] md:w-4 md:h-4"
          />
          Sticker
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar max-h-[70vh]">
        {pickerTab === 'emoji' ? (
          <div className="h-[18rem] sm:h-[24rem] md:h-[30rem] lg:h-[36rem] xl:h-[40rem]">
            <EmojiPicker
              onEmojiClick={onEmojiClick}
              width="100%"
              height="100%"
              searchDisabled={false}
              skinTonesDisabled
            />
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-2 p-2">
            {stickers.map((url, idx) => (
              <img
                key={idx}
                src={url}
                alt="sticker"
                className="w-full h-10 sm:h-12 md:h-14 lg:h-16 xl:h-20 object-contain cursor-pointer hover:bg-gray-100 rounded p-1"
                onClick={() => onSelectSticker(url)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
