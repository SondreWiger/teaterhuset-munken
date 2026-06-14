"use client";

import { useState } from "react";
import { PaymentModal } from "@/components/payment/payment-modal";

export function BuyButton({ video, user }: { video: any; user: any }) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      {!user ? (
        <a
          href={`/login?redirect=/shows/${video.team_id}`}
          className="btn-gold rounded-lg px-4 py-2 text-xs font-medium inline-flex items-center"
        >
          <span>Logg inn for å kjøpe</span>
        </a>
      ) : (
        <button
          onClick={() => setShowModal(true)}
          className="btn-gold rounded-lg px-4 py-2 text-xs font-medium"
        >
          <span>Kjøp</span>
        </button>
      )}
      {showModal && (
        <PaymentModal
          video={video}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}
