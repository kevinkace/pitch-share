"use client"

import React, { useState } from 'react'

import style from './PitchTracker.module.css'

type Pitch = {
    id: string
    x: number
    y: number
    strike: boolean
    ground: boolean
    timestamp: string
}

type Props = {
    onRecord: (row: any) => void
    pitches?: Pitch[]
    selectedPitchIds?: string[]
    onPitchClick?: (pitch: Pitch) => void
}

export default function PitchSVG({ onRecord, pitches = [], selectedPitchIds = [], onPitchClick }: Props) {
    const width = 7182
    const height = 7182
    const strikeW = 1419  // width from strike-zone-2.svg (4301-2882)
    const strikeH = 1703  // height from strike-zone-2.svg
    const grassHeight = 567  // height from strike-zone-2.svg ground section
    const borderThickness = 176  // scaled border thickness

    const [ mouse, setMouse ] = useState({ x: 0, y: 0 });
    const [ svgPos, setSvgPos ] = useState({ x: 0, y: 0 });
    const [ pitchType, setPitchType ] = useState('')

    function toFeet(pxX: number, pxY: number) {
        const cx = width / 2
        const cy = height / 2
        // Add half strike zone height to center y at strike zone center
        const strikeZoneCenterY = cy + (strikeH / 2)
        // map horizontal to +/-12 feet, vertical to +/-6 feet
        const xFeet = ((pxX - cx) / (width / 2)) * 12
        const yFeet = ((strikeZoneCenterY - pxY) / (height / 2)) * 6
        return { x: Number(xFeet.toFixed(3)), y: Number(yFeet.toFixed(3)) }
    }

    function toSvgCoords(xFeet: number, yFeet: number) {
        const cx = width / 2
        const cy = height / 2
        // Add half strike zone height to center y at strike zone center
        const strikeZoneCenterY = cy + (strikeH / 2)
        // Reverse the toFeet calculation
        const svgX = cx + (xFeet * (width / 2)) / 12
        const svgY = strikeZoneCenterY - (yFeet * (height / 2)) / 6
        return { x: svgX, y: svgY }
    }

    const handleClick = async (e: React.MouseEvent<SVGSVGElement>) => {
        const rect = (e.currentTarget as SVGSVGElement).getBoundingClientRect()

        const pxX = e.clientX - rect.left
        const pxY = e.clientY - rect.top

        // convert rendered pixel coords to SVG internal coordinates
        const svgX = (pxX / rect.width) * width
        const svgY = (pxY / rect.height) * height

        const { x, y } = toFeet(svgX, svgY)

        const isGround = (e.target as Element)?.id === 'ground'
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
        <div
            className={style.wrapper}
            onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();

                const x = Math.floor(e.clientX - rect.left);
                const y = Math.floor(e.clientY - rect.top);

                setMouse({ x, y });
            }}
        >
            <div
                className={style.tooltip}
                style={{
                    top : `calc(${mouse.y}px - ${pitchType.length ? "4" : "2.5"}em)`,
                    left : `calc(${mouse.x}px - 4.5em)`
                }}
            >
                {pitchType.length ? <>{pitchType}<br /></> : <></>}
                {`x: ${svgPos.x}', y: ${svgPos.y}'`}
            </div>


            <svg
                viewBox={`0 0 ${width} ${height}`}
                width="100%"
                height="600"  // Keep rendered height reasonable
                onClick={handleClick}
                className={style.svg}
                onMouseMove={(e) => {
                    const rect = (e.currentTarget as SVGSVGElement).getBoundingClientRect();

                    const pxX = e.clientX - rect.left
                    const pxY = e.clientY - rect.top

                    // convert rendered pixel coords to SVG internal coordinates
                    const svgX = Math.floor((pxX / rect.width) * width);
                    const svgY = Math.floor((pxY / rect.height) * height);

                    setSvgPos(toFeet(svgX, svgY));

                    const targetId = (e.target as Element)?.id

                    if (targetId === 'strike-zone') {
                        setPitchType('Strike')
                    } else if (targetId === 'ground') {
                        setPitchType('Ground')
                    } else if ([ "top", "left", "right" ].includes(targetId)) {
                        setPitchType('Out of Bounds')
                    } else {
                        setPitchType('')
                    }
                }}
            >

                {/* Strike zone group */}
                <g className={style.hoverable}>

                    <rect
                        id="strike-zone-border"
                        x={2882}
                        y={3544}
                        width={strikeW}
                        height={strikeH}
                        fill="var(--strike-zone-color)"
                    />

                    <rect
                        id="strike-zone-inner"
                        x={2882 + borderThickness}
                        y={3544 + borderThickness}
                        width={strikeW - 2 * borderThickness}
                        height={strikeH - 2 * borderThickness}
                        fill="var(--strike-zone-inner-color)"
                    />

                    <rect id="strike-zone" fill="transparent" x={2882} y={3544} width={strikeW} height={strikeH}/>
                </g>


                {/* Outer radial regions group */}
                <g
                    id="outer"
                    fill="var(--outer-regions-color)"
                >
                    {
                        Object.entries({
                            SE : "m6615 4395v2220l-2315-1367.7v-852.3z",
                            NE : "m6615 567v3829h-2315l0.36-852z",
                            NNE : "m6615 567l-2314.64 2977h-709.36v-2977z",
                            NNW : "m3591 567v2977h-709l-2315-2977z",
                            NW : "m2882 3544v852h-2315v-3829z",
                            SW : "m2882 4395v852l-2315 1368v-2220z",
                            SSW : "m3591 5247v1368h-3024l2315-1368z",
                            SSE : "m4300.36 5247l2314.64 1368h-3024v-1368z"
                        }).map(([key, path]) => (
                            <path key={key} id={key} d={path} className={style.hoverable} />
                        ))
                    }
                </g>

                {/* Boundary frame group */}
                <g id="boundary-frame" fill="var(--boundary-frame-color)">
                    {
                        Object.entries({
                            left : "m567 567v6048h-567v-6615z",
                            top : "m7182 0l-567 567h-6048l-567-567z",
                            right : "m7182 0v6615h-567v-6048z"
                        }).map(([key, path]) => (
                            <path key={key} id={key} d={path} className={style.hoverable} />
                        ))
                    }
                </g>

                <g
                    id="home-plate-group"
                    className={style.hoverable}
                >
                    <rect
                        id="ground"
                        x={0}
                        y={6615}
                        width={width}
                        height={grassHeight}
                        fill="var(--ground-color)"
                    />

                    <path
                        id="homeplate"
                        fill="var(--home-plate-color)"
                        d="m4301 6615v70h-1424v-70z"
                    />
                </g>

                {/* Pitch markers group */}
                <g id="pitch-markers">
                    {pitches.map((pitch) => {
                        const { x: svgX, y: svgY } = toSvgCoords(pitch.x, pitch.y)
                        const isSelected = selectedPitchIds.includes(pitch.id)
                        const ballSize = 120 // Size of the ball in SVG units

                        return (
                            <g key={pitch.id}>
                                {/* Ball SVG */}
                                <image
                                    href="/ball-sized.svg"
                                    x={svgX - ballSize / 2}
                                    y={svgY - ballSize / 2}
                                    width={ballSize}
                                    height={ballSize}
                                    opacity={isSelected ? 1 : 0.8}
                                    style={{
                                        filter: isSelected ? 'drop-shadow(0 0 10px #00ff00)' : 'none',
                                        cursor: onPitchClick ? 'pointer' : 'default'
                                    }}
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        onPitchClick?.(pitch)
                                    }}
                                />

                                {/* Selection indicator for selected pitches */}
                                {isSelected && (
                                    <circle
                                        cx={svgX}
                                        cy={svgY}
                                        r={ballSize / 2 + 20}
                                        fill="none"
                                        stroke="#00ff00"
                                        strokeWidth="8"
                                        opacity="0.8"
                                    />
                                )}
                            </g>
                        )
                    })}
                </g>
            </svg>
        </div>
    )
}
