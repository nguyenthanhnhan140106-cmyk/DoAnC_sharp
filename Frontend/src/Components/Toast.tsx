import { useMusic } from '../Contexts/MusicContext';

export default function Toast() {
  const { toast } = useMusic() as any;

  if (!toast) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: toast.visible ? '110px' : '70px',
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: '#ffffff',
        color: '#000000',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '8px 16px 8px 8px',
        borderRadius: '4px',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
        zIndex: 9999,
        opacity: toast.visible ? 1 : 0,
        pointerEvents: 'none',
        transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
        minWidth: '240px',
        maxWidth: '450px',
      }}
    >
      {toast.coverUrl && (
        <img
          src={toast.coverUrl}
          alt="cover"
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '4px',
            objectFit: 'cover',
          }}
        />
      )}
      <span
        style={{
          fontFamily: 'Inter, system-ui, sans-serif',
          fontSize: '13px',
          fontWeight: 600,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {toast.message}
      </span>
    </div>
  );
}
