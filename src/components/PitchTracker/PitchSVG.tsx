"use client"

import React from 'react'

type Props = {
    onRecord: (row: any) => void
}

export default function PitchSVG({ onRecord }: Props) {
    const width = 840
    const height = 600
    const strikeW = 120
    const strikeH = 160

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
        // determine strike by svg internal position inside the drawn strike rectangle
        const strikeRectX = (width - strikeW) / 2
        const strikeRectY = (height - strikeH) / 2
        const isStrike = svgX >= strikeRectX && svgX <= strikeRectX + strikeW && svgY >= strikeRectY && svgY <= strikeRectY + strikeH

        const payload = { x, y, strike: !!isStrike, ground: !!isGround, timestamp: new Date().toISOString() }

        const res = await fetch('/api/pitch-data', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        })
        const row = await res.json()
        onRecord(row)
    }

    return (
        <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height} style={{ border: '1px solid #ccc' }} onClick={handleClick}>
            <rect x={0} y={0} width={width} height={height} fill="#eef" />
            {/* ground area at bottom */}
            <rect x={0} y={height - 80} width={width} height={80} fill="#cfc" />

            {/* strike zone centered */}
            <rect x={(width - strikeW) / 2} y={(height - strikeH) / 2} width={strikeW} height={strikeH} fill="rgba(255,255,255,0.6)" stroke="#000" />

            {/* marks for 6ft extents */}
            <line x1={0} y1={height / 2} x2={(width - strikeW) / 2} y2={height / 2} stroke="#888" strokeDasharray="4" />
            <line x1={(width + strikeW) / 2} y1={height / 2} x2={width} y2={height / 2} stroke="#888" strokeDasharray="4" />
            <line x1={width / 2} y1={0} x2={width / 2} y2={(height - strikeH) / 2} stroke="#888" strokeDasharray="4" />

            <text x={10} y={20} fontSize={12}>Click to record pitch (center = 0,0)</text>
        </svg>
    )
}
