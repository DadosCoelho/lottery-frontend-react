import React from 'react';
import { motion } from 'framer-motion';

interface NumberBallProps {
  number: string;
  gameColor?: string;
  small?: boolean;
  className?: string;
}

const NumberBall: React.FC<NumberBallProps> = ({ 
  number, 
  gameColor = 'bg-primary-600',
  small = false,
  className = '' 
}) => {
  // Garantir que number é uma string
  const displayNumber = String(number).trim();
  
  return (
    <motion.div
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      className={`
        ${small ? 'w-8 h-8 text-sm' : 'w-10 h-10 text-lg'} 
        ${gameColor} 
        flex items-center justify-center rounded-full 
        font-bold text-white shadow-md
        ${className}
      `}
    >
      {displayNumber}
    </motion.div>
  );
};

export default NumberBall;