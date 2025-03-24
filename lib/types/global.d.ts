interface FileSystemHandle {
  kind: 'file' | 'directory'
  name: string
  createWritable(): Promise<FileSystemWritableFileStream>
  getFile(): Promise<File>
  resolve(): Promise<string | null>
}

interface FileSystemWritableFileStream extends WritableStream {
  write(data: BufferSource | Blob | string): Promise<void>
  seek(position: number): Promise<void>
  truncate(size: number): Promise<void>
}

interface Window {
  showOpenFilePicker(options?: {
    types?: Array<{
      description?: string
      accept: Record<string, string[]>
    }>
  }): Promise<FileSystemHandle[]>
  
  showSaveFilePicker(options?: {
    types?: Array<{
      description?: string
      accept: Record<string, string[]>
    }>
    suggestedName?: string
  }): Promise<FileSystemHandle>
} 