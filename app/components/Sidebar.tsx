'use client'
import React, { ReactElement } from 'react'
import { useState, useEffect } from 'react'
import { Move, Plus } from 'lucide-react'

// Define the Slide type to match your database structure
interface Slide {
  id: number
  title: string
  content: string
  order: number
}

interface SidebarProps {
  onSlideUpdate?: (slides: Slide[]) => void
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'

export default function Sidebar({ onSlideUpdate }: SidebarProps = {}) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [slides, setSlides] = useState<Slide[]>([])
  const [loading, setLoading] = useState(true)
  const [draggedSlide, setDraggedSlide] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  // Fetch slides from the database
  const fetchSlides = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/api/slides`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      setSlides(data)
      
      // Notify parent component about slide updates
      if (onSlideUpdate) {
        onSlideUpdate(data)
      }
    } catch (err) {
      console.error('Error fetching slides:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSlides()
  }, [])

  // Listen for slide changes from the main presentation
  useEffect(() => {
    const handleSlideChange = (event: CustomEvent) => {
      setCurrentSlide(event.detail.slideIndex)
    }

    const handleSlideUpdate = () => {
      fetchSlides()
    }

    window.addEventListener('slideChange', handleSlideChange as EventListener)
    window.addEventListener('slideUpdated', handleSlideUpdate as EventListener)
    window.addEventListener('slideDeleted', handleSlideUpdate as EventListener)
    window.addEventListener('slideCreated', handleSlideUpdate as EventListener)
    
    return () => {
      window.removeEventListener('slideChange', handleSlideChange as EventListener)
      window.removeEventListener('slideUpdated', handleSlideUpdate as EventListener)
      window.removeEventListener('slideDeleted', handleSlideUpdate as EventListener)
      window.removeEventListener('slideCreated', handleSlideUpdate as EventListener)
    }
  }, [])

  const handleSlideClick = (index: number) => {
    setCurrentSlide(index)
    // Dispatch event to notify main presentation
    window.dispatchEvent(new CustomEvent('goToSlide', { detail: { slideIndex: index } }))
  }

  const handleAddSlide = async () => {
    const newSlide = {
      title: 'New Slide',
      content: '# New Slide\n\nAdd your content here...',
      order: slides.length
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

      // Refresh slides and notify
      fetchSlides()
      window.dispatchEvent(new CustomEvent('slideCreated'))
    } catch (error) {
      console.error('Error creating slide:', error)
      alert('Failed to create slide. Please try again.')
    }
  }

  // Drag and drop handlers for reordering
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedSlide(index)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverIndex(index)
  }

  const handleDragLeave = () => {
    setDragOverIndex(null)
  }

  const handleDrop = async (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    
    if (draggedSlide === null || draggedSlide === dropIndex) {
      setDraggedSlide(null)
      setDragOverIndex(null)
      return
    }

    try {
      // Reorder slides locally first for immediate feedback
      const newSlides = [...slides]
      const draggedSlideData = newSlides[draggedSlide]
      newSlides.splice(draggedSlide, 1)
      newSlides.splice(dropIndex, 0, draggedSlideData)

      // Update orders
      const updatedSlides = newSlides.map((slide, index) => ({
        ...slide,
        order: index
      }))

      setSlides(updatedSlides)

      // Update the dragged slide's order in the database
      const response = await fetch(`${API_BASE_URL}/api/slides/${draggedSlideData.id}/reorder`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ newOrder: dropIndex }),
      })

      if (!response.ok) {
        throw new Error('Failed to reorder slide')
      }

      // Refresh all slides to ensure consistency
      fetchSlides()
      
      // Update current slide index if needed
      if (draggedSlide === currentSlide) {
        setCurrentSlide(dropIndex)
        window.dispatchEvent(new CustomEvent('goToSlide', { detail: { slideIndex: dropIndex } }))
      } else if (draggedSlide < currentSlide && dropIndex >= currentSlide) {
        const newIndex = currentSlide - 1
        setCurrentSlide(newIndex)
        window.dispatchEvent(new CustomEvent('goToSlide', { detail: { slideIndex: newIndex } }))
      } else if (draggedSlide > currentSlide && dropIndex <= currentSlide) {
        const newIndex = currentSlide + 1
        setCurrentSlide(newIndex)
        window.dispatchEvent(new CustomEvent('goToSlide', { detail: { slideIndex: newIndex } }))
      }

    } catch (error) {
      console.error('Error reordering slides:', error)
      // Revert to original order on error
      fetchSlides()
      alert('Failed to reorder slides. Please try again.')
    }

    setDraggedSlide(null)
    setDragOverIndex(null)
  }

  // Render content preview for sidebar thumbnails - matching main slide rendering
  const renderThumbnailContent = (content: string) => {
    const lines = content.split('\n').filter(line => line.trim() !== '')
    let bulletPoints: string[] = []
    const elements: ReactElement[] = []
    
    lines.forEach((line, index) => {
      // Main title (# ) - Center aligned
      if (line.startsWith('# ')) {
        elements.push(
          <div key={index} className="text-center mb-2">
            <div className="text-[10px] font-bold text-gray-800 leading-tight">
              {line.slice(2)}
            </div>
            <div className="w-6 h-[1px] bg-green-600 mx-auto mt-1"></div>
          </div>
        )
      }
      // Section headers (## )
      else if (line.startsWith('## ')) {
        elements.push(
          <div key={index} className="mb-1">
            <div className="text-[8px] font-semibold text-gray-700 border-b border-gray-300 pb-[1px]">
              {line.slice(3)}
            </div>
          </div>
        )
      }
      // Subsection headers (### )
      else if (line.startsWith('### ')) {
        elements.push(
          <div key={index} className="text-[7px] font-medium text-gray-600 mb-1 flex items-center">
            <span className="w-[2px] h-2 bg-green-500 mr-1"></span>
            {line.slice(4)}
          </div>
        )
      }
      // Bullet points
      else if (line.startsWith('- ') || line.startsWith('• ')) {
        const bulletText = line.startsWith('- ') ? line.slice(2) : line.slice(2)
        bulletPoints.push(bulletText)
        
        // Check if this is the last bullet point
        const nextLineIndex = lines.findIndex((l, i) => i > index && l.trim() !== '')
        const isLastBullet = nextLineIndex === -1 || 
          (!lines[nextLineIndex]?.startsWith('- ') && !lines[nextLineIndex]?.startsWith('• '))
        
        if (isLastBullet) {
          elements.push(
            <div key={index} className="mb-1">
              {bulletPoints.map((item, i) => (
                <div key={i} className="text-[7px] mb-[2px] text-gray-700 flex items-start">
                  <span className="inline-block w-1 h-1 bg-green-500 rounded-full mr-1 mt-1 flex-shrink-0"></span>
                  <span className="leading-tight" dangerouslySetInnerHTML={{ 
                    __html: item.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>') 
                  }}></span>
                </div>
              ))}
            </div>
          )
          bulletPoints = []
        }
      }
      // Numbered list items
      else if (/^\d+\.\s/.test(line)) {
        const match = line.match(/^\d+\.\s(.*)/)
        if (match) {
          elements.push(
            <div key={index} className="text-[7px] mb-[2px] text-gray-700 flex items-start">
              <span className="inline-block w-2 h-2 bg-green-500 text-white text-[5px] font-bold rounded-full mr-1 flex-shrink-0 flex items-center justify-center">
                {line.match(/^\d+/)?.[0]}
              </span>
              <span 
                className="leading-tight"
                dangerouslySetInnerHTML={{ 
                  __html: match[1].replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>') 
                }}
              ></span>
            </div>
          )
        }
      }
      // Regular paragraphs
      else if (line.trim()) {
        let processedLine = line
        processedLine = processedLine.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        processedLine = processedLine.replace(/\*(.*?)\*/g, '<em>$1</em>')
        
        elements.push(
          <div 
            key={index} 
            className="text-[7px] mb-1 text-gray-700 leading-tight"
            dangerouslySetInnerHTML={{ __html: processedLine }}
          />
        )
      }
    })
    
    return elements.slice(0, 12) // Limit to prevent overflow
  }

  if (loading) {
    return (
      <aside className="w-80 bg-gray-50 border-r border-gray-300 flex flex-col h-full">
        <div className="p-4 bg-white border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Slides</h2>
          <p className="text-sm text-gray-500">Loading...</p>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        </div>
      </aside>
    )
  }

  return (
    <aside className="w-80 bg-gray-50 border-r border-gray-300 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold text-gray-800">Slides</h2>
          <button
            onClick={handleAddSlide}
            className="flex items-center space-x-1 px-2 py-1 bg-green-100 text-gray-800 rounded-md hover:bg-green-200 transition-colors text-sm"
          >
            <Plus size={14} />
            <span>Add</span>
          </button>
        </div>
        <p className="text-sm text-gray-500">{slides.length} slides</p>
      </div>
      
      {/* Slides Grid */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, index)}
            onClick={() => handleSlideClick(index)}
            className={`relative cursor-pointer transition-all duration-200 group ${
              currentSlide === index ? 'ring-1 ring-green-500' : ''
            } ${
              dragOverIndex === index ? 'scale-105 shadow-lg' : ''
            } ${
              draggedSlide === index ? 'opacity-50' : ''
            }`}
          >
            {/* Drag Handle */}
            <div className="absolute -top-1 -left-1 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="w-4 h-4 bg-gray-600 text-white rounded-full flex items-center justify-center cursor-grab active:cursor-grabbing">
                <Move size={10} />
              </div>
            </div>
            
            {/* Slide Number */}
            <div className="absolute -top-2 -right-2 z-10 w-6 h-6 bg-gray-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
              {index + 1}
            </div>
            
            {/* Slide Thumbnail - Fixed aspect ratio like real slides */}
            <div className={`bg-white border-2 shadow-sm overflow-hidden aspect-[16/9] ${
              currentSlide === index ? 'border-green-500' : 'border-gray-300'
            } group-hover:shadow-md transition-shadow`}>
              
              {/* Slide Content Preview - matching main slide layout */}
              <div className="p-3 h-full flex flex-col justify-start bg-white">
                <div className="flex-1 overflow-hidden">
                  {renderThumbnailContent(slide.content)}
                </div>
                
                {/* Mini footer like main slide */}
                <div className="border-t border-gray-200 pt-1 mt-1">
                  <div className="text-[6px] text-gray-500 text-center truncate">
                    {slide.title}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Current slide indicator */}
            {currentSlide === index && (
              <div className="absolute -right-2 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-green-500 rounded-full"></div>
            )}
            
            {/* Drop indicator */}
            {dragOverIndex === index && draggedSlide !== index && (
              <div className="absolute inset-0 border-2 border-dashed border-green-500 rounded-lg bg-green-50 bg-opacity-50"></div>
            )}
          </div>
        ))}
        
        {/* Empty state */}
        {slides.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">No slides yet</div>
            <button
              onClick={handleAddSlide}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors mx-auto"
            >
              <Plus size={16} />
              <span>Create First Slide</span>
            </button>
          </div>
        )}
      </div>
      
      {/* Footer */}
      <div className="p-4 bg-white border-t border-gray-200">
        <div className="text-center">
          <div className="text-sm font-medium text-gray-700">
            Slide {slides.length > 0 ? currentSlide + 1 : 0} of {slides.length}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
            <div 
              className="bg-green-500 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${slides.length > 0 ? ((currentSlide + 1) / slides.length) * 100 : 0}%` }}
            ></div>
          </div>
        </div>
      </div>
    </aside>
  )
}