"use client"
import { useState, useRef, useEffect } from 'react';
// import { XMarkIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import logo from './assets/logo.jpg';
import Bubble from "./Bubble";
import LoadingBubble from "./LoadingBubble";
import PromptSuggestionRow from "./PromptSuggestionsRow";

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [width, setWidth] = useState(380); // Default width
  const [isResizing, setIsResizing] = useState(false);
  const resizeRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle resize functionality
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing) return;
      const newWidth = Math.max(300, Math.min(600, window.innerWidth - e.clientX));
      setWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.body.style.userSelect = '';
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = 'none'; // Prevent text selection during resize
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsResizing(true);
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!input.trim()) return;

    // Add user message
    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage]
        })
      });

      if (!response.ok) throw new Error('Request failed');

      const data = await response.json();

      setMessages(prev => [...prev, {
        id: Date.now().toString() + '-ai',
        role: 'assistant',
        content: data.response
      }]);
    } catch (error) {
      console.error("Chat error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrompt = (promptText) => {
    setInput(promptText);
    setTimeout(() => {
      const fakeEvent = { preventDefault: () => { } };
      handleSubmit(fakeEvent);
    }, 100);
  };

  const noMessages = messages.length === 0;

  return (
    <div className="fixed bottom-16 right-4 z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`bg-[#ECBD45] hover:bg-[#D9AD3C] text-white rounded-full p-3 shadow-lg transition-all duration-300 flex items-center justify-center ${isOpen ? 'scale-0' : 'scale-100'}`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 0 1-.825-.242m9.345-8.334a2.126 2.126 0 0 0-.476-.095 48.64 48.64 0 0 0-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0 0 11.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
        </svg>
      </button>

      <div
        className={`fixed bottom-16 right-0 bg-white shadow-xl rounded-tl-2xl rounded-bl-2xl border border-gray-200 transition-all duration-300 transform ${isOpen ? 'translate-x-0' : 'translate-x-full'} flex flex-col`}
        style={{
          width: `${width}px`,
          maxHeight: 'calc(100vh - 120px)', // Responsive height based on viewport
          height: '550px'
        }}
      >
        {/* Resize handle */}
        <div
          ref={resizeRef}
          className="absolute left-0 top-0 bottom-0 w-1 cursor-ew-resize bg-transparent hover:bg-blue-400 opacity-50 z-10"
          onMouseDown={handleMouseDown}
        ></div>

        {/* Header - Fixed */}
        <div className="bg-[#ECBD45] text-white px-4 py-3 rounded-tl-2xl flex items-center justify-between shrink-0">
          <div className="flex items-center">
            <Image src={logo} alt="logo" width={40} height={40} className="rounded-full mr-2 " />
            <h3 className="font-medium text-black">Gold Assistance</h3>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-white hover:bg-[#D9AD3C] rounded-full p-1">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6 ">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Chat Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50 custom-scrollbar">
          {noMessages ? (
            <>
              <p className="text-gray-600 mb-4">
                Here you can ask anything related to gold in India. I'll be happy to answer all your questions.
              </p>
              <PromptSuggestionRow onPromptClick={handlePrompt} />
            </>
          ) : (
            <div>
              {messages.map((message, index) => (
                <Bubble key={`message-${index}`} message={message} />
              ))}
              {isLoading && <LoadingBubble />}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Form - Fixed at bottom */}
        <form onSubmit={handleSubmit} className="p-3 border-t border-gray-200 flex shrink-0">
          <input
            className="flex-1 border border-gray-300 rounded-l-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
            onChange={handleInputChange}
            value={input}
            placeholder="Ask me something..."
            disabled={isLoading}
          />
          <button
            type="submit"
            className={`px-4 py-2 rounded-r-lg text-black transition ${isLoading ? 'bg-[#ECBD45]' : 'bg-[#ECBD45] hover:bg-[#D9AD3C]'}`}
            disabled={isLoading}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatWidget;