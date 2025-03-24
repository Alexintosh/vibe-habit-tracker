import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import path from 'path'
import fs from 'fs'

// This route handles serving the SQLite WASM files from node_modules
export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    // Construct potential file paths
    const potentialPaths = [
      // Main package path
      path.join(
        process.cwd(),
        'node_modules',
        '@sqlite.org',
        'sqlite-wasm',
        'dist',
        ...params.path
      ),
      // PNPM path
      path.join(
        process.cwd(),
        'node_modules',
        '.pnpm',
        '@sqlite.org+sqlite-wasm@3.49.1-build2',
        'node_modules',
        '@sqlite.org',
        'sqlite-wasm',
        'sqlite-wasm',
        'jswasm',
        ...params.path
      ),
      // Check if the file is directly in the sqlite-wasm directory
      path.join(
        process.cwd(),
        'node_modules',
        '.pnpm',
        '@sqlite.org+sqlite-wasm@3.49.1-build2',
        'node_modules',
        '@sqlite.org',
        'sqlite-wasm',
        'sqlite-wasm',
        'jswasm',
        params.path[0]
      )
    ]
    
    // Try each potential path
    let filePath = null
    let fileData = null
    
    for (const path of potentialPaths) {
      try {
        if (fs.existsSync(path)) {
          filePath = path
          fileData = await readFile(path)
          break
        }
      } catch (err) {
        // Continue to next path
      }
    }
    
    if (!filePath || !fileData) {
      throw new Error(`File not found: ${params.path.join('/')}`)
    }
    
    // Set the correct MIME type based on file extension
    const ext = path.extname(filePath).toLowerCase()
    let contentType = 'application/octet-stream'
    
    if (ext === '.js') {
      contentType = 'application/javascript'
    } else if (ext === '.mjs') {
      contentType = 'application/javascript'
    } else if (ext === '.wasm') {
      contentType = 'application/wasm'
    } else if (ext === '.worker.js') {
      contentType = 'application/javascript'
    }
    
    return new NextResponse(fileData, {
      headers: {
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*',
        'Cross-Origin-Embedder-Policy': 'require-corp',
        'Cross-Origin-Opener-Policy': 'same-origin',
      },
    })
  } catch (error) {
    console.error('Error serving SQLite WASM file:', error)
    return new NextResponse(null, { status: 404 })
  }
} 