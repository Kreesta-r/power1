'use client'
import { useEffect, useState } from 'react'
import { Edit3, Save, X, Plus, Trash2, MoreHorizontal } from 'lucide-react'

// Define the Slide type to match your database structure
interface Slide {
  id: number
  title: string
  content: string
  order: number
}

interface PresentationViewerProps {
  slide: Slide | null
  currentIndex: number
  totalSlides: number
  onSlideUpdate: (slide: Slide) => void
  onSlideDelete: (slideId: number) => void
  onSlideCreate: (slide: Omit<Slide, 'id'>) => void
}

// Get API base URL from environment variable with fallback
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'

export default function PresentationViewer({ 
  slide, 
  currentIndex, 
  totalSlides, 
  onSlideUpdate,
  onSlideDelete,
  onSlideCreate 
}: PresentationViewerProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState('')
  const [editContent, setEditContent] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [showActions, setShowActions] = useState(false)

  // Initialize edit state when slide changes
  useEffect(() => {
    if (slide) {
      setEditTitle(slide.title)
      setEditContent(slide.content)
    }
  }, [slide])

  // Notify sidebar of slide changes
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('slideChange', { 
      detail: { slideIndex: currentIndex } 
    }))
  }, [currentIndex])

  const handleSave = async () => {
    if (!slide) return
    
    setIsSaving(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/slides/${slide.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: editTitle.trim(),
          content: editContent.trim(),
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save slide')
      }

      const updatedSlide = await response.json()
      onSlideUpdate(updatedSlide)
      setIsEditing(false)
      setShowActions(false)
    } catch (error) {
      console.error('Error saving slide:', error)
      alert('Failed to save slide. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    if (slide) {
      setEditTitle(slide.title)
      setEditContent(slide.content)
    }
    setIsEditing(false)
    setShowActions(false)
  }

  const handleDelete = async () => {
    if (!slide) return
    
    if (!confirm('Are you sure you want to delete this slide? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/slides/${slide.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete slide')
      }

      onSlideDelete(slide.id)
      setShowActions(false)
    } catch (error) {
      console.error('Error deleting slide:', error)
      alert('Failed to delete slide. Please try again.')
    }
  }

  const handleAddSlide = async () => {
    const newSlide = {
      title: 'New Slide',
      content: '# New Slide\n\nAdd your content here...',
      order: totalSlides
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/slides`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newSlide),
      })

      if (!response.ok) {
        throw new Error('Failed to create slide')
      }

      const createdSlide = await response.json()
      onSlideCreate(createdSlide)
      setShowActions(false)
    } catch (error) {
      console.error('Error creating slide:', error)
      alert('Failed to create slide. Please try again.')
    }
  }

  // Handle case where slide might be undefined
  if (!slide) {
    return (
      <div className="h-full flex flex-col bg-gray-50">
        {/* Minimal header */}
        <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-600">Presentation</span>
          </div>
          <button
            onClick={handleAddSlide}
            className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
            title="Add slide"
          >
            <Plus size={18} />
          </button>
        </div>
        
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-gray-400 mb-6 text-lg">No slides yet</div>
            <button
              onClick={handleAddSlide}
              className="inline-flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Plus size={20} />
              <span>Create your first slide</span>
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Convert markdown-like content to JSX with proper spacing and constraints
  const renderContent = (content: string) => {
    const lines = content.split('\n').filter(line => line.trim() !== '')
    let bulletPoints: string[] = []
    
    return lines.map((line, index) => {
      // Main title (# ) - Center aligned, large
      if (line.startsWith('# ')) {
        return (
          <div key={index} className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 leading-tight">
              {line.slice(2)}
            </h1>
            <div className="w-16 h-0.5 bg-green-500 mx-auto mt-6"></div>
          </div>
        )
      }
      
      // Section headers (## ) - Left aligned, medium
      if (line.startsWith('## ')) {
        return (
          <div key={index} className="mb-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-3">
              {line.slice(3)}
            </h2>
          </div>
        )
      }
      
      // Subsection headers (### ) - Left aligned, smaller
      if (line.startsWith('### ')) {
        return (
          <h3 key={index} className="text-lg font-medium text-gray-600 mb-4">
            {line.slice(4)}
          </h3>
        )
      }

      // Collect bullet points
      if (line.startsWith('- ') || line.startsWith('• ')) {
        const bulletText = line.startsWith('- ') ? line.slice(2) : line.slice(2)
        bulletPoints.push(bulletText)
        
        // If this is the last bullet point or next line isn't a bullet, render the list
        const nextLineIndex = index + 1
        const isLastBullet = nextLineIndex >= lines.length || 
          (!lines[nextLineIndex]?.startsWith('- ') && !lines[nextLineIndex]?.startsWith('• '))
        
        if (isLastBullet) {
          const listItems = bulletPoints.map((item, i) => (
            <li key={i} className="text-xl mb-3 text-gray-700 leading-relaxed flex items-start">
              <span className="inline-block w-1.5 h-1.5 bg-green-500 rounded-full mr-4 mt-2.5 flex-shrink-0"></span>
              <span dangerouslySetInnerHTML={{ __html: item.replace(/\*\*(.*?)\*\*/g, '<strong class="text-gray-800 font-semibold">$1</strong>').replace(/\*(.*?)\*/g, '<em class="text-gray-600">$1</em>') }}></span>
            </li>
          ))
          bulletPoints = [] // Reset for next list
          
          return (
            <ul key={index} className="mb-6">
              {listItems}
            </ul>
          )
        }
        return null // Don't render individual bullet points
      }

      // Numbered list items
      if (/^\d+\.\s/.test(line)) {
        const match = line.match(/^\d+\.\s(.*)/)
        if (match) {
          return (
            <div key={index} className="text-sm mb-3 text-gray-700 leading-relaxed flex items-start">
              <span className="inline-block w-6 h-6 bg-green-500 text-white text-sm font-medium rounded-full mr-4 flex-shrink-0 flex items-center justify-center">
                {line.match(/^\d+/)?.[0]}
              </span>
              <span 
                className="mt-0.5"
                dangerouslySetInnerHTML={{ 
                  __html: match[1].replace(/\*\*(.*?)\*\*/g, '<strong class="text-gray-800 font-semibold">$1</strong>').replace(/\*(.*?)\*/g, '<em class="text-gray-600">$1</em>') 
                }}
              ></span>
            </div>
          )
        }
      }

      // Process bold and italic for regular paragraphs
      let processedLine = line
      processedLine = processedLine.replace(/\*\*(.*?)\*\*/g, '<strong class="text-gray-800 font-semibold">$1</strong>')
      processedLine = processedLine.replace(/\*(.*?)\*/g, '<em class="text-gray-600">$1</em>')

      // Regular paragraphs
      return (
        <p 
          key={index} 
          className="text-md mb-4 text-gray-700 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: processedLine }}
        />
      )
    })
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Minimal header */}
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100">
        <div className="flex items-center space-x-3">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-sm text-gray-600">
            {isEditing ? `Editing: ${slide.title}` : slide.title}
          </span>
        </div>
        
        <div className="flex items-center space-x-1">
          {isEditing ? (
            <>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                title="Save changes"
              >
                <Save size={18} />
              </button>
              <button
                onClick={handleCancel}
                className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                title="Cancel editing"
              >
                <X size={18} />
              </button>
            </>
          ) : (
            <div className="relative">
              <button
                onClick={() => setShowActions(!showActions)}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                title="More actions"
              >
                <MoreHorizontal size={18} />
              </button>
              
              {showActions && (
                <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20 min-w-[120px]">
                  <button
                    onClick={() => {
                      setIsEditing(true)
                      setShowActions(false)
                    }}
                    className="w-full flex items-center space-x-2 px-3 py-2 text-left text-gray-700 hover:bg-gray-50 text-sm"
                  >
                    <Edit3 size={14} />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={handleAddSlide}
                    className="w-full flex items-center space-x-2 px-3 py-2 text-left text-gray-700 hover:bg-gray-50 text-sm"
                  >
                    <Plus size={14} />
                    <span>Add slide</span>
                  </button>
                  <hr className="my-1 border-gray-200" />
                  <button
                    onClick={handleDelete}
                    className="w-full flex items-center space-x-2 px-3 py-2 text-left text-red-600 hover:bg-red-50 text-sm"
                  >
                    <Trash2 size={14} />
                    <span>Delete</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Slide counter - more subtle */}
      <div className="absolute bottom-4 right-4 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full text-sm text-gray-500 border border-gray-200">
        {currentIndex + 1} / {totalSlides}
      </div>

      {/* Main slide area */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-3xl aspect-[16/9] bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
          {/* Content area */}
          <div className="flex-1 p-8 bg-white overflow-hidden">
            <div className="h-full w-full">
              {isEditing ? (
                <div className="h-full flex flex-col space-y-6">
                  {/* Title Editor */}
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">
                      Title
                    </label>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Slide title"
                    />
                  </div>
                  
                  {/* Content Editor */}
                  <div className="flex-1 flex flex-col">
                    <label className="block text-sm font-medium text-gray-600 mb-2">
                      Content
                    </label>
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="flex-1 px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none font-mono text-sm"
                      placeholder="# Title&#10;&#10;Your content here...&#10;&#10;- Bullet point&#10;- Another point"
                    />
                    <div className="mt-2 text-sm text-gray-400">
                      Supports markdown: # titles, ## headers, - bullets, **bold**, *italic*
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col justify-start">
                  {renderContent(slide.content)}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Click outside to close actions menu */}
      {showActions && (
        <div 
          className="fixed inset-0 z-10" 
          onClick={() => setShowActions(false)}
        />
      )}
    </div>
  )
}