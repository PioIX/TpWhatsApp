// components/Message.js
"use client"

export default function Message(props) {
    return (
        <>
            <div className="message" style={{
                position: 'fixed',
                top: '20px',
                right: '20px',
                background: props.tipo === 'error' ? '#ffebee' : '#e8f5e8',
                color: props.tipo === 'error' ? '#c62828' : '#2e7d32',
                padding: '16px',
                borderRadius: '8px',
                border: `1px solid ${props.tipo === 'error' ? '#ef5350' : '#4caf50'}`,
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                zIndex: 1000,
                maxWidth: '400px'
            }}>
                {props.title && <h3 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>{props.title}</h3>}
                <p style={{ margin: 0 }}>{props.texto || props.message}</p>
                {props.onClose && (
                    <button 
                        onClick={props.onClose}
                        style={{
                            position: 'absolute',
                            top: '8px',
                            right: '8px',
                            background: 'none',
                            border: 'none',
                            fontSize: '18px',
                            cursor: 'pointer'
                        }}
                    >
                        ×
                    </button>
                )}
            </div>   
        </>
    )
}