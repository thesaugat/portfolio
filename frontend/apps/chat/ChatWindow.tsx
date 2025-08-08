"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Send, User, Sparkles, Brain, Zap, MessageSquare, Copy, ThumbsUp, ThumbsDown } from "lucide-react"
import type { Message } from "@/types"

interface ChatWindowProps {
  initialMessage?: string
}

export function ChatWindow({ initialMessage = "" }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content:
        "👋 Hi! I'm Saugat's AI assistant, powered by advanced RAG technology and trained specifically on his portfolio data. I have deep knowledge about his projects, skills, experience, and achievements. What would you like to know?",
      sender: "assistant",
      timestamp: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState(initialMessage)
  const [isTyping, setIsTyping] = useState(false)
  const [isThinking, setIsThinking] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (initialMessage && initialMessage.trim()) {
      setTimeout(() => {
        handleSendMessage(initialMessage)
      }, 500)
    }
  }, [initialMessage])

  const handleSendMessage = async (messageContent?: string) => {
    const content = messageContent || inputValue
    if (!content.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: content,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsThinking(true)

    // Simulate RAG processing
    setTimeout(() => {
      setIsThinking(false)
      setIsTyping(true)
    }, 800)

    // Simulate AI response with more contextual responses
    setTimeout(() => {
      const responses = [
        "Based on Saugat's portfolio data, he has extensive experience in full-stack development with React, Next.js, and Node.js. His expertise particularly shines in AI/ML integration, having built several intelligent applications including RAG-powered systems like this one. He's passionate about creating innovative solutions that bridge traditional web development with cutting-edge AI technologies.",

        "From his project portfolio, Saugat has developed impressive applications including an AI-powered e-commerce platform with intelligent product recommendations, real-time chat applications with WebRTC integration, and comprehensive task management systems. His work demonstrates a strong focus on user experience and scalable architecture design.",

        "According to his technical profile, Saugat's expertise spans multiple domains: Frontend (React 95%, Next.js 90%, TypeScript 88%), Backend (Node.js 90%, Python 85%), Cloud & DevOps (AWS 80%, Vercel 90%), and AI/ML (OpenAI API 85%, LangChain 80%). He's also experienced with modern databases and has strong mobile development skills.",

        "Saugat is actively seeking new opportunities and collaborations. His professional background shows he's worked as a Senior Full Stack Developer at Tech Innovations Ltd., where he led AI-powered web application development and mentored junior developers. He's particularly interested in projects that push the boundaries of technology and involve AI integration.",

        "His specialization in AI integration is evident from his work with various AI APIs, machine learning models, and RAG implementations. Recent projects include intelligent chat systems, natural language processing applications, and computer vision solutions. He stays current with the latest AI developments and best practices.",

        "Saugat's development philosophy emphasizes creating user-centric applications with clean, maintainable code. He believes in continuous learning and has earned certifications from AWS, Meta, and freeCodeCamp. His approach combines technical excellence with practical problem-solving to deliver impactful solutions.",
      ]

      const randomResponse = responses[Math.floor(Math.random() * responses.length)]

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: randomResponse,
        sender: "assistant",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
      setIsTyping(false)
    }, 2000)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content)
  }

  const suggestedQuestions = [
    "What are Saugat's main technical skills?",
    "Tell me about his recent projects",
    "What's his experience with AI/ML?",
    "How can I contact Saugat?",
  ]

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-slate-50 to-blue-50/30">
      {/* Modern Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 px-6 py-5 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/30">
                <Brain className="w-7 h-7 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
            </div>
            <div>
              <h2 className="text-white font-bold text-xl">RAG AI Assistant</h2>
              <p className="text-white/80 text-sm flex items-center">
                <Zap className="w-3 h-3 mr-1" />
                Trained on Saugat's Portfolio Data
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="px-3 py-1 bg-white/20 rounded-full text-white text-xs font-medium backdrop-blur-sm">
              Online
            </div>
            <Sparkles className="w-6 h-6 text-white/80 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 p-6 overflow-y-auto space-y-6">
        {messages.map((message, index) => (
          <div key={message.id} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`group max-w-[85%] ${message.sender === "user" ? "order-2" : ""}`}>
              {/* Message Bubble */}
              <div
                className={`relative px-6 py-4 rounded-3xl shadow-sm transition-all duration-200 hover:shadow-md ${message.sender === "user"
                    ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-br-lg"
                    : "bg-white text-gray-800 rounded-bl-lg border border-gray-100 shadow-sm"
                  }`}
              >
                <div className="flex items-start space-x-3">
                  {message.sender === "assistant" && (
                    <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <Brain className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="leading-relaxed text-sm">{message.content}</p>
                    <div className="flex items-center justify-between mt-3">
                      <span className={`text-xs ${message.sender === "user" ? "text-white/70" : "text-gray-500"}`}>
                        {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                      {message.sender === "assistant" && (
                        <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => copyMessage(message.content)}
                            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                            title="Copy message"
                          >
                            <Copy className="w-3 h-3 text-gray-500" />
                          </button>
                          <button
                            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                            title="Good response"
                          >
                            <ThumbsUp className="w-3 h-3 text-gray-500" />
                          </button>
                          <button
                            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                            title="Poor response"
                          >
                            <ThumbsDown className="w-3 h-3 text-gray-500" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  {message.sender === "user" && (
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <User className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Thinking Animation */}
        {isThinking && (
          <div className="flex justify-start">
            <div className="bg-white rounded-3xl rounded-bl-lg px-6 py-4 shadow-sm border border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                  <Brain className="w-4 h-4 text-white animate-pulse" />
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Analyzing portfolio data</span>
                  <div className="flex space-x-1">
                    <div className="w-1 h-1 bg-indigo-500 rounded-full animate-bounce"></div>
                    <div
                      className="w-1 h-1 bg-purple-500 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-1 h-1 bg-blue-500 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Typing Animation */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white rounded-3xl rounded-bl-lg px-6 py-4 shadow-sm border border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                  <Brain className="w-4 h-4 text-white" />
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Generating response</span>
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Suggested Questions */}
        {messages.length === 1 && !isThinking && !isTyping && (
          <div className="space-y-3">
            <p className="text-sm text-gray-500 text-center">Try asking about:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {suggestedQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setInputValue(question)
                    handleSendMessage(question)
                  }}
                  className="p-3 text-left text-sm bg-white hover:bg-gray-50 border border-gray-200 rounded-2xl transition-colors hover:border-indigo-300 hover:shadow-sm"
                >
                  <MessageSquare className="w-4 h-4 text-indigo-500 mb-1" />
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Modern Input Area */}
      <div className="p-6 bg-white/80 backdrop-blur-sm border-t border-gray-200/50 pb-8 md:pb-6">
        <div className="max-w-4xl mx-auto">
          {/* RAG Info Banner */}
          <div className="mb-4 p-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100">
            <div className="flex items-center space-x-2 text-sm">
              <Brain className="w-4 h-4 text-indigo-600" />
              <span className="text-indigo-700 font-medium">RAG-Powered:</span>
              <span className="text-gray-600">Responses generated from Saugat's verified portfolio data</span>
            </div>
          </div>

          {/* Input Container */}
          <div className="relative">
            <div className="flex items-end space-x-4 bg-white rounded-3xl shadow-lg border border-gray-200 p-2">
              <div className="flex-1 min-h-[44px] max-h-32">
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything about Saugat's experience, projects, or skills..."
                  className="w-full px-4 py-3 bg-transparent text-gray-800 placeholder-gray-500 focus:outline-none resize-none text-sm leading-relaxed"
                  rows={1}
                  style={{ minHeight: "44px" }}
                />
              </div>
              <button
                onClick={() => handleSendMessage()}
                disabled={!inputValue.trim() || isTyping || isThinking}
                className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-400 text-white p-3 rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:shadow-none transform hover:scale-105 disabled:scale-100"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Footer Info */}
          <div className="mt-3 text-center">
            <p className="text-xs text-gray-500">
              Powered by advanced RAG technology • Trained on verified portfolio data •
              <span className="text-indigo-600 font-medium"> Always learning</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
