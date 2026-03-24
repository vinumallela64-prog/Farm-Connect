import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type React from "react";
import { useState } from "react";
import { useLang } from "../LanguageContext";

const HelpButton: React.FC = () => {
  const { t } = useLang();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-20 right-4 z-50 bg-primary text-primary-foreground rounded-full px-4 py-3 shadow-lg font-semibold text-sm flex items-center gap-2 hover:opacity-90 transition-opacity md:bottom-6"
      >
        {t("needHelp")}
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>📞 {t("supportTitle")}</DialogTitle>
          </DialogHeader>
          <div className="text-center py-4">
            <div className="text-4xl mb-3">☎️</div>
            <div className="text-2xl font-bold text-primary">1800-180-1551</div>
            <div className="text-sm text-muted-foreground mt-2">
              Toll-free • 24/7 • Hindi / Telugu / English
            </div>
            <a
              href="tel:18001801551"
              className="mt-4 block bg-primary text-primary-foreground rounded-full py-3 font-semibold text-center hover:opacity-90 transition-opacity"
            >
              📞 Call Now
            </a>
            <a
              href="https://wa.me/911800180155"
              className="mt-2 block bg-green-500 text-white rounded-full py-3 font-semibold text-center hover:opacity-90 transition-opacity"
            >
              💬 WhatsApp Support
            </a>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default HelpButton;
