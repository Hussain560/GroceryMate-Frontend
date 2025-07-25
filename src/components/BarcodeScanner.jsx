import { useEffect, useRef, useState } from 'react';
import api from '../api/api';

export default function BarcodeScanner({ onScan, onClose }) {
  const [isScanning, setIsScanning] = useState(false);
  const [lastScanned, setLastScanned] = useState(null);
  const scannerRef = useRef(null);

  useEffect(() => {
    const loadScanner = async () => {
      try {
        // Dynamically import the scanner to avoid SSR issues
        const Html5QrcodeScanner = (await import('html5-qrcode')).Html5QrcodeScanner;
        
        const scanner = new Html5QrcodeScanner('scanner', {
          qrbox: { width: 250, height: 250 },
          fps: 10,
        });

        scanner.render(async (decodedText) => {
          if (decodedText !== lastScanned) {
            try {
              const response = await api.post('/sales/scan', decodedText, {
                headers: { 'Content-Type': 'text/plain' }
              });

              if (response.data.success) {
                setLastScanned(decodedText);
                const audio = new Audio('/sounds/beep.mp3');
                await audio.play();
                onScan?.(response.data.product);
                setTimeout(() => {
                  scanner.clear();
                  onClose?.();
                }, 1000);
              }
            } catch (error) {
              console.error('Scan error:', error);
            }
          }
        }, (error) => {
          console.warn(error);
        });

        scannerRef.current = scanner;
        setIsScanning(true);
      } catch (error) {
        console.error('Failed to load scanner:', error);
      }
    };

    loadScanner();

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear();
      }
      setIsScanning(false);
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black">
      <div id="scanner" className="w-full h-full relative"></div>
      
      <div className="fixed top-5 left-1/2 transform -translate-x-1/2 
                    bg-blue-900/90 text-white px-5 py-2 rounded-full">
        {isScanning ? 'Scanning...' : 'Starting scanner...'}
      </div>
      
      <button onClick={onClose}
              className="fixed bottom-8 left-1/2 transform -translate-x-1/2 
                       bg-red-600 text-white px-6 py-3 rounded-full
                       hover:bg-red-700 transition-colors">
        Stop Scanner
      </button>
    </div>
  );
}
