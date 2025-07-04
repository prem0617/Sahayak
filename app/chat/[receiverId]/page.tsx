// @ts-nocheck
"use client";

import { useAuth } from "@/context/userContext";
import { useSocket } from "@/hooks/useSocket";
import { User } from "@/lib/types";
import axios from "axios";
import {
  ArrowLeft,
  Send,
  MessageCircle,
  Clock,
  Phone,
  Video,
  MoreVertical,
  Loader2,
} from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const ChatService = () => {
  const { receiverId } = useParams();
  const [messages, setMessages] = useState<
    { from: string; content: string; timestamp?: string }[]
  >([]);
  const [receiver, setReceiver] = useState<User>();
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const socket = useSocket();

  const router = useRouter();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!user?.id || !receiverId) {
      setMessages([]);
      return;
    }

    const fetchReceiver = async () => {
      try {
        const response = await axios.post("/api/user/getUser", {
          userId: receiverId,
        });
        console.log(response);
        setReceiver(response.data.user);
      } catch (error) {
        console.log(error);
      }
    };

    const fetchMessages = async () => {
      try {
        setIsLoading(true);
        const res = await axios.post("/api/getMessages", {
          senderId: user.id,
          receiverId,
        });

        const formatted = res.data.messages.map((m: any) => ({
          from: m.senderId,
          content: m.content,
          timestamp: m.timestamp || new Date().toISOString(),
        }));

        setMessages(formatted);
      } catch (err) {
        console.error("Error fetching messages:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReceiver();
    fetchMessages();
  }, [receiverId, user?.id]);

  useEffect(() => {
    if (!socket || !user?.id || !receiverId) return;

    const handleMessage = (messageData: any) => {
      setMessages((prev) => [...prev, messageData]);
    };

    socket.on("new-message", handleMessage);

    return () => {
      socket.off("new-message", handleMessage);
    };
  }, [socket, user?.id, receiverId]);

  const sendMessage = async () => {
    if (!user || !user.id || !input.trim() || !receiverId) return;

    const messageContent = input.trim();
    setIsTyping(true);

    try {
      await axios.post("/api/sendMessage", {
        senderId: user.id,
        receiverId,
        content: messageContent,
      });

      setMessages((prevMessages) => [
        ...prevMessages,
        {
          from: user.id,
          content: messageContent,
          timestamp: new Date().toISOString(),
        },
      ]);

      setInput("");
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsTyping(false);
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!user?.id) {
    return (
      <div className="flex justify-center items-center h-screen gap-2 bg-gray-50">
        <div>
          <Loader2 className="animate-spin" />
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-1">
          Loading Chat ...
        </h3>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-4 py-3 sm:py-4">
          <div className="flex items-center">
            {/* Back Button */}
            <button
              onClick={() => router.back()}
              className="flex items-center gap-1 sm:gap-2 text-gray-600 hover:text-blue-600 transition-all duration-200 hover:bg-blue-50 px-2 sm:px-3 py-1.5 sm:py-2 rounded-xl text-sm sm:text-base"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="font-medium">Back</span>
            </button>

            {/* User Info */}
            <div className="flex items-center space-x-3 sm:space-x-4 ml-4 sm:ml-20">
              <div className="relative">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500 rounded-full flex items-center justify-center shadow-md">
                  <span className="text-white font-semibold text-base sm:text-lg">
                    {receiver?.name?.charAt(0)?.toUpperCase() || "U"}
                  </span>
                </div>
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-gray-800">
                  {receiver?.name || "User"}
                </h2>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {isLoading ? (
            <div className="flex justify-center items-center py-16">
              <div className="flex flex-col items-center space-y-4">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
                  <div
                    className="w-3 h-3 bg-yellow-500 rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="w-3 h-3 bg-green-500 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                </div>
                <p className="text-gray-600 font-medium">
                  Loading your messages...
                </p>
              </div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-6">
              <div className="relative">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-10 h-10 text-blue-500" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">!</span>
                </div>
              </div>
              <div className="text-center max-w-md">
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  Start Your Conversation
                </h3>
                <p className="text-gray-600">
                  Send your first message to {receiver?.name || "this user"} and
                  begin chatting!
                </p>
              </div>
            </div>
          ) : (
            <>
              {messages.map((m, i) => (
                <div
                  key={`${m.from}-${i}-${m.content}`}
                  className={`flex ${
                    m.from === user.id ? "justify-end" : "justify-start"
                  } group`}
                >
                  <div className="flex flex-col max-w-[70%] space-y-1">
                    <div
                      className={`px-5 py-3 rounded-2xl shadow-sm transition-all duration-200 hover:shadow-md relative ${
                        m.from === user.id
                          ? "bg-blue-500 text-white rounded-br-sm"
                          : "bg-white text-gray-800 border border-gray-200 rounded-bl-sm"
                      }`}
                    >
                      <p className="text-sm leading-relaxed break-words">
                        {m.content}
                      </p>
                    </div>
                    <div
                      className={`flex items-center space-x-1 text-xs text-gray-500 ${
                        m.from === user.id ? "justify-end" : "justify-start"
                      } opacity-0 group-hover:opacity-100 transition-opacity duration-200 px-2`}
                    >
                      <Clock className="w-3 h-3" />
                      <span>
                        {m.timestamp ? formatTime(m.timestamp) : "now"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-yellow-50 border-2 border-yellow-200 px-5 py-3 rounded-2xl rounded-bl-sm">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 px-4 py-4 shadow-lg">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Type your message here..."
                className="w-full bg-gray-50 border-2 border-gray-200 rounded-2xl px-5 py-3 text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-all duration-200 placeholder-gray-500"
              />
              {input.trim() && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                </div>
              )}
            </div>
            <button
              onClick={sendMessage}
              disabled={!input.trim() || isTyping}
              className={`p-4 rounded-2xl transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-md ${
                input.trim()
                  ? "bg-blue-500 hover:bg-blue-600 text-white shadow-blue-200"
                  : "bg-gray-200 text-gray-400"
              }`}
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatService;
