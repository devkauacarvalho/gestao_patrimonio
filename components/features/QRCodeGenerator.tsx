import React from 'react';
import { QRCodeSVG } from 'qrcode.react'; 

interface QRCodeGeneratorProps {
  value: string; 
  size?: number; 
  level?: 'L' | 'M' | 'Q' | 'H'; 
  fgColor?: string; 
  bgColor?: string; 
  className?: string; 
}

const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({
  value,
  size = 128,
  level = 'M',
  fgColor = '#000000',
  bgColor = '#FFFFFF',
  className = '',
}) => {
  if (!value) {
    return <p className="text-slate-500 text-center">Nenhum valor fornecido para gerar QR Code.</p>;
  }

  return (
    <div className={`flex justify-center items-center p-2 border border-slate-200 rounded-md bg-white ${className}`}>
      <QRCodeSVG
        value={value}
        size={size}
        level={level}
        fgColor={fgColor}
        bgColor={bgColor}
      />
    </div>
  );
};

export default QRCodeGenerator;