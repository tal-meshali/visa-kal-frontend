import { useEffect, useState } from "react";
import "./LoadingScreen.css";

const LoadingScreen = ({
  message,
  progress,
  showProgress = true,
}: {
  message?: string;
  progress?: number; // 0-100, if not provided, will animate automatically
  showProgress?: boolean;
}) => {
  const [animatedProgress, setAnimatedProgress] = useState(0);

  // Auto-animate progress if not provided
  useEffect(() => {
    if (progress === undefined) {
      const interval = setInterval(() => {
        setAnimatedProgress((prev) => {
          if (prev >= 90) {
            return prev; // Stop at 90% until actual progress is known
          }
          return prev + Math.random() * 10;
        });
      }, 200);

      return () => clearInterval(interval);
    }
  }, [progress]);

  const displayProgress = progress ?? animatedProgress;
  const clampedProgress = Math.min(100, Math.max(0, displayProgress));

  return (
    <div className="loading-screen-overlay">
      <div className="loading-screen-content">
        <div className="loading-spinner">
          <div className="spinner-ring" />
          <div className="spinner-ring" />
          <div className="spinner-ring" />
        </div>
        {message && <p className="loading-message">{message}</p>}
        {showProgress && (
          <div className="progress-container">
            <div className="progress-bar-wrapper">
              <div
                className="progress-bar"
                style={{ width: `${clampedProgress}%` }}
              ></div>
            </div>
            <span className="progress-text">
              {Math.round(clampedProgress)}%
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoadingScreen;
