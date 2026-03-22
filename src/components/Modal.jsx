import './Modal.css';

const Modal = ({ isOpen, onClose, onConfirm, title, message, pokemon }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h2>{title}</h2>
                {pokemon && (
                    <div style={{ textAlign: 'center' }}>
                        <img src={pokemon.image} alt={pokemon.name.french} style={{ width: '100px' }} />
                        <p><strong>{pokemon.name.french}</strong></p>
                    </div>
                )}
                <p>{message}</p>
                <p style={{ color: 'red', fontWeight: 'bold' }}>⚠️ Cette action est irréversible !</p>
                
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '20px' }}>
                    <button onClick={onClose} style={{ padding: '10px 20px' }}>
                        Annuler
                    </button>
                    <button 
                        onClick={onConfirm} 
                        style={{ 
                            padding: '10px 20px', 
                            backgroundColor: '#dc3545', 
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer'
                        }}
                    >
                        Confirmer la suppression
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Modal;