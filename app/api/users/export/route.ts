import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { users } = body

    if (!users || !Array.isArray(users)) {
      return NextResponse.json(
        { error: 'Invalid users data' },
        { status: 400 }
      )
    }

    // Create data directory if it doesn't exist
    const dataDir = path.join(process.cwd(), 'public', 'data')
    await mkdir(dataDir, { recursive: true })

    // Create the users JSON file
    const timestamp = new Date().toISOString().split('T')[0]
    const filename = `users-backup-${timestamp}.json`
    const filepath = path.join(dataDir, filename)

    const dataToSave = {
      exportedAt: new Date().toISOString(),
      totalUsers: users.length,
      users: users,
    }

    await writeFile(filepath, JSON.stringify(dataToSave, null, 2), 'utf-8')

    // Also save as a general users.json file
    const mainFilepath = path.join(dataDir, 'users.json')
    await writeFile(mainFilepath, JSON.stringify(dataToSave, null, 2), 'utf-8')

    return NextResponse.json({
      success: true,
      message: `Users exported successfully to ${filename}`,
      filename,
      totalUsers: users.length,
    })
  } catch (error) {
    console.error('Error exporting users:', error)
    return NextResponse.json(
      { error: 'Failed to export users' },
      { status: 500 }
    )
  }
}
