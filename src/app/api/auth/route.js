import { NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";

// Called by middleware to verify the token with Firebase
export async function POST(request) {
    try {
        const token = request.headers.get('Authorization')?.split(' ')[1];
        
        if (!token) {
            throw new Error('No token provided');
        }

        // Verify the token with Firebase Admin SDK
        const decodedToken = await adminAuth.verifyIdToken(token);

        // Return the decoded user ID
        return NextResponse.json({ success: true, userId: decodedToken.uid }, { status: 200 });

    } catch (error) {
        console.error('Error in auth route:', error.message);
        return NextResponse.json({ success: false, error: error.message || 'Authentication failed' }, { status: 400 });
    }
}
