"use client";

import React, { useState } from 'react';

import { Flex, Switch, Text, Box } from '@radix-ui/themes';

import PitchSVG from '@/components/PitchTracker/PitchSVG';
import PositionsGrid from '@/components/PitchTracker/PositionsGrid';
import { PositionData } from '@/lib/contexts/PositionContext';

export default function PitchTracker() {
    const [latestPosition, setLatestPosition] = useState<PositionData | null>(null);
    const [allPositions, setAllPositions] = useState<PositionData[]>([]);
    const [showPositions, setShowPositions] = useState(false);

    const handlePositionRecord = (position: PositionData) => {
        console.log('Position recorded:', position);

        // Add position immediately to grid for instant feedback
        setLatestPosition(position);

        // Add to all positions list for SVG display
        setAllPositions(prev => [position, ...prev]);
    };

    return (
        <Flex direction="column" gap="4">
            <Box>
                <Text as="label" size="2">
                    <Flex gap="2" align="center">
                        <Switch checked={showPositions} onCheckedChange={setShowPositions} />
                        Show all pitches on field
                    </Flex>
                </Text>
            </Box>

            <Flex direction="row" gap="4">
                <PitchSVG
                    onRecord={handlePositionRecord}
                    positions={showPositions ? allPositions : []}
                    showPositions={showPositions}
                />

                <PositionsGrid
                    newPosition={latestPosition}
                />
            </Flex>
        </Flex>
    );
}
