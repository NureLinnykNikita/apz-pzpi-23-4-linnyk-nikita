import React from 'react';

// Button
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  style,
  ...props
}: ButtonProps) {
  const base: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    border: 'none',
    borderRadius: 'var(--lb-radius-pill)',
    fontFamily: 'var(--lb-font-sans)',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'var(--lb-trans)',
    outline: 'none',
    whiteSpace: 'nowrap',
  };

  const sizeStyles: Record<string, React.CSSProperties> = {
    sm: { fontSize: 12, padding: '6px 14px', height: 30 },
    md: { fontSize: 14, padding: '9px 20px', height: 38 },
    lg: { fontSize: 15, padding: '12px 28px', height: 46 },
  };

  const variantStyles: Record<string, React.CSSProperties> = {
    primary: { background: 'var(--lb-accent)', color: 'var(--lb-accent-ink)' },
    secondary: {
      background: 'transparent',
      color: 'var(--lb-accent)',
      border: '1px solid var(--lb-accent)',
    },
    ghost: {
      background: 'transparent',
      color: 'var(--lb-text-muted)',
      border: '1px solid var(--lb-line)',
    },
    danger: { background: 'var(--lb-danger)', color: '#fff' },
  };

  return (
    <button
      style={{ ...base, ...sizeStyles[size], ...variantStyles[variant], ...style }}
      {...props}
    >
      {children}
    </button>
  );
}

// Input
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  endAdornment?: React.ReactNode;
}

export function Input({ label, error, style, endAdornment, ...props }: InputProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {label && (
        <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--lb-text-muted)', letterSpacing: '0.02em' }}>
          {label}
        </label>
      )}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <input
          style={{
            background: 'var(--lb-panel)',
            border: `1px solid ${error ? 'var(--lb-danger)' : 'var(--lb-line)'}`,
            borderRadius: 'var(--lb-radius-sm)',
            color: 'var(--lb-text)',
            fontFamily: 'var(--lb-font-sans)',
            fontSize: 14,
            fontWeight: 500,
            padding: endAdornment ? '10px 40px 10px 14px' : '10px 14px',
            outline: 'none',
            width: '100%',
            transition: 'border-color var(--lb-trans)',
            ...style,
          }}
          {...props}
        />
        {endAdornment && (
          <div style={{ position: 'absolute', right: 12, display: 'flex', alignItems: 'center' }}>
            {endAdornment}
          </div>
        )}
      </div>
      {error && <span style={{ fontSize: 12, color: 'var(--lb-danger)' }}>{error}</span>}
    </div>
  );
}

// Card
interface CardProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
  onClick?: () => void;
  hoverable?: boolean;
}

