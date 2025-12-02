"use client";
import { notify } from "@/lib/notify";
import { createContext, useCallback } from "react";

export interface MessageContextProps {
  addSuccess: (text: string) => void;
  addError: (text: string) => void;
}

const MessageContext = createContext<MessageContextProps>({} as any);

export function MessageProvider(props: any) {
  const addMessage = useCallback(
    function (type: "success" | "error", text: string) {
      const description = text.split(/\n/).map((line) => (
        <p key={line} className="text-white/90 text-sm">
          {line}
        </p>
      ));

      if (type === "success") {
        notify.success("Tudo certo!", description);
      } else {
        notify.error("Oops, algo deu errado!", description);
      }
    },
    []
  );

  const addSuccess = useCallback(
    (text: string) => {
      addMessage("success", text);
    },
    [addMessage]
  );

  const addError = useCallback(
    (text: string) => {
      addMessage("error", text);
    },
    [addMessage]
  );

  return (
    <MessageContext.Provider
      value={{
        addSuccess,
        addError,
      }}
    >
      {props.children}
    </MessageContext.Provider>
  );
}

export default MessageContext;
