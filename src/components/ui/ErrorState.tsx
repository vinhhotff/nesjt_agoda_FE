interface ErrorStateProps {
  title?: string;
  message?: string;
  icon?: string;
  onRetry?: () => void;
  retryText?: string;
  className?: string;
}

export default function ErrorState({
  title = "Oops! Something went wrong",
  message = "We couldn't load the data. Please check your connection and try again.",
  icon = "😕",
  onRetry,
  retryText = "Retry",
  className = ""
}: ErrorStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center text-center ${className}`}>
      <div className="text-6xl mb-4 opacity-50">{icon}</div>
      <h2 className="text-2xl font-bold text-red-400 mb-2">{title}</h2>
      <p className="text-gray-400 mb-6 max-w-md">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="bg-yellow-500 text-gray-900 px-6 py-3 rounded-lg font-medium hover:bg-yellow-400 transition-colors"
        >
          {retryText}
        </button>
      )}
    </div>
  );
}
