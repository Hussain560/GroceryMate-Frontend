import React from 'react';
import SARIcon from '../assets/images/Saudi_Riyal_Symbol.svg';

export default function Price({ amount }) {
  return (
    <span className="whitespace-nowrap">
      <img 
        src={SARIcon} 
        alt="SAR"
        className="inline-block h-3.5 w-auto mr-1 align-baseline"
      />
      {parseFloat(amount || 0).toFixed(2)}
    </span>
  );
}



