'use client';

import Image from 'next/image';
import { getEmojiUrl } from '@/utils/getFbEmojiUrl';

export default function EmojiFB({ unicode, size = 32 }: { unicode: string; size?: number }) {
  return <Image src={getEmojiUrl(unicode)} alt="emoji" width={size} height={size} unoptimized />;
}
