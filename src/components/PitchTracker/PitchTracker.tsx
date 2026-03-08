"use client"

import React from 'react';

import PitchSVG from '@/components/PitchTracker/PitchSVG';

export default function PitchTracker() {


    return (
        <>
            <div style={{ flex: 2 }}>
                <PitchSVG />
            </div>
            <div style={{ flex: 1 }}>
                pitch events
            </div>
        </>
    )
}
