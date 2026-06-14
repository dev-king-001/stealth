import { useCallback, useEffect, useRef, useState } from "react";

type FeedbackTone = "neutral" | "success" | "warning" | "danger";

interface FeedbackItem {
  id: string;
  message: string;
  tone: FeedbackTone;
}

interface NotifyOptions {
  duration?: number;
  tone?: FeedbackTone;
}

let feedbackSequence = 0;

export function useFeedback() {
  const [items, setItems] = useState<FeedbackItem[]>([]);
  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>());

  const dismiss = useCallback((id: string) => {
    const timer = timers.current.get(id);
    if (timer) clearTimeout(timer);
    timers.current.delete(id);
    setItems((current) => current.filter((item) => item.id !== id));
  }, []);

  const notify = useCallback(
    (message: string, options: NotifyOptions = {}) => {
      const id = `feedback-${Date.now()}-${feedbackSequence++}`;
      const item: FeedbackItem = {
        id,
        message,
        tone: options.tone ?? "neutral",
      };

      setItems((current) => [...current, item]);

      if (options.duration !== 0) {
        timers.current.set(
          id,
          setTimeout(() => dismiss(id), options.duration ?? 4000),
        );
      }

      return id;
    },
    [dismiss],
  );

  useEffect(
    () => () => {
      timers.current.forEach(clearTimeout);
      timers.current.clear();
    },
    [],
  );

  return { dismiss, items, notify };
}

export type { FeedbackItem, FeedbackTone, NotifyOptions };
