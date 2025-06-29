import React, { useState } from 'react';
import Image from 'next/image';

const Logo: React.FC<{ animated?: boolean }> = ({ animated = true }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className={`flex items-center gap-4 ${animated ? 'transition-all duration-300' : ''}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ cursor: 'pointer' }}
    >
      <Image
        src={hovered ? '/logo.png' : '/logo.png'}
        alt="Logo"
        width={241.94}
        height={71.94}
        className={`transition-transform duration-300 ${hovered ? 'scale-105' : ''}`}
        draggable={false}
      />
    </div>
  );
};

export default Logo;