import { create } from 'zustand';
import { CONTENT_ITEMS, type ContentItem } from '../data/studioData';

interface StudioContentState {
  items: ContentItem[];
  addContent: (item: Omit<ContentItem, 'id' | 'time' | 'views' | 'likes'>) => void;
}

let seq = 100;

export const useStudioContentStore = create<StudioContentState>((set) => ({
  items: CONTENT_ITEMS,
  addContent: (item) =>
    set((state) => ({
      items: [
        {
          ...item,
          id: `ct_new_${seq++}`,
          time: item.status === 'draft' ? 'Draft' : 'Just now',
          views: 0,
          likes: 0,
        },
        ...state.items,
      ],
    })),
}));
