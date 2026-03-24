import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type React from "react";
import { useLang } from "../LanguageContext";

interface Props {
  open: boolean;
  onClose: () => void;
  order: {
    id: string;
    cropName: string;
    quantity: number;
    unit: string;
    totalPrice: number;
    farmerName: string;
    buyerName: string;
    date: string;
    status: string;
  };
}

const ReceiptModal: React.FC<Props> = ({ open, onClose, order }) => {
  const { t } = useLang();

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>🧾 Digital Receipt</DialogTitle>
        </DialogHeader>
        <div
          id="receipt-content"
          className="border border-dashed border-border rounded-xl p-4 space-y-2 text-sm"
        >
          <div className="text-center">
            <div className="text-2xl">🌾</div>
            <div className="font-bold text-lg">{t("appName")}</div>
            <div className="text-xs text-muted-foreground">Order Receipt</div>
          </div>
          <div className="border-t border-dashed border-border my-2" />
          <div className="flex justify-between">
            <span className="text-muted-foreground">Order ID</span>
            <span className="font-semibold">{order.id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Date</span>
            <span>{order.date}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Crop</span>
            <span className="font-semibold">{order.cropName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Quantity</span>
            <span>
              {order.quantity} {order.unit}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Farmer</span>
            <span>{order.farmerName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Buyer</span>
            <span>{order.buyerName}</span>
          </div>
          <div className="border-t border-dashed border-border my-2" />
          <div className="flex justify-between text-base font-bold">
            <span>Total</span>
            <span className="text-primary">
              ₹{order.totalPrice.toLocaleString()}
            </span>
          </div>
          <div className="text-center mt-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold ${
                order.status === "accepted"
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {order.status.toUpperCase()}
            </span>
          </div>
        </div>
        <Button className="w-full mt-2" onClick={() => window.print()}>
          {t("printReceipt")}
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default ReceiptModal;
