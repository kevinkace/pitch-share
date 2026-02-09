"use client"

import React from 'react'

import style from './PitchTracker.module.css'

type Props = {
    onRecord: (row: any) => void
}

export default function PitchSVG({ onRecord }: Props) {
    const width = 7182
    const height = 7182
    const strikeW = 1419  // width from strike-zone-2.svg (4301-2882)
    const strikeH = 1703  // height from strike-zone-2.svg
    const grassHeight = 567  // height from strike-zone-2.svg ground section
    const borderThickness = 176  // scaled border thickness

    function toFeet(pxX: number, pxY: number) {
        const cx = width / 2
        const cy = height / 2
        // map horizontal to +/-12 feet, vertical to +/-6 feet
        const xFeet = ((pxX - cx) / (width / 2)) * 12
        const yFeet = ((cy - pxY) / (height / 2)) * 6
        return { x: Number(xFeet.toFixed(3)), y: Number(yFeet.toFixed(3)) }
    }

    const handleClick = async (e: React.MouseEvent<SVGSVGElement>) => {
        const rect = (e.currentTarget as SVGSVGElement).getBoundingClientRect()

        const pxX = e.clientX - rect.left
        const pxY = e.clientY - rect.top

        // convert rendered pixel coords to SVG internal coordinates
        const svgX = (pxX / rect.width) * width
        const svgY = (pxY / rect.height) * height

        const { x, y } = toFeet(svgX, svgY)

        const isGround = y < -3 // simple heuristic: below center
        const isStrike = (e.target as Element)?.id === 'strike-zone'

        const res = await fetch('/api/pitch-data', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                x,
                y,
                strike: !!isStrike,
                ground: !!isGround,
                timestamp: new Date().toISOString()
            }),
        })

        const row = await res.json()

        onRecord(row)
    }

    return (
        <svg
            viewBox={`0 0 ${width} ${height}`}
            width="100%"
            height="600"  // Keep rendered height reasonable
            onClick={handleClick}
            className={style.svg}
        >
            {/* ground area at bottom - matches strike-zone-2.svg */}
            <rect x={0} y={6615} width={width} height={grassHeight} fill="rgb(28, 51, 0)" />

            {/* Strike zone group */}
            <rect
                id="strike-zone"
                x={2882}
                y={3544}
                width={strikeW}
                height={strikeH}
                fill="rgb(103, 0, 0)"
            />

            <rect
                x={2882 + borderThickness}
                y={3544 + borderThickness}
                width={strikeW - 2 * borderThickness}
                height={strikeH - 2 * borderThickness}
                fill="#434343"
            />


            {/* Outer radial regions group */}
            <g id="outer" fill="rgba(0, 192, 255, 0.3)">
                <path id="SE" d="m6615 4395v2220l-2315-1367.7v-852.3z" />
                <path id="NE" d="m6615 567v3829h-2315l0.36-852z" />
                <path id="NNE" d="m6615 567l-2314.64 2977h-709.36v-2977z" />
                <path id="NNW" d="m3591 567v2977h-709l-2315-2977z" />
                <path id="NW" d="m2882 3544v852h-2315v-3829z" />
                <path id="SW" d="m2882 4395v852l-2315 1368v-2220z" />
                <path id="SSW" d="m3591 5247v1368h-3024l2315-1368z" />
                <path id="SSE" d="m4300.36 5247l2314.64 1368h-3024v-1368z" />
            </g>

            {/* Boundary frame group */}
            <g id="boundary-frame" fill="rgba(255, 241, 89, 0.4)">
                <path id="L" d="m567 567v6048h-567v-6615z" />
                <path id="top" d="m7182 0l-567 567h-6048l-567-567z" />
                <path id="R" d="m7182 0v6615h-567v-6048z" />
            </g>

            {/* reference lines */}
            {/* <line x1={0} y1={height / 2} x2={2882} y2={height / 2} stroke="#888" strokeDasharray="20" />
            <line x1={4301} y1={height / 2} x2={width} y2={height / 2} stroke="#888" strokeDasharray="20" />
            <line x1={width / 2} y1={0} x2={width / 2} y2={3544} stroke="#888" strokeDasharray="20" /> */}
        </svg>
    )
}
