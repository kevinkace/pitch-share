"use client";

import React, { useState } from 'react';

import { usePosition, PositionData } from '@/lib/contexts/PositionContext';

import style from './PitchTracker.module.css';

const DECIMAL = 1;

type Props = {
    onRecord?: (position: PositionData) => void
    positions?: PositionData[]
    showPositions?: boolean
}

export default function PitchSVG({ onRecord, positions = [], showPositions = false }: Props) {
    const { savePosition } = usePosition();

    const width = 7182;
    const height = 7182;

    const strikeZoneCenter = {
        x : width / 2,
        y : 4395.5
    };

    const strikeW = 1419;
    const strikeH = 1703;

    const pxToFeet = 85.5 * 12;

    const strikeLeft = strikeZoneCenter.x - strikeW / 2;
    const strikeTop = strikeZoneCenter.y - strikeH / 2;

    const borderThickness = 176;

    const grassHeight = 567;


    const [ mouse, setMouse ] = useState({ x: 0, y: 0 });
    const [ svgPos, setSvgPos ] = useState({ x: 0, y: 0 });
    const [ pitchType, setPitchType ] = useState('');
    const [ isHovering, setIsHovering ] = useState(false);

    function toFeet(pxX: number, pxY: number) {
        // distance from strike zone center in feet
        const xFeet = (pxX - strikeZoneCenter.x) / pxToFeet;
        const yFeet = (strikeZoneCenter.y - pxY) / pxToFeet;

        return { x: Number(xFeet.toFixed(DECIMAL)), y: Number(yFeet.toFixed(DECIMAL)) };
    }

    function toSvgCoords(xFeet: number, yFeet: number) {
        const pxX = xFeet * pxToFeet + strikeZoneCenter.x;
        const pxY = strikeZoneCenter.y - yFeet * pxToFeet;
        return { x: pxX, y: pxY };

    }

    const handleClick = async (e: React.MouseEvent<SVGSVGElement>) => {
        const rect = (e.currentTarget as SVGSVGElement).getBoundingClientRect();

        const pxX = e.clientX - rect.left;
        const pxY = e.clientY - rect.top;

        // convert rendered pixel coords to SVG internal coordinates
        const svgX = (pxX / rect.width) * width;
        const svgY = (pxY / rect.height) * height;

        const { x, y } = toFeet(svgX, svgY);

        const isGround = (e.target as Element)?.id === 'ground';
        const isStrike = (e.target as Element)?.id === 'strike-zone';
        const targetId = (e.target as Element)?.id;
        const isOutOfBounds = ['top', 'left', 'right'].includes(targetId);

        const positionData = {
            x,
            y,
            strike: isStrike,
            ground: isGround,
            out_of_bounds: isOutOfBounds,
            // Store exact SVG coordinates for precise circle positioning
            svgX,
            svgY
        };

        // Show position marker immediately for instant feedback
        if (onRecord) {
            onRecord(positionData);
        }

        // Save position data asynchronously
        try {
            await savePosition(positionData);
        } catch (error) {
            console.error('Error saving position:', error);
            // You might want to show a user-friendly error message here
        }
    };

    const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
        const rect = (e.currentTarget as SVGSVGElement).getBoundingClientRect();

        const x = Math.floor(e.clientX - rect.left);
        const y = Math.floor(e.clientY - rect.top);

        setMouse({ x, y });

        const pxX = e.clientX - rect.left;
        const pxY = e.clientY - rect.top;

        // convert rendered pixel coords to SVG internal coordinates
        const svgX = Math.floor((pxX / rect.width) * width);
        const svgY = Math.floor((pxY / rect.height) * height);

        setSvgPos(toFeet(svgX, svgY));

        const targetId = (e.target as Element)?.id;

        if (targetId === 'strike-zone') {
            setPitchType('Strike');
        } else if (targetId === 'ground') {
            setPitchType('Ground');
        } else if (['top', 'left', 'right'].includes(targetId)) {
            setPitchType('Out of Bounds');
        } else {
            setPitchType('Ball');
        }
    };

    const handleMouseEnter = () => {
        setIsHovering(true);
    };

    const handleMouseLeave = () => {
        setIsHovering(false);
    };

    function getBallColor(position: PositionData): string {
        if (position.strike) return '#ef4444'; // Red for strikes
        if (position.ground) return '#22c55e'; // Green for ground
        if (position.out_of_bounds) return '#f59e0b'; // Orange for out of bounds
        return '#3b82f6'; // Default blue for balls
    }

    return (
        <div
            className={style.wrapper}
        >

            {isHovering && (
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
            )}


            <svg
                viewBox={`0 0 ${width} ${height}`}
                width="50vw"  // Keep rendered height reasonable
                onClick={handleClick}
                className={style.svg}
                onMouseMove={handleMouseMove}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >

                {/* Strike zone group */}
                <g className={style.hoverable}>

                    <rect
                        id="strike-zone-border"
                        x={strikeLeft}
                        y={strikeTop}
                        width={strikeW}
                        height={strikeH}
                        fill="var(--strike-zone-color)"
                    />

                    <rect
                        id="strike-zone-inner"
                        x={strikeLeft + borderThickness}
                        y={strikeTop + borderThickness}
                        width={strikeW - 2 * borderThickness}
                        height={strikeH - 2 * borderThickness}
                        fill="var(--strike-zone-inner-color)"
                    />

                    <rect id="strike-zone" fill="transparent" x={strikeLeft} y={strikeTop} width={strikeW} height={strikeH}/>
                    <rect style={{zIndex: 100}} fill="orange" x={strikeZoneCenter.x} y={strikeZoneCenter.y} width={50} height={50} />
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
                            NW : `m${strikeLeft} ${strikeTop}v852h-2315v-3829z`,
                            SW : `m${strikeLeft} 4395v852l-2315 1368v-2220z`,
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

                {/* Position markers group - simple circles */}
                {showPositions && (
                    <g id="position-markers">
                        {positions.map((position, index) => {
                            const circleRadiusInches = 2.9/2; // Simple circle size
                            const circleRadius = circleRadiusInches * (pxToFeet / 12); // Convert inches to pixels
                            // Use stored SVG coordinates if available, otherwise convert from feet
                            const svgX = (position as any).svgX || toSvgCoords(position.x, position.y).x;
                            const svgY = (position as any).svgY || toSvgCoords(position.x, position.y).y;

                            return (
                                <circle
                                    key={position.id || `pos-${index}`}
                                    cx={svgX}
                                    cy={svgY}
                                    r={circleRadius}
                                    fill={getBallColor(position)}
                                    opacity={0.7}
                                    stroke="#ffffff"
                                    strokeWidth="8"
                                />
                            );
                        })}
                    </g>
                )}
            </svg>
        </div>
    );
}
