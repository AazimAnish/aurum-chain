const LoadingBubble = () => {
    return (
      <div className="flex items-center space-x-2 p-3 bg-gray-100 rounded-lg w-fit">
        <div className="loader flex space-x-1">
          <div className="h-2 w-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="h-2 w-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="h-2 w-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    );
  };
  
  export default LoadingBubble;