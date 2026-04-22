// src/components/TransferModal/TransferModal.jsx
import { useState } from 'react';
import './TransferModal.css';

const TransferModal = ({ paymentData, onClose }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(paymentData.clabe);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="transfer-modal-overlay" onClick={onClose}>
      <div className="transfer-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="transfer-modal-header">
          <h2 className="transfer-modal-title">
            <span>💳</span> Datos de Transferencia
          </h2>
          <button className="transfer-modal-close" onClick={onClose}>×</button>
        </div>

        <div className="transfer-modal-body">
          <div className="transfer-card-visual">
            <div className="bank-icon">🏦</div>
            <div className="bank-name">{paymentData.banco}</div>
          </div>

          <div className="transfer-info-section">
            <div className="info-row">
              <span className="info-label">Titular:</span>
              <span className="info-value">{paymentData.titular}</span>
            </div>

            <div className="info-row">
              <span className="info-label">Banco:</span>
              <span className="info-value">{paymentData.banco}</span>
            </div>

            <div className="clabe-section">
              <label className="clabe-label">CLABE Interbancaria:</label>
              <div className="clabe-display">
                <code className="clabe-number">{paymentData.clabe}</code>
                <button 
                  className={`copy-clabe-btn ${copied ? 'copied' : ''}`}
                  onClick={copyToClipboard}
                >
                  {copied ? '✓ Copiado' : '📋 Copiar'}
                </button>
              </div>
            </div>
          </div>

          <div className="transfer-instructions">
            <h4>📝 Instrucciones:</h4>
            <ol>
              <li>Realiza la transferencia por el monto total de tu pedido</li>
              <li>Guarda el comprobante de pago</li>
              <li>Envía el comprobante por WhatsApp junto con tu pedido</li>
              <li>¡Listo! Prepararemos tu pedido</li>
            </ol>
          </div>

          <div className="transfer-warning">
            <span>⚠️</span>
            <p>Importante: Tu pedido se confirmará una vez recibamos el comprobante de pago</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransferModal;