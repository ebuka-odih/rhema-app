import React from 'react';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';

// Icon wrapper to maintain consistent API
interface IconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
  fill?: string;
  className?: string;
}

// Exporting individual icons using Expo Vector Icons
export const IconHome = ({ size = 24, color = '#FFFFFF', ...props }: IconProps) => (
  <Ionicons name="home-outline" size={size} color={color} />
);

export const IconBible = ({ size = 24, color = '#FFFFFF', ...props }: IconProps) => (
  <Ionicons name="book-outline" size={size} color={color} />
);

export const IconMic = ({ size = 24, color = '#FFFFFF', ...props }: IconProps) => (
  <Ionicons name="mic-outline" size={size} color={color} />
);

export const IconFasting = ({ size = 24, color = '#FFFFFF', ...props }: IconProps) => (
  <Ionicons name="time-outline" size={size} color={color} />
);

export const IconClock = ({ size = 24, color = '#FFFFFF', ...props }: IconProps) => (
  <Ionicons name="time-outline" size={size} color={color} />
);

export const IconMore = ({ size = 24, color = '#FFFFFF', ...props }: IconProps) => (
  <Ionicons name="menu-outline" size={size} color={color} />
);

export const IconShare = ({ size = 24, color = '#FFFFFF', ...props }: IconProps) => (
  <Ionicons name="share-outline" size={size} color={color} />
);

export const IconHeart = ({ size = 24, color = '#FFFFFF', ...props }: IconProps) => (
  <Ionicons name="heart-outline" size={size} color={color} />
);

export const IconComment = ({ size = 24, color = '#FFFFFF', ...props }: IconProps) => (
  <Ionicons name="chatbubble-outline" size={size} color={color} />
);

export const IconExpand = ({ size = 24, color = '#FFFFFF', ...props }: IconProps) => (
  <Ionicons name="expand-outline" size={size} color={color} />
);

export const IconDownload = ({ size = 24, color = '#FFFFFF', ...props }: IconProps) => (
  <Ionicons name="download-outline" size={size} color={color} />
);

export const IconPlay = ({ size = 24, color = '#FFFFFF', fill, ...props }: IconProps) => (
  <Ionicons name={fill ? "play" : "play-outline"} size={size} color={color} />
);

export const IconPause = ({ size = 24, color = '#FFFFFF', ...props }: IconProps) => (
  <Ionicons name="pause-outline" size={size} color={color} />
);

export const IconChevronLeft = ({ size = 24, color = '#FFFFFF', ...props }: IconProps) => (
  <Ionicons name="chevron-back" size={size} color={color} />
);

export const IconChevronRight = ({ size = 24, color = '#FFFFFF', ...props }: IconProps) => (
  <Ionicons name="chevron-forward" size={size} color={color} />
);

export const IconSearch = ({ size = 24, color = '#FFFFFF', ...props }: IconProps) => (
  <Ionicons name="search-outline" size={size} color={color} />
);

export const IconHighlight = ({ size = 24, color = '#FFFFFF', ...props }: IconProps) => (
  <MaterialCommunityIcons name="marker" size={size} color={color} />
);

export const IconFont = ({ size = 24, color = '#FFFFFF', ...props }: IconProps) => (
  <MaterialCommunityIcons name="format-size" size={size} color={color} />
);

export const IconSun = ({ size = 24, color = '#FFFFFF', ...props }: IconProps) => (
  <Ionicons name="sunny-outline" size={size} color={color} />
);

export const IconMoon = ({ size = 24, color = '#FFFFFF', ...props }: IconProps) => (
  <Ionicons name="moon-outline" size={size} color={color} />
);

export const IconVolume = ({ size = 24, color = '#FFFFFF', ...props }: IconProps) => (
  <Ionicons name="volume-high-outline" size={size} color={color} />
);

export const IconDots = ({ size = 24, color = '#FFFFFF', ...props }: IconProps) => (
  <Ionicons name="ellipsis-horizontal" size={size} color={color} />
);

export const IconPlus = ({ size = 24, color = '#FFFFFF', ...props }: IconProps) => (
  <Ionicons name="add" size={size} color={color} />
);

export const IconTrash = ({ size = 24, color = '#FFFFFF', ...props }: IconProps) => (
  <Ionicons name="trash-outline" size={size} color={color} />
);

export const IconEdit = ({ size = 24, color = '#FFFFFF', ...props }: IconProps) => (
  <Ionicons name="create-outline" size={size} color={color} />
);

export const IconCheck = ({ size = 24, color = '#FFFFFF', ...props }: IconProps) => (
  <Ionicons name="checkmark" size={size} color={color} />
);

