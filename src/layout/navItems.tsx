import { SvgIconComponent } from '@mui/icons-material';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';

export type NavItem = {
  name: string;
  page: number;
  href?: string;
  icon?: SvgIconComponent; // Store the icon component itself
};

export const navItems: NavItem[] = [
  { name: 'event', page: 1, href: '/', icon: StorefrontOutlinedIcon },
  { name: 'service', page: 2, href: '/service', icon: ArticleOutlinedIcon },
  { name: 'contact', page: 3, href: '/contact', icon: MailOutlineIcon },
  { name: 'chat', page: 4, href: '/pubnub', icon: MailOutlineIcon },
];
