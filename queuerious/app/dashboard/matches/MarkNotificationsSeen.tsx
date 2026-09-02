"use client";

import { useEffect } from "react";

type Props = {
  userId: string;
};

export default function MarkNotificationsSeen({
  userId,
}: Props) {
  useEffect(() => {
    const key = `queuerious-notifications-seen-${userId}`;

    localStorage.setItem(key, new Date().toISOString());

    window.dispatchEvent(
      new CustomEvent("queuerious-notifications-seen")
    );
  }, [userId]);

  return null;
}