export const IconJourney = ({ size = 24, color = '#FFFFFF', ...props }: IconProps) => (
  <Ionicons name="compass-outline" size={size} color={color} />
);

export const IconPen = ({ size = 24, color = '#FFFFFF', ...props }: IconProps) => (
  <MaterialCommunityIcons name="pen" size={size} color={color} />
);

export const IconActivity = ({ size = 24, color = '#FFFFFF', ...props }: IconProps) => (
  <Ionicons name="pulse-outline" size={size} color={color} />
);

export const IconFire = ({ size = 24, color = '#FFFFFF', ...props }: IconProps) => (
  <Ionicons name="flame-outline" size={size} color={color} />
);

export const IconTrend = ({ size = 24, color = '#FFFFFF', ...props }: IconProps) => (
  <Ionicons name="trending-up-outline" size={size} color={color} />
);

export const IconList = ({ size = 24, color = '#FFFFFF', ...props }: IconProps) => (
  <Ionicons name="list-outline" size={size} color={color} />
);

export const IconArrowLeft = ({ size = 24, color = '#FFFFFF', ...props }: IconProps) => (
  <Ionicons name="arrow-back" size={size} color={color} />
);

export const IconArrowRight = ({ size = 24, color = '#FFFFFF', ...props }: IconProps) => (
  <Ionicons name="arrow-forward" size={size} color={color} />
);

export const IconCalendar = ({ size = 24, color = '#FFFFFF', ...props }: IconProps) => (
  <Ionicons name="calendar-outline" size={size} color={color} />
);

export const IconClose = ({ size = 24, color = '#FFFFFF', ...props }: IconProps) => (
  <Ionicons name="close" size={size} color={color} />
);

export const IconBell = ({ size = 24, color = '#FFFFFF', ...props }: IconProps) => (
  <Ionicons name="notifications-outline" size={size} color={color} />
);

export const IconUser = ({ size = 24, color = '#FFFFFF', ...props }: IconProps) => (
  <Ionicons name="person-outline" size={size} color={color} />
);

export const IconSettings = ({ size = 24, color = '#FFFFFF', ...props }: IconProps) => (
  <Ionicons name="settings-outline" size={size} color={color} />
);

export const IconLogout = ({ size = 24, color = '#FFFFFF', ...props }: IconProps) => (
  <Ionicons name="log-out-outline" size={size} color={color} />
);

export const IconShield = ({ size = 24, color = '#FFFFFF', ...props }: IconProps) => (
  <Ionicons name="shield-checkmark-outline" size={size} color={color} />
);

export const IconStar = ({ size = 24, color = '#FFFFFF', ...props }: IconProps) => (
  <Ionicons name="star-outline" size={size} color={color} />
);

export const IconLock = ({ size = 24, color = '#FFFFFF', ...props }: IconProps) => (
  <Ionicons name="lock-closed-outline" size={size} color={color} />
);

export const IconHelp = ({ size = 24, color = '#FFFFFF', ...props }: IconProps) => (
  <Ionicons name="help-circle-outline" size={size} color={color} />
);

export const IconMessage = ({ size = 24, color = '#FFFFFF', ...props }: IconProps) => (
  <Ionicons name="mail-outline" size={size} color={color} />
);

export const IconBold = ({ size = 24, color = '#FFFFFF', ...props }: IconProps) => (
  <MaterialCommunityIcons name="format-bold" size={size} color={color} />
);

export const IconItalic = ({ size = 24, color = '#FFFFFF', ...props }: IconProps) => (
  <MaterialCommunityIcons name="format-italic" size={size} color={color} />
);

export const IconListBullet = ({ size = 24, color = '#FFFFFF', ...props }: IconProps) => (
  <MaterialCommunityIcons name="format-list-bulleted" size={size} color={color} />
);

export const IconUnderline = ({ size = 24, color = '#FFFFFF', ...props }: IconProps) => (
  <MaterialCommunityIcons name="format-underline" size={size} color={color} />
);

export const IconStrikethrough = ({ size = 24, color = '#FFFFFF', ...props }: IconProps) => (
  <MaterialCommunityIcons name="format-strikethrough-variant" size={size} color={color} />
);

export const IconQuote = ({ size = 24, color = '#FFFFFF', ...props }: IconProps) => (
  <MaterialCommunityIcons name="format-quote-open" size={size} color={color} />
);

export const IconFormat = ({ size = 24, color = '#FFFFFF', ...props }: IconProps) => (
  <MaterialCommunityIcons name="format-text" size={size} color={color} />
);