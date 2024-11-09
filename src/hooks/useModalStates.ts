import { useState } from 'react';
import { AIInsight } from '@/types';

export const useModalStates = () => {
    const [showQRCode, setShowQRCode] = useState(false);
    const [showAddMeetingDialog, setShowAddMeetingDialog] = useState(false);
    const [showCreateMeetingTypeDialog, setShowCreateMeetingTypeDialog] = useState(false);
    const [selectedInsight, setSelectedInsight] = useState<AIInsight | null>(null);

    return {
        qrCode: {
            isOpen: showQRCode,
            open: () => setShowQRCode(true),
            close: () => setShowQRCode(false),
        },
        addMeeting: {
            isOpen: showAddMeetingDialog,
            open: () => setShowAddMeetingDialog(true),
            close: () => setShowAddMeetingDialog(false),
        },
        createMeetingType: {
            isOpen: showCreateMeetingTypeDialog,
            open: () => setShowCreateMeetingTypeDialog(true),
            close: () => setShowCreateMeetingTypeDialog(false),
        },
        insight: {
            selected: selectedInsight,
            select: setSelectedInsight,
            close: () => setSelectedInsight(null),
        },
    };
}; 