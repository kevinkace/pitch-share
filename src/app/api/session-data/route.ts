import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Path to the CSV file
    const csvPath = path.join(process.cwd(), 'src', 'lib', 'data', 'PR_20260131_427_session.csv');

    // Check if file exists
    if (!fs.existsSync(csvPath)) {
      return NextResponse.json({ error: 'Data file not found' }, { status: 404 });
    }

    // Read the CSV file
    const csvContent = fs.readFileSync(csvPath, 'utf-8');

    // Parse CSV (simple parser for demo - you might want to use a library like csv-parse for production)
    const lines = csvContent.trim().split('\n');
    const headers = lines[0].split(',').map(header => header.trim());

    const data = lines.slice(1).map(line => {
      const values = line.split(',').map(value => value.trim());
      const row: { [key: string]: string } = {};

      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });

      return row;
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error reading CSV file:', error);
    return NextResponse.json({ error: 'Failed to read data' }, { status: 500 });
  }
}