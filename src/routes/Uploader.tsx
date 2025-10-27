import React, { useCallback, useState } from 'react'
import FileDropZone from '../components/FileDropZone'
import MediaLibrary from '../components/MediaLibrary'
import FileManagement from '../components/FileManagement'
import ErrorDisplay, { WarningDisplay } from '../components/ErrorDisplay'
import { useMediaStore } from '../state/mediaStore'
import { createMediaFile, validateMultipleFiles, getErrorMessage } from '../utils/fileUtils'

const Uploader: React.FC = () => {
  const { addFile, setLoading, setError, clearError, files } = useMediaStore()
  const [warnings, setWarnings] = useState<string[]>([])

  const handleFilesAdded = useCallback(async (files: File[]) => {
    clearError()
    setWarnings([])
    
    try {
      const validation = validateMultipleFiles(files)
      
      // Show warnings if any
      if (validation.warnings.length > 0) {
        const allWarnings = validation.warnings.flatMap(w => w.warnings)
        setWarnings(allWarnings)
      }
      
      // Show errors for invalid files
      if (validation.invalidFiles.length > 0) {
        const errorMessages = validation.invalidFiles.map(({ file, error }) => 
          `${file.name}: ${error}`
        )
        setError(errorMessages.join('; '))
      }
      
      // Process valid files
      for (const file of validation.validFiles) {
        const mediaFile = createMediaFile(file)
        addFile(mediaFile)
      }
      
      // Show summary
      if (validation.validFiles.length > 0) {
        const summary = `Successfully imported ${validation.validFiles.length} file(s)`
        if (validation.invalidFiles.length > 0) {
          console.warn(`${summary}, ${validation.invalidFiles.length} file(s) failed validation`)
        } else {
          console.log(summary)
        }
      }
      
    } catch (error) {
      const errorMessage = getErrorMessage(error)
      setError(`Failed to process files: ${errorMessage}`)
      console.error('Error processing files:', error)
    } finally {
      setLoading(false)
    }
  }, [addFile, setLoading, setError, clearError])

  const handleDismissError = useCallback(() => {
    clearError()
  }, [clearError])

  const handleDismissWarnings = useCallback(() => {
    setWarnings([])
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            📁 Uploader
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Import and organize your video files
          </p>
        </div>
        
        {/* Error and Warning Display */}
        <div className="mb-6 space-y-4">
          <ErrorDisplay 
            error={useMediaStore.getState().error} 
            onDismiss={handleDismissError}
          />
          <WarningDisplay 
            warnings={warnings}
          />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* File Drop Zone */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Import Files
            </h2>
            <FileDropZone onFilesAdded={handleFilesAdded} />
          </div>
          
          {/* Media Library */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 lg:col-span-2">
            <MediaLibrary />
          </div>
        </div>

        {/* File Management */}
        {files.length > 0 && (
          <div className="mt-8">
            <FileManagement />
          </div>
        )}
      </div>
    </div>
  )
}

export default Uploader
