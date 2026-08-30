"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  AlertTriangle,
  Check,
  ChevronDown,
  Circle,
  Clock3,
  Info,
  MessageCircleWarning,
  Plus,
  Send,
  Smile,
  Sparkles,
  X,
} from "lucide-react";

type Message = {
  id: string;
  sender: "me" | "them" | "system";
  text: string;
  time: string;
};

function formatMessageTime(createdAt: string) {
  const date = new Date(createdAt);

  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

type ReportReason =
  | "Harassment"
  | "Racism"
  | "Fear"
  | "Other";

const emojis = [
  "😀",
  "😂",
  "🥹",
  "😍",
  "🤔",
  "😮",
  "😅",
  "😭",
  "🔥",
  "❤️",
  "👀",
  "✨",
];

const CHAT_DURATION = 5 * 60;
const EXTENSION_DURATION = 2 * 60;

export default function ChatPage() {
  const router = useRouter();
  const params = useParams();

  const matchId = params.matchId as string;

  const [messages, setMessages] = useState<Message[]>([]);

  const [currentUserId, setCurrentUserId] =
  useState<string | null>(null);

const [loadingMessages, setLoadingMessages] =
  useState(true);

  const [newMessage, setNewMessage] = useState("");

  const [showEmojiPicker, setShowEmojiPicker] =
    useState(false);

  const [showLeaveModal, setShowLeaveModal] =
    useState(false);

  const [showReportModal, setShowReportModal] =
    useState(false);

  const [reportReason, setReportReason] =
    useState<ReportReason | null>(null);

  const [reportComment, setReportComment] =
    useState("");

  const [timeLeft, setTimeLeft] =
    useState(CHAT_DURATION);

  const [chatExpired, setChatExpired] =
    useState(false);

  const [myExtensionVote, setMyExtensionVote] =
    useState(false);

  const [theirExtensionVote, setTheirExtensionVote] =
    useState(false);

  const [extensionUsed, setExtensionUsed] =
    useState(false);

  const messagesEndRef =
    useRef<HTMLDivElement | null>(null);

  function formatTime(seconds: number) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${minutes}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  }

  function addSystemMessage(text: string) {
    setMessages((currentMessages) => [
      ...currentMessages,
      {
        id: crypto.randomUUID() + Math.random(),
        sender: "system",
        text,
        time: "Now",
      },
    ]);
  }

  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }

  /*
  LOAD REAL CONVERSATION
*/

useEffect(() => {
  const supabase = createClient();

  let cancelled = false;

  const loadConversation = async () => {
    /*
      Get current user
    */

    const {
      data: {
        user,
      },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error(
        "Error getting current user:",
        userError
      );

      router.push("/login");
      return;
    }

    if (cancelled) return;

    setCurrentUserId(user.id);


    /*
      Verify conversation
    */

    const {
      data: conversation,
      error: conversationError,
    } = await supabase
      .from("queuemitment_conversations")
      .select("*")
      .eq("id", matchId)
      .or(
        `user_one_id.eq.${user.id},user_two_id.eq.${user.id}`
      )
      .maybeSingle();

    if (conversationError || !conversation) {
      console.error(
        "Error loading conversation:",
        conversationError
      );

      setLoadingMessages(false);
      return;
    }


    /*
      Load messages
    */

    const {
      data: messagesData,
      error: messagesError,
    } = await supabase
      .from("conversation_messages")
      .select("*")
      .eq("conversation_id", matchId)
      .order("created_at", {
        ascending: true,
      });

    if (messagesError) {
      console.error(
        "Error loading messages:",
        messagesError
      );

      setLoadingMessages(false);
      return;
    }


    /*
      Convert database messages
      to UI messages
    */

    if (!cancelled) {
      const formattedMessages: Message[] =
        (messagesData ?? []).map((message) => ({
          id: message.id,
          sender:
            message.sender_id === user.id
              ? "me"
              : "them",
          text: message.content,
          time: formatMessageTime(message.created_at),
        }));

      setMessages(formattedMessages);
      setLoadingMessages(false);
    }
  };

  loadConversation();

  return () => {
    cancelled = true;
  };
}, [matchId, router]);

  /* CHAT TIMER */

  

