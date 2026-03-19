"use client";

import React from 'react';

import { Flex } from '@radix-ui/themes';

import PitchSVG from '@/components/PitchTracker/PitchSVG';
import { PositionData } from '@/lib/contexts/PositionContext';

export default function PitchTracker() {
    const handlePositionRecord = (position: PositionData) => {
        console.log('Position recorded:', position);
        // You can add more handling here like updating state, showing notifications, etc.
    };

    return (
        <Flex direction="row" gap="4">
            <div>
                <PitchSVG onRecord={handlePositionRecord} />
            </div>
            <div>
                pitch events
            </div>
        </Flex>
    );
}
