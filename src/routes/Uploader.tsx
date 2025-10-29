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
      
      if (validation.warnings.length > 0) {
        const allWarnings = validation.warnings.flatMap(w => w.warnings)
        setWarnings(allWarnings)
      }
      
      if (validation.invalidFiles.length > 0) {
        const errorMessages = validation.invalidFiles.map(({ file, error }) => 
          `${file.name}: ${error}`
        )
        setError(errorMessages.join('; '))
      }
      
      // Process valid files asynchronously to extract metadata
      for (const file of validation.validFiles) {
        try {
          const mediaFile = await createMediaFile(file)
          addFile(mediaFile)
        } catch (err) {
          console.error(`Failed to process file ${file.name}:`, err)
          setError(`Failed to process ${file.name}`)
        }
      }
      
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

  // Handle files with path information (for export functionality)
  const handleFilesAddedWithPath = useCallback(async (filesWithPath: { file: File; path: string }[]) => {
    clearError()
    setWarnings([])
    setLoading(true)
    
    try {
      const files = filesWithPath.map(f => f.file)
      const validation = validateMultipleFiles(files)
      
      if (validation.warnings.length > 0) {
        const allWarnings = validation.warnings.flatMap(w => w.warnings)
        setWarnings(allWarnings)
      }
      
      if (validation.invalidFiles.length > 0) {
        const errorMessages = validation.invalidFiles.map(({ file, error }) => 
          `${file.name}: ${error}`
        )
        setError(errorMessages.join('; '))
      }
      
      // Process valid files with path information (needed for export)
      for (const fileWithPath of filesWithPath) {
        const { file, path } = fileWithPath
        if (validation.validFiles.includes(file)) {
          try {
            // Attach the path to the file object for createMediaFile to use
            Object.defineProperty(file, 'path', {
              value: path,
              writable: false,
              configurable: true
            })
            const mediaFile = await createMediaFile(file)
            addFile(mediaFile)
          } catch (err) {
            console.error(`Failed to process file ${file.name}:`, err)
            setError(`Failed to process ${file.name}`)
          }
        }
      }
      
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

  return (
    <div className="flex-1 flex flex-col h-full w-full overflow-hidden bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      {/* Content with Modern Spacing */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-12 bg-gradient-to-br from-gray-950 to-gray-900">
        <div className="w-full h-full space-y-8">
          {/* Error and Warning Display */}
          {(useMediaStore.getState().error || warnings.length > 0) && (
            <div className="space-y-4 animate-slide-in">
              <ErrorDisplay 
                error={useMediaStore.getState().error} 
                onDismiss={handleDismissError}
              />
              <WarningDisplay warnings={warnings} />
            </div>
          )}
          
          <div className="grid grid-cols-1 xl:grid-cols-5 gap-10">
            {/* File Drop Zone - Takes 2 columns */}
            <div className="xl:col-span-2 animate-fade-in">
              <div className="sticky top-0">
                <FileDropZone 
                  onFilesAdded={handleFilesAdded}
                  onFilesAddedWithPath={handleFilesAddedWithPath}
                />
              </div>
            </div>
            
            {/* Media Library - Takes 3 columns */}
            <div className="xl:col-span-3 animate-fade-in flex flex-col" style={{ animationDelay: '0.1s' }}>
              <MediaLibrary />
              {/* File Management - Appears below MediaLibrary */}
              {files.length > 0 && (
                <div className="mt-8 animate-slide-in">
                  <FileManagement />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Uploader
