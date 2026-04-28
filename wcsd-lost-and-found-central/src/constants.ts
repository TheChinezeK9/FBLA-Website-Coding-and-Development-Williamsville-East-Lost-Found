import { SchoolTheme, LostItem, Category } from './types';

export const CATEGORIES: Category[] = ['Clothing', 'Electronics', 'Books', 'Music', 'Personal', 'Other'];
export const ADMIN_PASSWORD = "8290";

export const SCHOOL_THEMES: Record<string, SchoolTheme> = {
  will_east: { id: 'will_east', name: 'Williamsville East High School', logo: '/images/east.png', palette: { primary: '#e7a39b', secondary: '#f3df9b', tertiary: '#f8efe4' }, contactInfo: { address: '151 Paradise Rd, East Amherst, NY 14051', phone: '(716) 626-8400', email: 'eastoffice@williamsvillek12.org', principal: 'Mr. Brian Swatland' } },
};

//This section is merely for presentation purposes. Can be removed.
export const INITIAL_ITEMS: LostItem[] = [
  { id: '1', name: 'Red Gym Bag', description: 'Left in the locker room near the showers.', category: 'Personal', schoolId: 'will_east', date: '2023-10-24', status: 'lost', imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=300&h=300' },
  { id: '2', name: 'Physics Textbook', description: 'Found in the science wing hallway.', category: 'Books', schoolId: 'will_east', date: '2023-10-25', status: 'found', imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=300&h=300' },
  { id: '3', name: 'Blue Hoodie', description: 'Size M. Left in Cafeteria.', category: 'Clothing', schoolId: 'will_east', date: '2023-10-26', status: 'lost', imageUrl: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&q=80&w=300&h=300' },
  { id: '4', name: 'Violin Case', description: 'Black hard case found in the music room.', category: 'Music', schoolId: 'will_east', date: '2023-10-27', status: 'found', imageUrl: 'https://images.unsplash.com/photo-1612225330812-01a9c6b355ec?auto=format&fit=crop&q=80&w=300&h=300' }
];
