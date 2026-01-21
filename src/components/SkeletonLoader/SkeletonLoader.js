import './SkeletonLoader.css';

const SkeletonLoader = ({ type = 'post', count = 1 }) => {
  const renderPostSkeleton = () => (
    <div className="skeleton-post">
      <div className="skeleton-header">
        <div className="skeleton-avatar"></div>
        <div className="skeleton-author-info">
          <div className="skeleton-line skeleton-name"></div>
          <div className="skeleton-line skeleton-time"></div>
        </div>
      </div>
      <div className="skeleton-content">
        <div className="skeleton-line skeleton-text"></div>
        <div className="skeleton-line skeleton-text"></div>
        <div className="skeleton-line skeleton-text short"></div>
      </div>
      <div className="skeleton-image"></div>
      <div className="skeleton-actions">
        <div className="skeleton-button"></div>
        <div className="skeleton-button"></div>
        <div className="skeleton-button"></div>
      </div>
    </div>
  );

  const renderCardSkeleton = () => (
    <div className="skeleton-card">
      <div className="skeleton-card-image"></div>
      <div className="skeleton-card-content">
        <div className="skeleton-line skeleton-title"></div>
        <div className="skeleton-line skeleton-subtitle"></div>
      </div>
    </div>
  );

  const renderListSkeleton = () => (
    <div className="skeleton-list-item">
      <div className="skeleton-avatar small"></div>
      <div className="skeleton-list-content">
        <div className="skeleton-line skeleton-name"></div>
        <div className="skeleton-line skeleton-subtitle"></div>
      </div>
    </div>
  );

  const renderCommentSkeleton = () => (
    <div className="skeleton-comment">
      <div className="skeleton-avatar small"></div>
      <div className="skeleton-comment-bubble">
        <div className="skeleton-line skeleton-text"></div>
        <div className="skeleton-line skeleton-text short"></div>
      </div>
    </div>
  );

  const renderSkeleton = () => {
    switch (type) {
      case 'post':
        return renderPostSkeleton();
      case 'card':
        return renderCardSkeleton();
      case 'list':
        return renderListSkeleton();
      case 'comment':
        return renderCommentSkeleton();
      default:
        return renderPostSkeleton();
    }
  };

  return (
    <div className="skeleton-loader">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index}>{renderSkeleton()}</div>
      ))}
    </div>
  );
};

export default SkeletonLoader;
