import { logout } from '@/services/authService';
import { NavItem,  } from '@/types';

export type User = {
  token: any;
  transactions: any;
  balances: any;
  id: string;
  email: string;
  name: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  avatarId: string;
  userLevelId: string;
  lastWatchedVideoId: string | null;
};



export const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: 'dashboard',
    label: 'Dashboard',
    onClick: function (): unknown {
      throw new Error('Function not implemented.');
    }
  },
  {
    title: 'Travel',
    href: '/dashboard/travel-packages',
    icon: 'dashboard',
    label: 'Travel',
    onClick: function (): unknown {
      throw new Error('Function not implemented.');
    }
  },
  {
    title: 'bookings',
    href: '/dashboard/bookings',
    icon: 'dashboard',
    label: 'bookings',
    onClick: function (): unknown {
      throw new Error('Function not implemented.');
    }
  },
  // {
  //   title: 'User',
  //   href: '/dashboard/user',
  //   icon: 'user',
  //   label: 'user',
  //   onClick: function (): unknown {
  //     throw new Error('Function not implemented.');
  //   }
  // },
  // {
  //   title: 'Videos',
  //   href: '/dashboard/video',
  //   icon: 'play',
  //   label: 'video',
  //   onClick: function (): unknown {
  //     throw new Error('Function not implemented.');
  //   }
  // },
  // {
  //   title: 'Course',
  //   href: '/dashboard/course',
  //   icon: 'tvMinimal',
  //   label: 'employee',
  //   onClick: function (): unknown {
  //     throw new Error('Function not implemented.');
  //   }
  // },
  // {
  //   title: 'Tags',
  //   href: '/dashboard/tags',
  //   icon: 'tags',
  //   label: 'tag',
  //   onClick: function (): unknown {
  //     throw new Error('Function not implemented.');
  //   }
  // },
  // {
  //   title: 'Profile',
  //   href: '/dashboard/profile',
  //   icon: 'profile',
  //   label: 'profile',
  //   onClick: function (): unknown {
  //     throw new Error('Function not implemented.');
  //   }
  // },
  // {
  //   title: 'Kanban',
  //   href: '/dashboard/kanban',
  //   icon: 'kanban',
  //   label: 'kanban',
  //   onClick: function (): unknown {
  //     throw new Error('Function not implemented.');
  //   }
  // },
  // {
  //   title: 'Communities',
  //   href: '/dashboard/communities',
  //   icon: 'users',
  //   label: 'communities',
  //   onClick: function (): unknown {
  //     throw new Error('Function not implemented.');
  //   }
  // },
  {
    title: 'Logout',
    icon: 'login',
    href: '#',
    onClick: logout
  }
];
