import { NextRequest, NextResponse } from 'next/server';
import { loadPitchPlacementData, filterPitchesByDateRange } from '@/lib/pitchData';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const sessionId = searchParams.get('sessionId');

    let pitches = loadPitchPlacementData();

    // Filter by date range if provided
    if (startDate) {
      pitches = filterPitchesByDateRange(pitches, startDate, endDate || undefined);
    }

    // If sessionId is provided, you could filter by session
    // This would require extending the CSV to include sessionId or implement session logic
    // For now, we'll return all pitches in the date range

    return NextResponse.json({
      pitches,
      count: pitches.length,
      filters: {
        startDate,
        endDate,
        sessionId
      }
    });
  } catch (error) {
    console.error('Error fetching pitch placement data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pitch placement data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // This could be extended to save new pitch data
    // For now, just echo back the received data
    const pitchData = await request.json();

    console.log('Received new pitch data:', pitchData);

    // Here you would typically save to your data store
    // For now, just return the data with an ID if it doesn't have one
    const responseData = {
      ...pitchData,
      id: pitchData.id || `pitch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Error saving pitch data:', error);
    return NextResponse.json(
      { error: 'Failed to save pitch data' },
      { status: 500 }
    );
  }
}