useEffect(() => {
    if (chatExpired) return;
  
    const timer = window.setInterval(() => {
      setTimeLeft((currentTime) => {
        if (currentTime <= 1) {
          window.clearInterval(timer);
  
          window.setTimeout(() => {
            setChatExpired(true);
  
            setMessages((currentMessages) => [
              ...currentMessages,
              {
                id: crypto.randomUUID(),
                sender: "system",
                text: "Your Queuemitment has come to an end.",
                time: "Now",
              },
            ]);
          }, 0);
  
          return 0;
        }
  
        return currentTime - 1;
      });
    }, 1000);
  
    return () => {
      window.clearInterval(timer);
    };
  }, [chatExpired]);

 

  /* AUTO SCROLL */

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  /* MUTUAL EXTENSION */

  function completeExtension() {
    if (extensionUsed || chatExpired) return;
  
    setTimeLeft(
      (currentTime) =>
        currentTime + EXTENSION_DURATION
    );
  
    setExtensionUsed(true);
  
    setMessages((currentMessages) => [
      ...currentMessages,
      {
        id: crypto.randomUUID(),
        sender: "system",
        text: "You both wanted more time. Your conversation has been extended by 2 minutes.",
        time: "Now",
      },
    ]);
  }

  function requestExtension() {
    if (
      myExtensionVote ||
      extensionUsed ||
      chatExpired
    ) {
      return;
    }

    setMyExtensionVote(true);

    addSystemMessage(
      "You voted to extend this conversation by 2 minutes."
    );

    /*
      TEMPORARY DEMO BEHAVIOUR

      Later, this will come from Supabase Realtime when
      the other participant presses their own extension button.

      For now, we simulate their response so you can test
      the complete experience by yourself.
    */

      window.setTimeout(() => {
        setTheirExtensionVote(true);
      
        setMessages((currentMessages) => [
          ...currentMessages,
          {
            id: crypto.randomUUID(),
            sender: "system",
            text: "Someone also voted to extend the conversation.",
            time: "Now",
          },
        ]);
      
        window.setTimeout(() => {
          completeExtension();
        }, 500);
      }, 1800);
  }

  async function sendMessage() {
    if (chatExpired) return;
  
    const trimmedMessage = newMessage.trim();
  
    if (!trimmedMessage) return;
  
    if (!currentUserId) return;
  
    const supabase = createClient();
  
    const {
      data,
      error,
    } = await supabase
      .from("conversation_messages")
      .insert({
        conversation_id: matchId,
        sender_id: currentUserId,
        message_type: "text",
        content: trimmedMessage,
      })
      .select()
      .single();
  
    if (error) {
      console.error(
        "Error sending message:",
        error
      );
  
      return;
    }
  
    setMessages((currentMessages) => [
      ...currentMessages,
      {
        id: data.id,
        sender: "me",
        text: data.content,
        time: formatMessageTime(data.created_at),
      },
    ]);
  
    setNewMessage("");
    setShowEmojiPicker(false);
  }

  function addEmoji(emoji: string) {
    if (chatExpired) return;

    setNewMessage((current) => current + emoji);
  }

  function leaveChat() {
    router.push("/dashboard/queuemitment");
  }

  function submitReport() {
    if (!reportReason) return;

    /*
      Later:
      Save report in Supabase.

      reason: reportReason
      comment: reportComment
      matchId: params.matchId
    */

    router.push(
      "/dashboard/queuemitment?report=success"
    );
  }

  const timerDanger =
    timeLeft <= 60 && !chatExpired;

  return (
    <>
      <section className="flex h-[calc(100vh-80px)] flex-1 flex-col overflow-hidden">
        {/* CHAT HEADER */}

        <header className="flex shrink-0 items-center justify-between border-b border-white/[0.07] px-6 py-5 lg:px-10">
          <div className="flex items-center gap-3">
            <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-500/10">
              <Sparkles
                size={20}
                className="text-violet-300"
              />

              {!chatExpired && (
                <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3 rounded-full border-2 border-[#09090d] bg-emerald-400" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-semibold">
                  Someone
                </h1>

                {!chatExpired && (
                  <Circle
                    size={7}
                    className="fill-violet-300 text-violet-300"
                  />
                )}
              </div>

              <p className="text-xs text-white/35">
                {chatExpired
                  ? "This Queuemitment has ended."
                  : "Discover them through conversation."}
              </p>
            </div>
          </div>

          {/* ACTIONS */}

          <div className="flex items-center gap-2">
            {/* TIMER */}

            <div
              className={`hidden items-center gap-2 rounded-xl border px-4 py-2.5 sm:flex ${
                timerDanger
                  ? "border-red-400/25 bg-red-500/[0.08] text-red-300"
                  : chatExpired
                    ? "border-white/[0.07] bg-white/[0.03] text-white/35"
                    : "border-violet-400/15 bg-violet-500/[0.07] text-violet-200"
              }`}
            >
              <Clock3 size={17} />

              <div>
                <p className="text-xs font-medium">
                  {chatExpired
                    ? "Time's up"
                    : formatTime(timeLeft)}
                </p>

                <p className="text-[10px] opacity-50">
                  remaining
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                setShowReportModal(true)
              }
              className="hidden items-center gap-2 rounded-xl border border-red-400/10 px-4 py-2.5 text-sm text-red-300/70 transition hover:border-red-400/20 hover:bg-red-500/10 hover:text-red-300 sm:flex"
            >
              <MessageCircleWarning size={17} />

              Report
            </button>

            <button
              type="button"
              onClick={() =>
                setShowLeaveModal(true)
              }
              className="flex items-center gap-2 rounded-xl border border-white/[0.07] px-4 py-2.5 text-sm text-white/50 transition hover:border-white/[0.12] hover:bg-white/[0.05] hover:text-white"
            >
              <X size={17} />

              <span className="hidden sm:inline">
                Leave chat
              </span>
            </button>

            <button className="hidden h-10 w-10 items-center justify-center rounded-xl border border-white/[0.07] text-white/40 transition hover:bg-white/[0.05] hover:text-white lg:flex">
              <Info size={19} />
            </button>
          </div>
        </header>

        {/* MOBILE TIMER */}

        <div className="flex shrink-0 items-center justify-between border-b border-white/[0.05] px-6 py-3 sm:hidden">
          <div className="flex items-center gap-2 text-sm text-violet-200">
            <Clock3 size={16} />

            <span className="font-medium">
              {chatExpired
                ? "Time's up"
                : `${formatTime(timeLeft)} remaining`}
            </span>
          </div>

          <button
            type="button"
            onClick={() =>
              setShowReportModal(true)
            }
            className="flex items-center gap-2 text-sm text-red-300/70"
          >
            <MessageCircleWarning size={16} />
            Report
          </button>
        </div>

        {/* CONVERSATION INTRO */}

        <div className="shrink-0 border-b border-white/[0.05] bg-violet-500/[0.025] px-6 py-4">
          <div className="mx-auto flex max-w-3xl flex-col items-center justify-between gap-4 lg:flex-row">
            <div className="flex items-center justify-center gap-2 text-center text-sm text-white/35 lg:text-left">
              <Sparkles
                size={15}
                className="shrink-0 text-violet-300"
              />

              <span>
                No profiles. No first impressions. Just
                conversation.
              </span>
            </div>

            {/* EXTEND CONVERSATION */}

            {!chatExpired && (
              <button
                type="button"
                onClick={requestExtension}
                disabled={
                  myExtensionVote || extensionUsed
                }
                className={`group flex items-center gap-3 rounded-xl border px-4 py-2.5 text-sm transition ${
                  extensionUsed
                    ? "cursor-default border-emerald-400/20 bg-emerald-500/[0.06] text-emerald-300/70"
                    : myExtensionVote
                      ? "cursor-wait border-violet-400/25 bg-violet-500/[0.08] text-violet-200"
                      : "border-white/[0.08] bg-white/[0.025] text-white/50 hover:border-violet-400/30 hover:bg-violet-500/[0.08] hover:text-violet-200"
                }`}
              >
                {extensionUsed ? (
                  <>
                    <Check size={17} />

                    Extension used
                  </>
                ) : myExtensionVote ? (
                  <>
                    <Clock3 size={17} />

                    Waiting for Someone...
                  </>
                ) : (
                  <>
                    <Plus
                      size={17}
                      className="transition group-hover:rotate-90"
                    />

                    Add 2 minutes
                  </>
                )}
              </button>
            )}
          </div>

          {!chatExpired &&
            !extensionUsed &&
            !myExtensionVote && (
              <p className="mx-auto mt-3 max-w-3xl text-center text-[11px] text-white/20 lg:text-right">
                Both people need to agree. One extension
                per conversation.
              </p>
            )}
        </div>

        {/* MESSAGES */}

        <div className="chat-scroll min-h-0 flex-1 overflow-y-auto px-6 py-8 lg:px-10">
          <div className="mx-auto flex max-w-3xl flex-col gap-5">
            <div className="mb-4 text-center">
              <p className="text-xs uppercase tracking-[0.2em] text-white/20">
                Your Queuemitment begins now
              </p>
            </div>

            {messages.map((message) => {
              if (message.sender === "system") {
                return (
                  <div
                    key={message.id}
                    className="flex justify-center py-2"
                  >
                    <div className="max-w-md rounded-2xl border border-violet-400/10 bg-violet-500/[0.05] px-4 py-3 text-center">
                      <div className="mb-1 flex items-center justify-center gap-2 text-violet-300">
                        <Sparkles size={13} />

                        <span className="text-[10px] font-medium uppercase tracking-[0.16em]">
                          Queuemitment
                        </span>
                      </div>

                      <p className="text-xs leading-relaxed text-white/45">
                        {message.text}
                      </p>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={message.id}
                  className={`flex ${
                    message.sender === "me"
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-3xl px-5 py-3.5 sm:max-w-[65%] ${
                      message.sender === "me"
                        ? "rounded-br-md bg-violet-500 text-white shadow-lg shadow-violet-500/10"
                        : "rounded-bl-md border border-white/[0.07] bg-white/[0.035] text-white/80"
                    }`}
                  >
                    <p className="text-sm leading-relaxed">
                      {message.text}
                    </p>

                    <p
                      className={`mt-2 text-[10px] ${
                        message.sender === "me"
                          ? "text-white/50"
                          : "text-white/25"
                      }`}
                    >
                      {message.time}
                    </p>
                  </div>
                </div>
              );
            })}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* MESSAGE INPUT */}

        <div className="shrink-0 border-t border-white/[0.07] bg-[#0d0d12]/80 px-6 py-5 backdrop-blur-xl lg:px-10">
          <div className="mx-auto max-w-3xl">
            {chatExpired ? (
              <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] px-5 py-4 text-center">
                <p className="text-sm font-medium text-white/60">
                  This conversation has ended.
                </p>

                <p className="mt-1 text-xs text-white/25">
                  Thanks for taking the time to discover
                  someone differently.
                </p>
              </div>
            ) : (
              <div className="relative flex items-end gap-3">
                {/* EMOJI PICKER */}

                {showEmojiPicker && (
                  <div className="absolute bottom-[72px] left-0 z-20 w-[320px] rounded-2xl border border-white/[0.08] bg-[#16161d] p-4 shadow-2xl shadow-black/40">
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-xs font-medium text-white/40">
                        Add some personality
                      </p>

                      <button
                        type="button"
                        onClick={() =>
                          setShowEmojiPicker(false)
                        }
                        className="text-white/30 transition hover:text-white"
                      >
                        <ChevronDown size={17} />
                      </button>
                    </div>

                    <div className="grid grid-cols-6 gap-2">
                      {emojis.map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() =>
                            addEmoji(emoji)
                          }
                          className="flex h-10 items-center justify-center rounded-xl text-xl transition hover:scale-110 hover:bg-white/[0.07]"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* INPUT */}

                <div className="flex flex-1 items-center rounded-2xl border border-white/[0.08] bg-white/[0.035] px-3 transition focus-within:border-violet-400/40 focus-within:bg-white/[0.05]">
                  <button
                    type="button"
                    onClick={() =>
                      setShowEmojiPicker(
                        (current) => !current
                      )
                    }
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white/35 transition hover:bg-white/[0.05] hover:text-violet-300"
                  >
                    <Smile size={20} />
                  </button>

                  <input
                    value={newMessage}
                    onChange={(event) =>
                      setNewMessage(
                        event.target.value
                      )
                    }
                    onKeyDown={(event) => {
                      if (
                        event.key === "Enter" &&
                        !event.shiftKey
                      ) {
                        event.preventDefault();
                        sendMessage();
                      }
                    }}
                    placeholder="Say something..."
                    className="h-14 w-full bg-transparent text-sm text-white outline-none placeholder:text-white/25"
                  />
                </div>

                {/* SEND */}

                <button
                  type="button"
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-violet-500 text-white transition hover:bg-violet-400 hover:shadow-lg hover:shadow-violet-500/20 disabled:cursor-not-allowed disabled:bg-white/[0.06] disabled:text-white/20 disabled:shadow-none"
                >
                  <Send size={19} />
                </button>
              </div>
            )}

            <p className="mt-3 text-center text-[11px] text-white/20">
              Queuerious is built around conversation.
              Photos aren&apos;t shared during a Queuemitment.
            </p>
          </div>
        </div>
      </section>

      {/* LEAVE MODAL */}

      {showLeaveModal && (
        <Modal>
          <div className="p-7">
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.04] text-white/70">
              <AlertTriangle size={22} />
            </div>

            <h2 className="text-2xl font-semibold">
              Leave this conversation?
            </h2>

            <p className="mt-3 leading-relaxed text-white/40">
              Are you sure you want to leave this
              Queuemitment? You won&apos;t be able to
              continue this conversation.
            </p>

            <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() =>
                  setShowLeaveModal(false)
                }
                className="rounded-xl border border-white/[0.08] px-5 py-3 text-sm text-white/60 transition hover:bg-white/[0.05] hover:text-white"
              >
                Stay
              </button>

              <button
                type="button"
                onClick={leaveChat}
                className="rounded-xl bg-violet-500 px-5 py-3 text-sm font-medium transition hover:bg-violet-400"
              >
                Yes, leave
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* REPORT MODAL */}

      {showReportModal && (
        <Modal>
          <div className="max-h-[90vh] overflow-y-auto p-7">
            <div className="mb-6 flex items-start justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-red-400/15 bg-red-500/10 text-red-300">
                <MessageCircleWarning size={22} />
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowReportModal(false)
                }
                className="flex h-9 w-9 items-center justify-center rounded-xl text-white/35 transition hover:bg-white/[0.05] hover:text-white"
              >
                <X size={19} />
              </button>
            </div>

            <h2 className="text-2xl font-semibold">
              In this conversation I felt...
            </h2>

            <p className="mt-2 text-sm leading-relaxed text-white/40">
              Tell us what happened. Your report helps us
              keep Queuerious safe.
            </p>

            {/* REASONS */}

            <div className="mt-7 grid gap-3">
              {(
                [
                  "Harassment",
                  "Racism",
                  "Fear",
                  "Other",
                ] as ReportReason[]
              ).map((reason) => {
                const selected =
                  reportReason === reason;

                return (
                  <button
                    key={reason}
                    type="button"
                    onClick={() =>
                      setReportReason(reason)
                    }
                    className={`flex items-center justify-between rounded-2xl border px-5 py-4 text-left text-sm transition ${
                      selected
                        ? "border-red-400/40 bg-red-500/10 text-red-200"
                        : "border-white/[0.07] bg-white/[0.025] text-white/55 hover:border-white/[0.12] hover:bg-white/[0.04]"
                    }`}
                  >
                    {reason}

                    {selected && (
                      <Check
                        size={18}
                        className="text-red-300"
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* COMMENT */}

            <div className="mt-5">
              <label className="mb-2 block text-xs font-medium uppercase tracking-[0.14em] text-white/30">
                Additional details (optional)
              </label>

              <textarea
                value={reportComment}
                onChange={(event) =>
                  setReportComment(
                    event.target.value
                  )
                }
                placeholder="Tell us more about what happened..."
                className="min-h-[110px] w-full resize-none rounded-2xl border border-white/[0.08] bg-white/[0.025] px-4 py-4 text-sm text-white outline-none placeholder:text-white/20 transition focus:border-red-400/30 focus:bg-white/[0.04]"
              />
            </div>

            {/* ACTIONS */}

            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() =>
                  setShowReportModal(false)
                }
                className="rounded-xl border border-white/[0.08] px-5 py-3 text-sm text-white/60 transition hover:bg-white/[0.05] hover:text-white"
              >
                Close
              </button>

              <button
                type="button"
                disabled={!reportReason}
                onClick={submitReport}
                className="rounded-xl bg-red-500 px-5 py-3 text-sm font-medium text-white transition hover:bg-red-400 disabled:cursor-not-allowed disabled:bg-white/[0.06] disabled:text-white/20"
              >
                Send report
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}

/* MODAL */

function Modal({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-[28px] border border-white/[0.08] bg-[#121217] shadow-2xl shadow-black/60">
        {children}
      </div>
    </div>
  );
}