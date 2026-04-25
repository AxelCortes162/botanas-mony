// src/components/DeliveryModal/DeliveryModal.jsx
import { useState, useEffect } from 'react';
import './DeliveryModal.css';

const DeliveryModal = ({ 
  config, 
  totalPrice, 
  onClose, 
  onConfirm 
}) => {
  const [deliveryMethod, setDeliveryMethod] = useState('pickup');
  const [address, setAddress] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [availableTimes, setAvailableTimes] = useState([]);

  // Generar horarios disponibles
  useEffect(() => {
    const times = [];
    const now = new Date();
    const openingParts = config.openingTime.split(':');
    const closingParts = config.closingTime.split(':');
    
    const openingHour = parseInt(openingParts[0]);
    const openingMinute = parseInt(openingParts[1]);
    const closingHour = parseInt(closingParts[0]);
    const closingMinute = parseInt(closingParts[1]);
    
    // Tiempo mínimo: ahora + preparación
    const minTime = new Date(now.getTime() + (config.preparationTime + 5) * 60000);
    
    for (let h = openingHour; h <= closingHour; h++) {
      for (let m = (h === openingHour ? openingMinute : 0); m < 60; m += config.scheduleInterval) {
        if (h === closingHour && m > closingMinute) break;
        
        const timeDate = new Date();
        timeDate.setHours(h, m, 0, 0);
        
        // Solo mostrar horarios futuros
        if (timeDate > minTime) {
          const timeString = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
          times.push({
            value: timeString,
            label: timeString,
            full: timeDate
          });
        }
      }
    }
    
    setAvailableTimes(times);
    if (times.length > 0) {
      setSelectedTime(times[0].value);
    }
  }, [config]);

  const deliveryTotal = deliveryMethod === 'delivery' ? config.deliveryCost : 0;
  const finalTotal = totalPrice + deliveryTotal;

  const handleConfirm = () => {
    if (deliveryMethod === 'delivery' && !address.trim()) {
      alert('Por favor ingresa la dirección de entrega');
      return;
    }
    
    onConfirm({
      method: deliveryMethod,
      address: deliveryMethod === 'delivery' ? address : config.address,
      time: selectedTime,
      deliveryCost: deliveryTotal,
      finalTotal: finalTotal
    });
  };

  return (
    <div className="delivery-modal-overlay" onClick={onClose}>
      <div className="delivery-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="delivery-modal-header">
          <h2 className="delivery-modal-title">
            <span>🚚</span> Método de Entrega
          </h2>
          <button className="delivery-modal-close" onClick={onClose}>×</button>
        </div>

        <div className="delivery-modal-body">
          {/* Selector de método */}
          <div className="delivery-method-section">
            <p className="section-label">¿Cómo quieres recibir tu pedido?</p>
            
            <div className="delivery-methods">
              {config.pickupEnabled && (
                <button 
                  className={`method-card ${deliveryMethod === 'pickup' ? 'active' : ''}`}
                  onClick={() => setDeliveryMethod('pickup')}
                >
                  <span className="method-icon">🏪</span>
                  <div className="method-info">
                    <span className="method-title">Recoger en Puesto</span>
                    <span className="method-description">Sin costo extra</span>
                    <span className="method-address">📍 {config.address}</span>
                  </div>
                  <div className="method-check">
                    {deliveryMethod === 'pickup' && '✓'}
                  </div>
                </button>
              )}
              
              {config.deliveryEnabled && (
                <button 
                  className={`method-card ${deliveryMethod === 'delivery' ? 'active' : ''}`}
                  onClick={() => setDeliveryMethod('delivery')}
                >
                  <span className="method-icon">🛵</span>
                  <div className="method-info">
                    <span className="method-title">Envío a Domicilio</span>
                    <span className="method-description">+${config.deliveryCost} envío</span>
                  </div>
                  <div className="method-check">
                    {deliveryMethod === 'delivery' && '✓'}
                  </div>
                </button>
              )}
            </div>
          </div>

          {/* Dirección (solo para domicilio) */}
          {deliveryMethod === 'delivery' && (
            <div className="address-section">
              <label htmlFor="delivery-address" className="section-label">
                📍 Dirección de entrega:
              </label>
              <textarea
                id="delivery-address"
                name="delivery-address"
                className="address-input"
                placeholder="Calle, número, colonia, referencias..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                rows="3"
              />
            </div>
          )}

          {/* Selector de horario */}
          <div className="schedule-section">
            <label htmlFor="pickup-time" className="section-label">
              🕐 ¿A qué hora quieres tu pedido?
            </label>
            <select
              id="pickup-time"
              name="pickup-time"
              className="time-select"
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
            >
              {availableTimes.map(time => (
                <option key={time.value} value={time.value}>
                  {time.label}
                </option>
              ))}
            </select>
            <small className="schedule-hint">
              ⏱️ Tiempo de preparación: {config.preparationTime} min
            </small>
          </div>

          {/* Resumen del pedido */}
          <div className="delivery-summary">
            <h4>📋 Resumen del Pedido</h4>
            <div className="summary-row">
              <span>Subtotal:</span>
              <span>${totalPrice}</span>
            </div>
            {deliveryMethod === 'delivery' && (
              <div className="summary-row">
                <span>Envío:</span>
                <span>+${config.deliveryCost}</span>
              </div>
            )}
            <div className="summary-row total">
              <span>Total:</span>
              <span>${finalTotal}</span>
            </div>
          </div>
        </div>

        <button 
          className="confirm-delivery-btn"
          onClick={handleConfirm}
        >
          ✅ Confirmar Pedido
        </button>
      </div>
    </div>
  );
};

export default DeliveryModal;