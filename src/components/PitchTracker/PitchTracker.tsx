"use client"

import React from 'react';

import { Flex } from '@radix-ui/themes';

import PitchSVG from '@/components/PitchTracker/PitchSVG';

export default function PitchTracker() {


    return (
        <Flex direction="row" gap="4">
            <div>
                <PitchSVG />
            </div>
            <div>
                pitch events
            </div>
        </Flex>
    )
}
