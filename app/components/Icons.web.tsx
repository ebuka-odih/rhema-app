import React from 'react';
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  Bell,
  Bold,
  BookOpen,
  Calendar,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Compass,
  Copy,
  Download,
  Ellipsis,
  Flame,
  Heart,
  HelpCircle,
  Highlighter,
  Home,
  Italic,
  List,
  Lock,
  LogOut,
  Mail,
  Menu,
  MessageCircle,
  Mic,
  Moon,
  Pause,
  Pen,
  Play,
  Plus,
  Quote,
  Search,
  Settings,
  Share2,
  Shield,
  Star,
  Strikethrough,
  Sun,
  Trash2,
  TrendingUp,
  Type,
  Underline,
  User,
  Volume2,
  X,
} from 'lucide-react';

interface IconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
  fill?: string;
  className?: string;
}

type IconComponent = React.ComponentType<{
  size?: number | string;
  color?: string;
  strokeWidth?: number | string;
  className?: string;
  fill?: string;
}>;

const makeIcon = (Comp: IconComponent) => ({ size = 24, color = '#FFFFFF', strokeWidth = 2, fill, className }: IconProps) => (
  <Comp
    size={size}
    color={color}
    strokeWidth={strokeWidth}
    className={className}
    fill={fill && fill !== 'transparent' ? fill : 'none'}
  />
);

export const IconHome = makeIcon(Home);
export const IconBible = makeIcon(BookOpen);
export const IconMic = makeIcon(Mic);
export const IconFasting = makeIcon(Clock3);
export const IconClock = makeIcon(Clock3);
export const IconMore = makeIcon(Menu);
export const IconShare = makeIcon(Share2);
export const IconHeart = makeIcon(Heart);
export const IconComment = makeIcon(MessageCircle);
export const IconExpand = makeIcon(Activity);
export const IconDownload = makeIcon(Download);
export const IconPlay = makeIcon(Play);
export const IconPause = makeIcon(Pause);
export const IconChevronLeft = makeIcon(ChevronLeft);
export const IconChevronRight = makeIcon(ChevronRight);
export const IconSearch = makeIcon(Search);
export const IconHighlight = makeIcon(Highlighter);
export const IconFont = makeIcon(Type);
export const IconSun = makeIcon(Sun);
export const IconMoon = makeIcon(Moon);
export const IconVolume = makeIcon(Volume2);
export const IconDots = makeIcon(Ellipsis);
export const IconPlus = makeIcon(Plus);
export const IconTrash = makeIcon(Trash2);
export const IconEdit = makeIcon(Pen);
export const IconCheck = makeIcon(Check);
export const IconJourney = makeIcon(Compass);
export const IconPen = makeIcon(Pen);
export const IconActivity = makeIcon(Activity);
export const IconFire = makeIcon(Flame);
export const IconTrend = makeIcon(TrendingUp);
export const IconList = makeIcon(List);
export const IconArrowLeft = makeIcon(ArrowLeft);
export const IconArrowRight = makeIcon(ArrowRight);
export const IconCalendar = makeIcon(Calendar);
export const IconClose = makeIcon(X);
export const IconBell = makeIcon(Bell);
export const IconUser = makeIcon(User);
export const IconSettings = makeIcon(Settings);
export const IconLogout = makeIcon(LogOut);
export const IconShield = makeIcon(Shield);
export const IconStar = makeIcon(Star);
export const IconLock = makeIcon(Lock);
export const IconHelp = makeIcon(HelpCircle);
export const IconMessage = makeIcon(Mail);
export const IconBold = makeIcon(Bold);
export const IconItalic = makeIcon(Italic);
export const IconListBullet = makeIcon(List);
export const IconUnderline = makeIcon(Underline);
export const IconStrikethrough = makeIcon(Strikethrough);
export const IconQuote = makeIcon(Quote);
export const IconFormat = makeIcon(Type);
export const IconCopy = makeIcon(Copy);
export const IconNote = makeIcon(Pen);
