/**
 * Ventana con el diseño de la web que reemplaza a window.prompt y
 * window.confirm. Puede pedir un texto o solo pedir una confirmación.
 * @param {Object} props
 * @param {boolean} props.isOpen Si es true, la ventana se muestra.
 * @param {string} props.title Título de la ventana.
 * @param {string} [props.message] Texto que explica qué se pide o qué se va a hacer.
 * @param {'prompt'|'confirm'} [props.type] "prompt" muestra un cuadro de texto; "confirm" solo los botones. Por omisión, "prompt".
 * @param {string} [props.inputValue] Texto escrito en el cuadro de texto.
 * @param {(valor: string) => void} [props.onInputChange] Recibe el texto cada vez que cambia.
 * @param {() => void} props.onConfirm Se llama al pulsar el botón de confirmar.
 * @param {() => void} props.onClose Se llama al cancelar o cerrar la ventana.
 * @param {string} [props.confirmText] Texto del botón de confirmar. Por omisión, "Confirmar".
 * @param {string} [props.cancelText] Texto del botón de cancelar. Por omisión, "Cancelar".
 * @returns {JSX.Element|null} La ventana, o null si está cerrada.
 */
export default function Dialogos({
  isOpen,
  title,
  message,
  type = "prompt", // prompt pide un texto y confirm solo pregunta si o no
  inputValue = "",
  onInputChange = () => {},
  onConfirm,
  onClose,
  confirmText = "Confirmar",
  cancelText = "Cancelar"
}) {
  if (!isOpen) return null;

  return (
    <div 
      className="modal-overlay" 
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 2000
      }}
    >
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: '#fff',
          borderRadius: '8px',
          padding: '24px',
          width: '420px',
          maxWidth: '90%',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
          fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#222', fontWeight: '600' }}>
            {title}
          </h3>
          <button 
            onClick={onClose} 
            style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#888' }}
          >
            &times;
          </button>
        </div>

        {message && (
          <p style={{ fontSize: '0.92rem', color: '#555', marginBottom: '16px', lineHeight: '1.4' }}>
            {message}
          </p>
        )}

        {type === 'prompt' && (
          <textarea
            value={inputValue}
            onChange={(e) => onInputChange(e.target.value)}
            placeholder="Escribe el motivo aquí..."
            style={{
              width: '100%',
              minHeight: '80px',
              padding: '10px',
              borderRadius: '4px',
              border: '1px solid #ccc',
              marginBottom: '16px',
              resize: 'vertical',
              fontFamily: 'inherit',
              boxSizing: 'border-box'
            }}
          />
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button 
            onClick={onClose}
            style={{
              background: '#e0e0e0',
              color: '#333',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            {cancelText}
          </button>
          <button 
            onClick={onConfirm}
            style={{
              background: '#28a745',
              color: '#fff',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}