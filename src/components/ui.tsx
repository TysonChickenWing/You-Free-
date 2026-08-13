import type { ButtonHTMLAttributes, InputHTMLAttributes, PropsWithChildren } from 'react';

export function Screen({ children, className = '' }: PropsWithChildren<{ className?: string }>) {
  return (
    <div className={`mx-auto flex min-h-dvh w-full max-w-2xl flex-col gap-4 bg-background px-5 py-6 ${className}`}>
      {children}
    </div>
  );
}

export function Card({ children, className = '' }: PropsWithChildren<{ className?: string }>) {
  return (
    <div className={`rounded-lg border border-border bg-surface p-4 ${className}`}>{children}</div>
  );
}

export function Title({ children }: PropsWithChildren) {
  return <h1 className="text-3xl font-bold text-text-primary">{children}</h1>;
}

export function Heading({ children }: PropsWithChildren) {
  return <h2 className="text-xl font-bold text-text-primary">{children}</h2>;
}

export function Subheading({ children }: PropsWithChildren) {
  return <h3 className="text-base font-semibold text-text-primary">{children}</h3>;
}

export function Body({ children, muted }: PropsWithChildren<{ muted?: boolean }>) {
  return <p className={`text-[15px] ${muted ? 'text-text-secondary' : 'text-text-primary'}`}>{children}</p>;
}

export function Caption({ children }: PropsWithChildren) {
  return <p className="text-[13px] text-text-muted">{children}</p>;
}

type Variant = 'primary' | 'secondary' | 'golf' | 'danger';

const variantClasses: Record<Variant, string> = {
  primary: 'bg-primary text-on-primary hover:opacity-90',
  secondary: 'bg-surface text-text-primary border border-border hover:bg-background',
  golf: 'bg-golf text-on-golf hover:opacity-90',
  danger: 'bg-danger text-white hover:opacity-90',
};

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className'> {
  label: string;
  variant?: Variant;
  loading?: boolean;
}

export function Button({ label, variant = 'primary', loading, disabled, ...rest }: ButtonProps) {
  const isDisabled = disabled || loading;
  return (
    <button
      type="button"
      disabled={isDisabled}
      className={`rounded-md px-4 py-3 text-[15px] font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${variantClasses[variant]}`}
      {...rest}
    >
      {loading ? 'Working…' : label}
    </button>
  );
}

interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'className'> {
  label?: string;
}

export function TextField({ label, id, ...rest }: TextFieldProps) {
  return (
    <label className="flex flex-col gap-1" htmlFor={id}>
      {label ? <span className="text-[13px] text-text-secondary">{label}</span> : null}
      <input
        id={id}
        className="rounded-md border border-border bg-surface px-4 py-3 text-[15px] text-text-primary outline-none focus:border-primary"
        {...rest}
      />
    </label>
  );
}

export function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-1 px-6 py-10 text-center">
      <Subheading>{title}</Subheading>
      <Body muted>{body}</Body>
    </div>
  );
}
