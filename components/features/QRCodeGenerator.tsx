import React from 'react';
import { QRCodeSVG } from 'qrcode.react'; // Importa o componente QRCodeSVG

interface QRCodeGeneratorProps {
  value: string; // O valor a ser codificado no QR Code (o ID do ativo)
  size?: number; // Tamanho do QR Code em pixels (padrão: 128)
  level?: 'L' | 'M' | 'Q' | 'H'; // Nível de correção de erro (padrão: 'M')
  fgColor?: string; // Cor do primeiro plano (quadrados)
  bgColor?: string; // Cor do fundo
  className?: string; // Classes CSS adicionais para o container
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