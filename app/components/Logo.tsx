import React from 'react';
import Svg, { Path, Defs, LinearGradient, Stop, Rect, G } from 'react-native-svg';

interface LogoProps {
    size?: number;
}

export const Logo: React.FC<LogoProps> = ({ size = 64 }) => {
    return (
        <Svg width={size} height={size} viewBox="0 0 1024 1024" fill="none">
            <Defs>
                <LinearGradient id="bg_grad" x1="0" y1="0" x2="1024" y2="1024">
                    <Stop offset="0" stopColor="#FF6B5A" />
                    <Stop offset="1" stopColor="#E8503A" />
                </LinearGradient>
            </Defs>

            {/* Rounded Square Body */}
            <Rect width="1024" height="1024" rx="224" fill="url(#bg_grad)" />

            {/* Stylized Book / Flow Icon */}
            <G transform="translate(0, 50)">
                {/* Left Page */}
                <Path
                    d="M512 700C512 700 380 700 300 730V280C380 250 512 250 512 250V700Z"
                    fill="white"
                />
                {/* Right Page */}
                <Path
                    d="M512 700C512 700 644 700 724 730V280C644 250 512 250 512 250V700Z"
                    fill="white"
                    fillOpacity={0.9}
                />
                {/* Center Line */}
                <Path
                    d="M512 250V700"
                    stroke="#E8503A"
                    strokeWidth="8"
                    strokeLinecap="round"
                />

                {/* Flow Lines */}
                <Path
                    d="M340 400C380 380 430 380 470 400M554 400C594 380 644 380 684 400"
                    stroke="#E8503A"
                    strokeWidth="12"
                    strokeLinecap="round"
                    strokeOpacity={0.2}
                />
                <Path
                    d="M340 500C380 480 430 480 470 500M554 500C594 480 644 480 684 500"
                    stroke="#E8503A"
                    strokeWidth="12"
                    strokeLinecap="round"
                    strokeOpacity={0.15}
                />
            </G>

            {/* Golden Spark */}
            <Path
                d="M512 170L525 200L555 213L525 226L512 256L499 226L469 213L499 200L512 170Z"
                fill="#FFD35A"
            />
        </Svg>
    );
};

export default Logo;
