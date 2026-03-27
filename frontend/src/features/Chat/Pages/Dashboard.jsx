import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { 
  Plus, History, User, Image as ImageIcon, Menu,
  FileText, ChevronDown, Sparkles,
  LogOut, File, Trash2, ArrowRight, MoreHorizontal, Share
} from 'lucide-react'
import { useDashboard } from '../Hooks/useDashboard'
import PageLoader from '../../Auth/Components/PageLoader'

const SidebarItem = ({ icon: Icon, label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[15px] transition-colors ${active ? 'bg-[#2b2d31] text-white font-medium' : 'text-gray-400 hover:bg-[#2b2d31] hover:text-white'}`}
  >
    <Icon size={20} strokeWidth={2} />
    {label}
  </button>
)

const SuggestedQuestion = ({ question, onClick }) => (
  <button 
    onClick={onClick}
    className="w-full text-left text-[15px] text-gray-400 mb-4 hover:text-white transition-colors flex items-center gap-2"
  >
    {question}
  </button>
)

const Dashboard = () => {
  const {
    chatInput, setChatInput,
    isSidebarOpen, setIsSidebarOpen,
    isFocused, setIsFocused,
    attachments,
    selectedModel, setSelectedModel,
    showModelDropdown, setShowModelDropdown,
    showHistory, setShowHistory,
    showAuthModal, setShowAuthModal,
    showMoreMenu, setShowMoreMenu,
    chats, currentChatId,
    authUser, isAuthLoading, isLoading,
    messagesEndRef, fileInputRef, imageInputRef,
    requireAuth, handleSubmitMessage, openChat,
    startNewThread, handleLogout, handleDeleteChat,
    toggleAttachmentDropdown, handleImageClick, handleFileClick, handleFileChange, removeAttachment,
    exportAsPDF, shareMessage,
    currentMessages, hasMessages,
    showAttachmentDropdown, setShowAttachmentDropdown,
    navigate
  } = useDashboard();

  if (isAuthLoading) {
    return <PageLoader />
  }

  return (
    <div className="flex h-screen w-full bg-[#07090f] font-sans selection:bg-[#00a8aa]/30 relative overflow-hidden">
      
      
      {showAuthModal && (
         <div className="absolute inset-0 z-[200] bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-4">
             <div className="bg-[#07090f] p-8 rounded-2xl border border-[#3b3d41] text-center max-w-sm w-full animate-in fade-in zoom-in duration-300">
                 <h2 className="text-3xl font-['Playfair_Display',serif] text-white mb-2">perplexity</h2>
                 <p className="text-gray-400 mb-6 mt-4">If you want to access something , you need to log in first.</p>
                 <div className="flex gap-4">
                     <button onClick={() => navigate('/login')} className="flex-1 py-2.5 bg-white text-black hover:bg-gray-200 rounded-full font-medium transition-colors">
                         Sign In
                     </button>
                     <button onClick={() => navigate('/register')} className="flex-1 py-2.5 bg-[#2b2d31] hover:bg-[#3b3d41] text-white border border-[#3b3d41] rounded-full font-medium transition-colors">
                         Register
                     </button>
                 </div>
                 <button onClick={() => setShowAuthModal(false)} className="mt-4 text-sm text-gray-500 hover:text-white transition">Cancel</button>
             </div>
         </div>
      )}
    
      {showHistory && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowHistory(false)}>
           <div className="w-full max-w-lg bg-[#07090f] rounded-2xl border border-[#3b3d41] p-6 text-white max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-4">
                 <h2 className="text-xl font-semibold">Chat History</h2>
                 <button onClick={() => setShowHistory(false)} className="text-gray-400 hover:text-white text-3xl font-light">&times;</button>
              </div>
              <div className="flex-1 overflow-y-auto space-y-2 no-scrollbar pr-2">
                 {Object.values(chats).length > 0 ? Object.values(chats).map(chatObj => (
                     <div key={chatObj.id} className="w-full flex items-center justify-between group px-3 py-3 rounded-xl bg-[#2b2d31] hover:bg-[#3b3d41] transition-colors">
                        <button onClick={(e) => { openChat(e, chatObj.id); setShowHistory(false); }} className="flex-1 text-left truncate pr-4">
                           {chatObj.title?.replace(/[*#"']/g, '').trim() || 'New Thread'}
                        </button>
                        <button onClick={(e) => handleDeleteChat(e, chatObj.id)} className="text-gray-400 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-2">
                          <Trash2 size={16} />
                        </button>
                     </div>
                 )) : <p className="text-gray-500">No chat history available.</p>}
              </div>
           </div>
        </div>
      )}

      
      <input 
        type="file" 
        multiple 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        className="hidden" 
      />
      <input 
        type="file" 
        accept="image/*" 
        multiple 
        ref={imageInputRef} 
        onChange={handleFileChange} 
        className="hidden" 
      />

      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

   
      <aside className={`fixed inset-y-0 left-0 z-50 flex h-full w-[250px] shrink-0 flex-col border-r border-[#2b2d31] bg-[#07090f] transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full overflow-y-auto no-scrollbar">
          
          <div className="p-3 pt-5">
            <div className="flex items-center gap-2 mb-5 ml-2">
              <img src="/assets/perplexity.png" alt="Logo" className="w-8 h-8 rounded-lg shadow-lg" />
              <h1 className="text-2xl font-['Playfair_Display',serif] tracking-tight text-gray-200">perplexity</h1>
            </div>
            <button onClick={startNewThread} className="w-full flex items-center justify-between px-3 py-2.5 rounded-full border border-[#3b3d41] text-sm font-medium text-gray-300 hover:bg-[#2b2d31] transition-colors">
              <div className="flex items-center gap-2">
                <Plus size={16} />
                New chat
              </div>
            </button>
          </div>

          <div className="px-3 pb-2 space-y-1">
            <SidebarItem icon={History} label="History" onClick={(e) => { if (requireAuth(e)) setShowHistory(true) }} />
          </div>

          <div className="p-3 mt-2 flex-1">
            <h3 className="text-xs font-semibold text-gray-500 mb-3 px-3">Recent</h3>
            <div className="px-1">
              {Object.values(chats).length > 0 ? (
                Object.values(chats).map((chatObj) => (
                  <div key={chatObj.id} className={`w-full flex items-center justify-between group px-2 py-1.5 rounded-md text-sm transition-colors ${currentChatId === chatObj.id ? 'text-white bg-[#2b2d31]' : 'text-gray-400 hover:text-white hover:bg-[#2b2d31]'}`}>
                    <button
                      onClick={(e) => openChat(e, chatObj.id)}
                      className="flex-1 text-left truncate"
                    >
                      {chatObj.title?.replace(/[*#"']/g, '').trim() || 'New Thread'}
                    </button>
                    <button 
                      onClick={(e) => handleDeleteChat(e, chatObj.id)} 
                      className="text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-xs text-gray-500 px-2 line-clamp-3">Recent and active threads will appear here.</p>
              )}
            </div>
          </div>
        </div>

        <div className="p-3 border-t border-[#2b2d31] bg-[#07090f]">
          {authUser ? (
            <button 
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-3 py-2 text-sm text-gray-300 hover:bg-[#2b2d31] rounded-lg transition-colors font-medium relative group"
            >
              <div className="w-6 h-6 rounded-full bg-gray-600 flex items-center justify-center text-white shrink-0">
                {authUser.username?.[0]?.toUpperCase() || 'U'}
              </div>
              <span className="flex-1 text-left truncate group-hover:hidden">{authUser.username}</span>
              <span className="flex-1 text-left truncate hidden group-hover:block text-red-400">Log out</span>
              <LogOut size={16} className="text-gray-500 group-hover:text-red-400 shrink-0" />
            </button>
          ) : (
            <button onClick={() => navigate('/login')} className="flex-1 items-center flex gap-3 w-full px-3 py-2 text-sm text-[#00a8aa] hover:bg-[#2b2d31] rounded-lg transition-colors font-medium">
              <div className="w-6 h-6 rounded-full bg-[#00a8aa]/20 flex items-center justify-center shrink-0">
                <User size={14} />
              </div>
              Sign In
            </button>
          )}
        </div>
      </aside>

      
      <main className="relative flex h-full w-full min-w-0 flex-1 flex-col">
        
       
        <header className="sticky top-0 z-30 flex items-center justify-between md:hidden px-4 py-3 border-b border-[#2b2d31] bg-[#07090f]">
          <button onClick={() => setIsSidebarOpen(true)} className="text-gray-400 hover:text-white transition p-2 -ml-2 cursor-pointer touch-manipulation">
            <Menu size={24} />
          </button>
          <div className="flex items-center gap-2">
            <img src="/assets/perplexity.png" alt="Logo" className="w-7 h-7 rounded-md" />
            <h1 className="text-lg font-semibold tracking-wide text-gray-200">perplexity</h1>
          </div>
          <div className="w-6"></div>
        </header>

       
        <div className={`flex-1 overflow-y-auto no-scrollbar scroll-smooth ${hasMessages ? 'px-4 md:px-12 pb-40' : 'flex flex-col items-center justify-center -mt-10'}`}>
          
          {!hasMessages ? (
          
            <div className="w-full max-w-[720px] px-4 animate-in fade-in duration-500">
              <h1 className="text-5xl font-['Playfair_Display',serif] tracking-tight mb-8 text-center text-gray-200">Perplexity</h1>

             
              <div className={`relative w-full rounded-[24px] bg-[#202222] border transition-all duration-200 p-2 md:p-3 ${isFocused ? 'border-gray-500 ring-1 ring-gray-500' : 'border-[#3b3d41]'}`}>
                
          
                {attachments.length > 0 && (
                  <div className="flex flex-wrap gap-2 px-3 pt-2 pb-1">
                    {attachments.map((file, i) => {
                      const FileIcon = file.type.startsWith('image/') ? ImageIcon : (file.type === 'application/pdf' ? FileText : File);
                      return (
                      <span key={i} className="px-2.5 py-1.5 text-xs rounded-lg bg-[#3b3d41] text-gray-200 flex items-center gap-2 group">
                        <FileIcon size={14} className="text-[#00a8aa]" />
                        <span className="truncate max-w-[150px]">{file.name}</span>
                        <button onClick={() => removeAttachment(i)} className="text-gray-400 hover:text-white ml-1">&times;</button>
                      </span>
                    )})}
                  </div>
                )}

                <textarea
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onFocus={(e) => {
                     if (!requireAuth(e)) {
                         e.target.blur();
                         return;
                     }
                     setIsFocused(true)
                  }}
                  onBlur={() => setIsFocused(false)}
                  placeholder="Ask anything......."
                  className="w-full bg-transparent text-white placeholder-gray-500 text-lg sm:text-lg md:text-xl outline-none resize-none px-3 py-2 min-h-[64px]"
                  rows={1}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      if (requireAuth(e)) handleSubmitMessage(e);
                    }
                  }}
                />
                
                 <div className="flex items-center justify-between mt-1 px-1">
                  <div className="relative">
                    <button onClick={toggleAttachmentDropdown} className="p-2 text-gray-400 hover:text-white rounded-full transition-colors hover:bg-[#2b2d31]">
                      <Plus size={20} strokeWidth={2.5} />
                    </button>
                    
                    {showAttachmentDropdown && (
                      <React.Fragment>
                        <div className="fixed inset-0 z-10" onClick={() => setShowAttachmentDropdown(false)}></div>
                        <div className="absolute bottom-full left-0 mb-2 w-48 bg-[#2b2d31] border border-[#3b3d41] rounded-xl shadow-2xl overflow-hidden z-20 animate-in slide-in-from-bottom-2 duration-200">
                          <button 
                            onClick={handleImageClick}
                            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:bg-[#3b3d41] hover:text-white transition-colors"
                          >
                            <ImageIcon size={18} className="text-[#00a8aa]" />
                            Upload Image
                          </button>
                          <button 
                            onClick={handleFileClick}
                            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:bg-[#3b3d41] hover:text-white transition-colors border-t border-[#3b3d41]"
                          >
                            <FileText size={18} className="text-[#00a8aa]" />
                            Upload PDF/File
                          </button>
                        </div>
                      </React.Fragment>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 md:gap-2">
                    
                    <div className="relative">
                      <button 
                        onClick={() => setShowModelDropdown(!showModelDropdown)} 
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium text-gray-400 hover:text-white hover:bg-[#2b2d31] transition-colors"
                      >
                        {selectedModel} <ChevronDown size={14} />
                      </button>
                      
                      {showModelDropdown && (
                        <React.Fragment>
                          <div className="fixed inset-0 z-10" onClick={() => setShowModelDropdown(false)}></div>
                          <div className="absolute bottom-full mb-2 left-0 w-36 bg-[#2b2d31] border border-[#3b3d41] rounded-lg shadow-xl overflow-hidden z-20">
                            {['Standard', 'Pro', 'Claude 3', 'GPT-4o'].map(m => (
                              <button 
                                key={m} 
                                onClick={() => { setSelectedModel(m); setShowModelDropdown(false) }} 
                                className={`w-full text-left px-3 py-2 text-sm transition-colors ${selectedModel === m ? 'text-white bg-[#3b3d41]' : 'text-gray-300 hover:bg-[#3b3d41] hover:text-white'}`}
                              >
                                {m}
                              </button>
                            ))}
                          </div>
                        </React.Fragment>
                      )}
                    </div>

                    <button 
                      type="button"
                      className="p-2 text-[#202222] bg-white hover:bg-gray-200 rounded-full transition-colors ml-1 disabled:opacity-50 disabled:cursor-not-allowed" 
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleSubmitMessage(e); }} 
                      disabled={!chatInput.trim() && attachments.length === 0}
                      title="Send message"
                    >
                       <ArrowRight size={18} strokeWidth={2.5} />
                    </button>
                  </div>
                </div>
              </div>

             
              <div className="mt-8 flex flex-col items-start w-full px-2">
                <SuggestedQuestion question="How do I fix a leaky faucet?" onClick={(e) => { if(requireAuth(e)) setChatInput("How do I fix a leaky faucet?") }} />
                <SuggestedQuestion question="How do I change the oil in my car?" onClick={(e) => { if(requireAuth(e)) setChatInput("How do I change the oil in my car?") }} />
                <SuggestedQuestion question="How do I remove a computer virus?" onClick={(e) => { if(requireAuth(e)) setChatInput("How do I remove a computer virus?") }} />
              </div>
            </div>
          ) : (
           
            <div className="max-w-[760px] mx-auto w-full space-y-6">
              
            
              <div className="sticky top-0 z-10 bg-[#07090f] pt-2 md:pt-3 flex items-center justify-between border-b border-[#2b2d31] pb-2 mb-6 w-full text-sm">
                 <div className="flex items-center gap-6">
                    <button className="flex items-center gap-2 text-white border-b-2 border-white pb-2 -mb-[9px] font-medium">
                       <Sparkles size={16} />
                       Answer
                    </button>
                 </div>
                 <div className="flex items-center gap-2 pb-1">
                 
                    <div className="relative">
                       <button 
                         onClick={() => setShowMoreMenu(!showMoreMenu)} 
                         className="p-1.5 text-gray-400 hover:text-white rounded-md transition-colors"
                         title="More options"
                       >
                          <MoreHorizontal size={18} />
                       </button>

                       {showMoreMenu && (
                          <React.Fragment>
                             <div className="fixed inset-0 z-10" onClick={() => setShowMoreMenu(false)}></div>
                             <div className="absolute top-full right-0 mt-2 w-48 bg-[#2b2d31] border border-[#3b3d41] rounded-xl shadow-2xl overflow-hidden z-20 animate-in slide-in-from-top-2 duration-200">
                                <button 
                                  onClick={() => { exportAsPDF(currentMessages.map(m => `**${m.role === 'user' ? 'User' : 'Perplexity'}**:\n\n${m.content}`).join('\n\n---\n\n')); setShowMoreMenu(false); }} 
                                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:bg-[#3b3d41] hover:text-white transition-colors"
                                >
                                   <FileText size={16} className="text-[#00a8aa]" />
                                   Export as PDF
                                </button>
                                <button 
                                  onClick={(e) => { handleDeleteChat(e, currentChatId); setShowMoreMenu(false); }} 
                                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-[#3b3d41] transition-colors border-t border-[#3b3d41]"
                                >
                                   <Trash2 size={16} />
                                   Delete Chat
                                </button>
                             </div>
                          </React.Fragment>
                       )}
                    </div>
                 
                    <button 
                      onClick={() => shareMessage(currentMessages.map(m => `**${m.role === 'user' ? 'User' : 'Perplexity'}**:\n\n${m.content}`).join('\n\n---\n\n'))} 
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-[#e8e8e6] hover:bg-gray-300 text-black text-sm font-medium rounded-full transition-colors"
                    >
                       <Share size={14} />
                       Share
                    </button>
                 </div>
              </div>

              {currentMessages.map((message, index) => (
                <div
                  key={message.id || index}
                  className={`flex w-full ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[100%] md:max-w-[85%] text-[15px] md:text-base leading-relaxed break-words overflow-hidden ${
                      message.role === 'user'
                      ? 'bg-[#2b2d31] text-gray-100 px-5 py-3.5 rounded-[24px] rounded-br-none'
                      : 'text-gray-200 font-normal pr-4 pb-2'
                    }`}
                  >
                    {message.role === 'user' ? (
                      <ReactMarkdown
                        urlTransform={(value) => value}
                        components={{
                          p: ({ children }) => <p className='whitespace-pre-wrap break-words w-full'>{children}</p>,
                          img: ({ src, alt }) => <img src={src} alt={alt} className="max-w-full rounded-xl mb-3 max-h-80 object-contain" />
                        }}
                      >
                        {message.content.replace(/<pdf_text>[\s\S]*?<\/pdf_text>/g, '')}
                      </ReactMarkdown>
                    ) : (
                       <div className="w-full">
                         <ReactMarkdown
                          urlTransform={(value) => value}
                        components={{
                          p: ({ children }) => <p className='mb-4 last:mb-0'>{children}</p>,
                          ul: ({ children }) => <ul className='mb-4 list-disc pl-6 space-y-1.5 marker:text-gray-500'>{children}</ul>,
                          ol: ({ children }) => <ol className='mb-4 list-decimal pl-6 space-y-1.5 marker:text-gray-500'>{children}</ol>,
                          li: ({ children }) => <li className='pl-1'>{children}</li>,
                          code: ({ inline, children }) => inline 
                            ? <code className='rounded bg-[#2b2d31] px-1.5 py-0.5 text-[14px] text-gray-200 font-mono'>{children}</code>
                            : <pre className='mb-5 overflow-x-auto rounded-xl bg-[#0d0e10] p-4 text-[13px] text-gray-300 font-mono border border-[#2b2d31]'>{children}</pre>,
                          h1: ({ children }) => <h1 className='text-2xl font-semibold mb-4 mt-6 text-white'>{children}</h1>,
                          h2: ({ children }) => <h2 className='text-xl font-semibold mb-3 mt-5 text-white'>{children}</h2>,
                          h3: ({ children }) => <h3 className='text-lg font-medium mb-2 mt-4 text-white'>{children}</h3>,
                          a: ({ children, href }) => <a href={href} className="text-[#00a8aa] hover:underline" target="_blank" rel="noreferrer">{children}</a>,
                          strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>
                        }}
                        remarkPlugins={[remarkGfm]}
                      >
                        {message.content}
                      </ReactMarkdown>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex w-full justify-start">
                  <div className="max-w-[90%] md:max-w-[85%] text-[15px] md:text-base leading-relaxed font-normal flex items-center gap-3">
                    <div className="flex space-x-1.5 items-center mt-1">
                      <div className="w-2 h-2 rounded-full bg-[#00a8aa] animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 rounded-full bg-[#00a8aa] animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 rounded-full bg-[#00a8aa] animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                    <span className="text-[#00a8aa] animate-pulse font-medium text-[15px]">Thinking...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {hasMessages && (
          <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-[#07090f] via-[#07090f] to-transparent pt-10 pb-6 md:pb-10 px-4">
            <div className="max-w-[760px] mx-auto w-full">
               <div className={`relative w-full rounded-[20px] bg-[#202222] border transition-all duration-200 p-2 ${isFocused ? 'border-gray-500 ring-1 ring-gray-500' : 'border-[#3b3d41]'}`}>
                
                {attachments.length > 0 && (
                  <div className="flex flex-wrap gap-2 px-3 pt-2 pb-1">
                    {attachments.map((file, i) => {
                      const FileIcon = file.type.startsWith('image/') ? ImageIcon : (file.type === 'application/pdf' ? FileText : File);
                      return (
                      <span key={i} className="px-2.5 py-1.5 text-xs rounded-lg bg-[#3b3d41] text-gray-200 flex items-center gap-2 group">
                        <FileIcon size={14} className="text-[#00a8aa]" />
                        <span className="truncate max-w-[150px]">{file.name}</span>
                        <button onClick={() => removeAttachment(i)} className="text-gray-400 hover:text-white ml-1">&times;</button>
                      </span>
                    )})}
                  </div>
                )}

                <textarea
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onFocus={(e) => {
                     if (!requireAuth(e)) {
                         e.target.blur();
                         return;
                     }
                     setIsFocused(true)
                  }}
                  onBlur={() => setIsFocused(false)}
                  placeholder="Ask anything"
                  className="w-full bg-transparent text-white placeholder-gray-500 text-base md:text-lg outline-none resize-none px-3 py-1.5 min-h-[44px] max-h-[150px] overflow-y-auto"
                  rows={1}
                  style={{
                    height: chatInput ? `${Math.min(150, Math.max(44, chatInput.split('\n').length * 24 + 20))}px` : '44px'
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      if (requireAuth(e)) handleSubmitMessage(e);
                    }
                  }}
                />
                
                 <div className="flex items-center justify-between mt-1 px-1">
                  <div className="relative">
                    <button onClick={toggleAttachmentDropdown} className="p-1.5 text-gray-400 hover:text-white rounded-full transition-colors hover:bg-[#2b2d31]">
                      <Plus size={18} strokeWidth={2.5} />
                    </button>

                    {showAttachmentDropdown && (
                      <React.Fragment>
                        <div className="fixed inset-0 z-10" onClick={() => setShowAttachmentDropdown(false)}></div>
                        <div className="absolute bottom-full left-0 mb-2 w-44 bg-[#2b2d31] border border-[#3b3d41] rounded-xl shadow-2xl overflow-hidden z-20 animate-in slide-in-from-bottom-2 duration-200">
                          <button 
                            onClick={handleImageClick}
                            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-300 hover:bg-[#3b3d41] hover:text-white transition-colors"
                          >
                            <ImageIcon size={16} className="text-[#00a8aa]" />
                            Image
                          </button>
                          <button 
                            onClick={handleFileClick}
                            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-300 hover:bg-[#3b3d41] hover:text-white transition-colors border-t border-[#3b3d41]"
                          >
                            <FileText size={16} className="text-[#00a8aa]" />
                            PDF/File
                          </button>
                        </div>
                      </React.Fragment>
                    )}
                  </div>

                  <div className="flex items-center gap-1 hover:text-white">
                    <div className="relative">
                      <button 
                        onClick={() => setShowModelDropdown(!showModelDropdown)} 
                        className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium text-gray-400 hover:text-white hover:bg-[#2b2d31] transition-colors"
                      >
                        {selectedModel} <ChevronDown size={14} />
                      </button>

                      {showModelDropdown && (
                        <React.Fragment>
                          <div className="fixed inset-0 z-10" onClick={() => setShowModelDropdown(false)}></div>
                          <div className="absolute bottom-full mb-2 left-0 w-32 bg-[#2b2d31] border border-[#3b3d41] rounded-lg shadow-xl overflow-hidden z-20">
                            {['Standard', 'Pro', 'Claude 3', 'GPT-4o'].map(m => (
                              <button 
                                key={m} 
                                onClick={() => { setSelectedModel(m); setShowModelDropdown(false) }} 
                                className={`w-full text-left px-3 py-2 text-sm transition-colors ${selectedModel === m ? 'text-white bg-[#3b3d41]' : 'text-gray-300 hover:bg-[#3b3d41] hover:text-white'}`}
                              >
                                {m}
                              </button>
                            ))}
                          </div>
                        </React.Fragment>
                      )}
                    </div>

                    <button 
                      type="button"
                      className="p-1.5 text-[#202222] bg-white hover:bg-gray-200 rounded-full transition-colors ml-1 disabled:opacity-50 disabled:cursor-not-allowed" 
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleSubmitMessage(e); }} 
                      disabled={!chatInput.trim() && attachments.length === 0}
                      title="Send message"
                    >
                       <ArrowRight size={16} strokeWidth={2.5} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  )
}

export default Dashboard
