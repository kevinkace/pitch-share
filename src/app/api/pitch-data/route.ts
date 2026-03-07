import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';

import { isPitchDeleteEnabled, isPitchPlacementEnabled } from "@/lib/featureFlags";

const csvPath = path.join(process.cwd(), 'src', 'lib', 'data', 'pitch_placement.csv')

function ensureCsv() {
    if (!fs.existsSync(csvPath)) {
        const header = 'id,x,y,strike,ground,timestamp\n'

        if (process.env.ENABLE_CREATE_CSV !== 'true') {
            throw new Error('CSV creation is disabled via feature flag');
        };

        fs.mkdirSync(path.dirname(csvPath), { recursive: true })
        fs.writeFileSync(csvPath, header, 'utf-8')
    }
}

export async function GET() {
    try {
        ensureCsv();
        const csv = fs.readFileSync(csvPath, 'utf-8')
        const lines = csv.trim().split('\n')
        const headers = lines[0].split(',')
        const data = lines.slice(1).filter(Boolean).map(line => {
            const vals = line.split(',')
            const obj: any = {}
            headers.forEach((h, i) => { obj[h] = vals[i] })
            // convert types
            obj.x = Number(obj.x)
            obj.y = Number(obj.y)
            obj.strike = obj.strike === 'true'
            obj.ground = obj.ground === 'true'
            return obj
        })
        return NextResponse.json(data.reverse())
    } catch (err) {
        console.error(err)
        return NextResponse.json({ error: 'failed' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    if (!isPitchPlacementEnabled()) {
        return NextResponse.json({ error: 'Pitch placement is disabled' }, { status: 403 });
    }

    try {
        ensureCsv();
        const body = await request.json()
        const id = body.id || randomUUID()
        const x = typeof body.x === 'number' ? body.x : Number(body.x || 0)
        const y = typeof body.y === 'number' ? body.y : Number(body.y || 0)
        const strike = !!body.strike
        const ground = !!body.ground
        const timestamp = body.timestamp || new Date().toISOString()

        const line = `${id},${x},${y},${strike},${ground},${timestamp}\n`
        fs.appendFileSync(csvPath, line, 'utf-8')

        return NextResponse.json({ id, x, y, strike, ground, timestamp })
    } catch (err) {
        console.error(err)
        return NextResponse.json({ error: 'failed' }, { status: 500 })
    }
}

export async function DELETE(request: Request) {
    if (!isPitchDeleteEnabled()) {
        return NextResponse.json({ error: 'Pitch delete is disabled' }, { status: 403 });
    }

    try {
        ensureCsv();
        const body = await request.json()
        const idToRemove = body.id
        if (!idToRemove) return NextResponse.json({ error: 'missing id' }, { status: 400 })

        const csv = fs.readFileSync(csvPath, 'utf-8')
        const lines = csv.split('\n')
        const header = lines[0]
        const kept = [header, ...lines.slice(1).filter(line => {
            if (!line.trim()) return false
            const parts = line.split(',')
            return parts[0] !== idToRemove
        })].join('\n') + '\n'

        fs.writeFileSync(csvPath, kept, 'utf-8')
        return NextResponse.json({ ok: true })
    } catch (err) {
        console.error(err)
        return NextResponse.json({ error: 'failed' }, { status: 500 })
    }
}
