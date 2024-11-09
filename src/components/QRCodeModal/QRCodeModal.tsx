import React from 'react';
import { QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';

interface QRCodeModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({ isOpen, onClose }) => {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Scan to Participate</DialogTitle>
                </DialogHeader>
                <div className="w-64 h-64 mx-auto bg-gray-200 flex items-center justify-center">
                    {/* Replace with actual QR Code component or image */}
                    <QrCode size={200} />
                </div>
                <DialogFooter>
                    <Button onClick={onClose} className="w-full">
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}; 