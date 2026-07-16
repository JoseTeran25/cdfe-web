"use client";
import { Phone, Calendar, MessageSquareText } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import type { SupportRequest } from "@/types";
import { formatDate, getContactMethodLabel } from "@/lib/utils";

interface Props {
  request: SupportRequest | null;
  onClose: () => void;
  onToggleContacted: (request: SupportRequest) => void;
}

export function SupportRequestDetailModal({ request, onClose, onToggleContacted }: Props) {
  if (!request) return null;

  return (
    <Modal
      open={!!request}
      onClose={onClose}
      title={request.name}
      footer={
        <Button
          variant={request.contacted ? "secondary" : "primary"}
          onClick={() => onToggleContacted(request)}
        >
          {request.contacted ? "Marcar como pendiente" : "Marcar como contactado"}
        </Button>
      }
    >
      <div className="space-y-5">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={request.contacted ? "success" : "pending"} dot size="md">
            {request.contacted ? "Contactado" : "Pendiente"}
          </Badge>
          <Badge variant="navy" size="md">{getContactMethodLabel(request.contactMethod)}</Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-start gap-2.5">
            <Phone className="w-4 h-4 text-navy/50 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-gray-400">Contacto</p>
              <p className="text-sm font-medium text-gray-800">{request.contact}</p>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <Calendar className="w-4 h-4 text-navy/50 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-gray-400">Recibido</p>
              <p className="text-sm font-medium text-gray-800">{formatDate(request.createdAt)}</p>
            </div>
          </div>
        </div>

        {request.situation && (
          <div className="flex items-start gap-2.5">
            <MessageSquareText className="w-4 h-4 text-navy/50 mt-0.5 shrink-0" />
            <div className="min-w-0">
              <p className="text-xs text-gray-400 mb-1">Lo que compartió</p>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{request.situation}</p>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
