
import React, { useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { X } from 'lucide-react';

interface ScannerOverlayProps {
  onScanSuccess: (text: string) => void;
  onClose: () => void;
}

export const ScannerOverlay: React.FC<ScannerOverlayProps> = ({ onScanSuccess, onClose }) => {
  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    const html5QrCode = new Html5Qrcode("qr-reader");
    scannerRef.current = html5QrCode;
    
    html5QrCode.start(
      { facingMode: "environment" },
      { fps: 15, qrbox: 250 },
      (text) => {
        onScanSuccess(text);
      },
      (errorMessage) => {
        // parse error, ignore
      }
    ).catch(err => {
      console.error("Error starting scanner", err);
      onClose();
    });

    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, [onScanSuccess, onClose]);

  return (
    <div className="fixed inset-0 bg-black z-[100] flex flex-col p-6 animate-in fade-in">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-white font-bold uppercase tracking-widest text-base">扫描中 Scanning...</h3>
        <button onClick={onClose} className="text-white/40 hover:text-white transition-colors"><X className="w-8 h-8" /></button>
      </div>
      <div className="flex-1 flex flex-col justify-center">
        <div id="qr-reader" className="w-full aspect-square rounded-3xl overflow-hidden bg-white/5 border-4 border-white/10 shadow-2xl" />
        <p className="mt-8 text-white/40 text-center text-sm font-medium">请对准纸质或电子二维码<br/>Align QR code within frame</p>
      </div>
    </div>
  );
};