export function Card({ children, style, onClick, hoverable }: CardProps) {
  return (
    <div
      onClick={onClick}
      style={{
        background: 'var(--lb-panel)',
        border: '1px solid var(--lb-line)',
        borderRadius: 'var(--lb-radius-xl)',
        padding: 'var(--lb-card-pad)',
        cursor: onClick || hoverable ? 'pointer' : undefined,
        transition: hoverable ? 'transform var(--lb-trans), background var(--lb-trans)' : undefined,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// Badge
interface BadgeProps {
  children: React.ReactNode;
  variant?: 'accent' | 'secondary' | 'muted' | 'success' | 'danger';
  style?: React.CSSProperties;
}

export function Badge({ children, variant = 'muted', style }: BadgeProps) {
  const variantStyles: Record<string, React.CSSProperties> = {
    accent: { background: 'var(--lb-accent-tint)', color: 'var(--lb-accent)', border: '1px solid var(--lb-line)' },
    secondary: { background: 'rgba(196,106,74,0.15)', color: 'var(--lb-secondary)', border: '1px solid rgba(196,106,74,0.3)' },
    muted: { background: 'var(--lb-panel-soft)', color: 'var(--lb-text-muted)', border: '1px solid var(--lb-line)' },
    success: { background: 'rgba(168,196,162,0.15)', color: 'var(--lb-success)', border: '1px solid rgba(168,196,162,0.3)' },
    danger: { background: 'rgba(215,114,96,0.15)', color: 'var(--lb-danger)', border: '1px solid rgba(215,114,96,0.3)' },
  };

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        borderRadius: 'var(--lb-radius-pill)',
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: '0.05em',
        padding: '3px 10px',
        ...variantStyles[variant],
        ...style,
      }}
    >
      {children}
    </span>
  );
}

// Toggle
interface ToggleProps {
  value: boolean;
  onChange: (v: boolean) => void;
}

export function Toggle({ value, onChange }: ToggleProps) {
  return (
    <div
      onClick={() => onChange(!value)}
      style={{
        width: 42,
        height: 24,
        borderRadius: 12,
        background: value ? 'var(--lb-accent)' : 'var(--lb-panel-soft)',
        border: `1px solid ${value ? 'var(--lb-accent)' : 'var(--lb-line)'}`,
        cursor: 'pointer',
        position: 'relative',
        transition: 'background 0.2s, border-color 0.2s',
        flexShrink: 0,
      }}
    >
      <div
        style={{
          width: 16,
          height: 16,
          borderRadius: '50%',
          background: value ? 'var(--lb-accent-ink)' : 'var(--lb-text-muted)',
          position: 'absolute',
          top: 3,
          left: value ? 22 : 3,
          transition: 'left 0.2s',
        }}
      />
    </div>
  );
}

// Modal
interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  width?: number;
}

export function Modal({ open, onClose, title, children, width = 480 }: ModalProps) {
  if (!open) return null;
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          background: 'var(--lb-panel)',
          border: '1px solid var(--lb-line)',
          borderRadius: 'var(--lb-radius-xl)',
          padding: 28,
          width,
          maxWidth: '90vw',
          maxHeight: '90vh',
          overflow: 'auto',
        }}
      >
        {title && (
          <h3 style={{ margin: '0 0 20px', fontSize: 18, fontWeight: 700 }}>{title}</h3>
        )}
        {children}
      </div>
    </div>
  );
}

// ProgressBar
interface ProgressBarProps {
  value: number;
  max?: number;
  color?: string;
  height?: number;
}

export function ProgressBar({ value, max = 100, color = 'var(--lb-accent)', height = 6 }: ProgressBarProps) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div
      style={{
        height,
        borderRadius: 'var(--lb-radius-xs)',
        background: 'var(--lb-panel-deep)',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          height: '100%',
          width: `${pct}%`,
          background: color,
          borderRadius: 'var(--lb-radius-xs)',
          transition: 'width 0.4s ease',
        }}
      />
    </div>
  );
}

// Select
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export function Select({ label, error, options, style, ...props }: SelectProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {label && (
        <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--lb-text-muted)', letterSpacing: '0.02em' }}>
          {label}
        </label>
      )}
      <select
        style={{
          background: 'var(--lb-panel)',
          border: `1px solid ${error ? 'var(--lb-danger)' : 'var(--lb-line)'}`,
          borderRadius: 'var(--lb-radius-sm)',
          color: 'var(--lb-text)',
          fontFamily: 'var(--lb-font-sans)',
          fontSize: 14,
          fontWeight: 500,
          padding: '10px 14px',
          outline: 'none',
          width: '100%',
          cursor: 'pointer',
          ...style,
        }}
        {...props}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {error && <span style={{ fontSize: 12, color: 'var(--lb-danger)' }}>{error}</span>}
    </div>
  );
}

// Spinner
export function Spinner({ size = 24 }: { size?: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        border: `2px solid var(--lb-line)`,
        borderTop: `2px solid var(--lb-accent)`,
        borderRadius: '50%',
        animation: 'spin 0.7s linear infinite',
      }}
    />
  );
}
