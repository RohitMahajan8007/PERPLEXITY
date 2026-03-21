import React, { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { useSelector } from 'react-redux'
import { useChat } from '../hooks/useChat'
import remarkGfm from 'remark-gfm'


const Dashboard = () => {
  const chat = useChat()
  const [ chatInput, setChatInput ] = useState('')
  const [ isSidebarOpen, setIsSidebarOpen ] = useState(false)
  const chats = useSelector((state) => state.chat.chats)
  const currentChatId = useSelector((state) => state.chat.currentChatId)

  useEffect(() => {
    chat.initializeSocketConnection()
    chat.handleGetChats()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSubmitMessage = (event) => {
    event.preventDefault()

    const trimmedMessage = chatInput.trim()
    if (!trimmedMessage) {
      return
    }

    chat.handleSendMessage({ message: trimmedMessage, chatId: currentChatId })
    setChatInput('')
  }

  const openChat = (chatId) => {
    chat.handleOpenChat(chatId,chats)
    setIsSidebarOpen(false)
  }

  return (
    <main className='min-h-screen w-full bg-[#07090f] p-3 text-white md:p-5'>
      <section className='mx-auto flex h-[calc(100vh-1.5rem)] w-full gap-4 rounded-3xl p-1 md:h-[calc(100vh-2.5rem)] md:gap-6 md:p-1'>
        
        {/* Mobile Sidebar Backdrop */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        <aside className={`fixed inset-y-0 left-0 z-50 flex h-full w-72 shrink-0 flex-col rounded-r-3xl md:rounded-3xl border border-white/10 bg-[#080b12] p-4 transition-transform duration-300 ease-in-out md:relative md:translate-x-0 md:flex md:border-none ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex items-center justify-between mb-5">
            <h1 className='text-3xl font-semibold tracking-tight'>Perplexity</h1>
            <button className="md:hidden text-white/70 hover:text-white" onClick={() => setIsSidebarOpen(false)}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
          </div>

          <div className='space-y-2 flex-1 overflow-y-auto pr-1 no-scrollbar'>
            {Object.values(chats).map((chatObj,index) => (
              <button
                onClick={()=>{openChat(chatObj.id)}}
                key={index}
                type='button'
                className={`w-full cursor-pointer rounded-xl border px-3 py-2 text-left text-base font-medium transition ${currentChatId === chatObj.id ? 'border-white text-white bg-white/10' : 'bg-transparent border-white/20 text-white/70 hover:border-white/60 hover:text-white'}`}
              >
                {chatObj.title}
              </button>
            ))}
          </div>
        </aside>

        <section className='relative mx-auto flex h-full w-full max-w-4xl min-w-0 flex-1 flex-col gap-2 md:gap-4'>
          
          {/* Mobile Header */}
          <header className="flex items-center justify-between md:hidden px-2 pt-1 pb-1">
            <button onClick={() => setIsSidebarOpen(true)} className="text-white/90 hover:text-white transition">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
            </button>
            <h1 className="text-xl font-semibold tracking-wide">Chat</h1>
            <div className="w-7"></div>
          </header>

          <div className='messages flex-1 space-y-4 overflow-y-auto pr-2 pb-24 md:pb-32 no-scrollbar'>
            {chats[ currentChatId ]?.messages?.map((message, index) => (
              <div
                key={message.id || index}
                className={`max-w-[85%] w-fit rounded-2xl px-4 py-3 text-sm md:max-w-[82%] md:text-base ${message.role === 'user'
                    ? 'ml-auto rounded-br-none bg-white/12 text-white'
                    : 'mr-auto border-none text-white/90 bg-transparent md:bg-white/5 md:rounded-bl-none'
                  }`}
              >
                {message.role === 'user' ? (
                  <p className="whitespace-pre-wrap">{message.content}</p>
                ) : (
                  <ReactMarkdown
                    components={{
                      p: ({ children }) => <p className='mb-3 last:mb-0 leading-relaxed'>{children}</p>,
                      ul: ({ children }) => <ul className='mb-3 list-disc pl-5 space-y-1'>{children}</ul>,
                      ol: ({ children }) => <ol className='mb-3 list-decimal pl-5 space-y-1'>{children}</ol>,
                      code: ({ children }) => <code className='rounded bg-white/10 px-1.5 py-0.5 text-sm font-mono'>{children}</code>,
                      pre: ({ children }) => <pre className='mb-4 overflow-x-auto rounded-xl bg-black/40 p-3 md:p-4 text-sm font-mono'>{children}</pre>,
                      h1: ({ children }) => <h1 className='text-xl md:text-2xl font-bold mb-3'>{children}</h1>,
                      h2: ({ children }) => <h2 className='text-lg md:text-xl font-bold mb-2'>{children}</h2>,
                      h3: ({ children }) => <h3 className='text-base md:text-lg font-bold mb-2'>{children}</h3>,
                    }}
                    remarkPlugins={[remarkGfm]}
                  >
                    {message.content}
                  </ReactMarkdown>
                )}
              </div>
            ))}
          </div>

          <footer className='rounded-3xl w-full absolute bottom-1 md:bottom-2 border border-white/20 bg-[#080b12] p-3 md:p-5 shadow-lg'>
            <form onSubmit={handleSubmitMessage} className='flex flex-row items-center gap-2 md:gap-3'>
              <input
                type='text'
                value={chatInput}
                onChange={(event) => setChatInput(event.target.value)}
                placeholder='Type your message...'
                className='w-full rounded-full md:rounded-2xl border border-white/20 bg-white/5 px-4 py-2.5 md:px-5 md:py-3.5 text-sm md:text-lg text-white outline-none transition placeholder:text-white/40 focus:border-white/60 focus:bg-white/10'
              />
              <button
                type='submit'
                disabled={!chatInput.trim()}
                className='rounded-full md:rounded-2xl shrink-0 border border-white/30 px-5 py-2.5 md:px-8 md:py-3.5 text-sm md:text-lg font-semibold text-white transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center'
              >
                <span className="hidden md:inline">Send</span>
                <svg className="md:hidden" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
              </button>
            </form>
          </footer>
        </section>
      </section>
    </main>
  )
}

export default Dashboard