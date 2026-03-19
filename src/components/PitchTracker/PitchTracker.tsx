"use client";

import React, { useState } from 'react';

import { Flex } from '@radix-ui/themes';

import PitchSVG from '@/components/PitchTracker/PitchSVG';
import PositionsGrid from '@/components/PitchTracker/PositionsGrid';
import { PositionData } from '@/lib/contexts/PositionContext';

export default function PitchTracker() {
    const [latestPosition, setLatestPosition] = useState<PositionData | null>(null);

    const handlePositionRecord = (position: PositionData) => {
        console.log('Position recorded:', position);

        // Add position immediately to grid for instant feedback
        setLatestPosition(position);
    };

    return (
        <Flex direction="row" gap="4">
            <PitchSVG onRecord={handlePositionRecord} />

            <PositionsGrid
                newPosition={latestPosition}
            />
        </Flex>
    );
}
