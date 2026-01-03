import './ErrorMessage.css';

interface ErrorMessageProps {
  message: string;
  className?: string;
}

export const ErrorMessage = ({ message, className = '' }: ErrorMessageProps) => {
  return (
    <div className={`error-message-container ${className}`}>
      {message}
    </div>
  );
};


