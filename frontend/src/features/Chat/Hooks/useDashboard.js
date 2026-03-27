import { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setCurrentChatId, setChats } from '../chat.slice';
import { deleteChat } from '../service/chat.api';
import * as pdfjsLib from 'pdfjs-dist';
import { marked } from 'marked';
import html2pdf from 'html2pdf.js';
import { useChat } from './useChat';

export const useDashboard = () => {
  const chat = useChat()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  
  const [ chatInput, setChatInput ] = useState('')
  const [ isSidebarOpen, setIsSidebarOpen ] = useState(false)
  const [ isFocused, setIsFocused ] = useState(false)
  const [ attachments, setAttachments ] = useState([])
  const [ selectedModel, setSelectedModel ] = useState("Pro")
  const [ showModelDropdown, setShowModelDropdown ] = useState(false)
  const [ showAttachmentDropdown, setShowAttachmentDropdown ] = useState(false)
  const [ showHistory, setShowHistory ] = useState(false)
  const [ showAuthModal, setShowAuthModal ] = useState(false)
  const [ showMoreMenu, setShowMoreMenu ] = useState(false)
  
  const chats = useSelector((state) => state.chat.chats)
  const currentChatId = useSelector((state) => state.chat.currentChatId)
  const authUser = useSelector((state) => state.auth.user)
  const isAuthLoading = useSelector((state) => state.auth.loading)
  const isLoading = useSelector((state) => state.chat.isLoading)
  
  const messagesEndRef = useRef(null)
  const fileInputRef = useRef(null)
  const imageInputRef = useRef(null)

  const requireAuth = (e) => {
    if (!authUser) {
      if (e) {
        if (e.preventDefault) e.preventDefault()
        if (e.stopPropagation) e.stopPropagation()
      }
      setShowAuthModal(true)
      return false
    }
    return true
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    chat.initializeSocketConnection()
    chat.handleGetChats()

  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [chats[currentChatId]?.messages])

  const handleSubmitMessage = async (e) => {
    if (e && e.preventDefault) e.preventDefault()
    if (!requireAuth(e)) return

    let finalMessage = chatInput.trim()

    if (attachments.length > 0) {
      let attachmentText = "";
      for (const file of attachments) {
         if (file.type.startsWith("image/")) {
            const base64 = await new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = (eventReader) => resolve(eventReader.target.result);
                reader.readAsDataURL(file);
            });
            attachmentText += `![${file.name}](${base64})\n`;
         } else if (file.type === 'application/pdf') {
             try {
                const base64 = await new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onload = (eventReader) => resolve(eventReader.target.result);
                    reader.readAsDataURL(file);
                });
                attachmentText += `![PDF:${file.name}](${base64})\n`;
             } catch(err) {
                console.error("PDF Encoding Error", err);
                attachmentText += `📎 **${file.name}**\n[Error encoding PDF]\n`;
             }
         } else {
             try {
               const text = await file.text();
               attachmentText += `📎 **${file.name}**\n<pdf_text>\n${text}\n</pdf_text>\n`;
             } catch(e) { }
         }
      }
      finalMessage = attachmentText.trim() + (finalMessage ? "\n\n" + finalMessage : "");
    }

    if (!finalMessage) return

    chat.handleSendMessage({ message: finalMessage, chatId: currentChatId })
    setChatInput('')
    setAttachments([])
  }

  const openChat = (e, chatId) => {
    if (e) {
        if (e.preventDefault) e.preventDefault();
        if (e.stopPropagation) e.stopPropagation();
    }
    if (!requireAuth(e)) return;
    chat.handleOpenChat(chatId, chats)
    setIsSidebarOpen(false)
  }

  const startNewThread = (e) => {
    if (e) e.preventDefault();
    if (!requireAuth(e)) return;
    dispatch(setCurrentChatId(null))
    setIsSidebarOpen(false)
  }

  const handleLogout = () => {
    dispatch({ type: 'auth/setUser', payload: null })
    dispatch(setChats({}))
    dispatch(setCurrentChatId(null))
    localStorage.setItem('perplexity_logged_out', 'true')
  }

  const handleDeleteChat = async (e, chatId) => {
    e.stopPropagation();
    try {
      
       const newChats = { ...chats };
       delete newChats[chatId];
       dispatch(setChats(newChats));
       if (currentChatId === chatId) {
         dispatch(setCurrentChatId(null));
         setChatInput('');
       }
      
       await deleteChat(chatId);
     } catch(err) {
       console.error("Failed to delete chat", err);
     }
  }

  const toggleAttachmentDropdown = (e) => {
    if (e) e.preventDefault();
    if (!requireAuth(e)) return;
    setShowAttachmentDropdown(!showAttachmentDropdown);
  }

  const handleImageClick = () => {
    imageInputRef.current?.click();
    setShowAttachmentDropdown(false);
  }

  const handleFileClick = () => {
    fileInputRef.current?.click();
    setShowAttachmentDropdown(false);
  }
  
  const handleFileChange = (e) => {
    if (e.target.files) {
      setAttachments([...attachments, ...Array.from(e.target.files)])
    }
  }

  const removeAttachment = (index) => {
    setAttachments(attachments.filter((_, i) => i !== index))
  }

  const exportAsPDF = async (text) => {
     try {
       const cleanText = text.replace(/<pdf_text>[\s\S]*?<\/pdf_text>/g, '');
       const htmlContent = await marked.parse(cleanText);
       
       const container = document.createElement('div');
       container.innerHTML = `
         <div style="font-family: sans-serif; padding: 40px; line-height: 1.6; color: #333;">
             <h2 style="border-bottom: 2px solid #eee; padding-bottom: 5px; margin-bottom: 20px;">Perplexity Answer</h2>
             <div>${htmlContent}</div>
         </div>
       `;
       
       const opt = {
          margin:       10,
          filename:     'Perplexity_Chat.pdf',
          image:        { type: 'jpeg', quality: 0.98 },
          html2canvas:  { scale: 2 },
          jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
       };

       html2pdf().set(opt).from(container).save();
       
     } catch(err) {
       console.error("PDF Export failed", err);
     }
  };

  const shareMessage = (text) => {
      const cleanText = text.replace(/<pdf_text>[\s\S]*?<\/pdf_text>/g, '');
      if (navigator.share) {
          navigator.share({
              title: 'Perplexity Search',
              text: cleanText.substring(0, 150) + "...\nRead more at Perplexity",
              url: window.location.href,
          }).catch((err) => console.error('Share failed', err));
      } else {
          navigator.clipboard.writeText(cleanText);
          alert("Answer copied to clipboard!");
      }
  };

  const currentMessages = chats[currentChatId]?.messages || []
  const hasMessages = currentMessages.length > 0

  return {
    chatInput, setChatInput,
    isSidebarOpen, setIsSidebarOpen,
    isFocused, setIsFocused,
    attachments,
    selectedModel, setSelectedModel,
    showModelDropdown, setShowModelDropdown,
    showAttachmentDropdown, setShowAttachmentDropdown,
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
    navigate
  }
}
