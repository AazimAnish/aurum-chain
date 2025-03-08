const Bubble = ({ message }) => {
    const { content, role } = message;
    
    return (
      <div className={`${role === 'user' ? 'ml-auto bg-blue-100' : 'mr-auto bg-white'} max-w-[80%] rounded-2xl p-3 mb-3 shadow-sm ${role === 'user' ? 'rounded-tr-none' : 'rounded-tl-none'}`}>
        {content}
      </div>
    );
  };
  
  export default Bubble;