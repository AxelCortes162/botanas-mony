import { QRCodeSVG } from 'qrcode.react';

const MenuQR = () => {
  return (
    <div style={{ textAlign: 'center', padding: '20px', background: '#fff' }}>
      <p style={{ fontWeight: 'bold', marginBottom: '10px' }}>¡Escanea para ver el menú!</p>
      <QRCodeSVG 
        value="https://botanasmony.vercel.app/" 
        size={200}
        fgColor="#ff8a00" // El naranja de Mony
        level="H" // Alta calidad para que no falle al escanear
        includeMargin={true}
      />
    </div>
  );
};

export default MenuQR;