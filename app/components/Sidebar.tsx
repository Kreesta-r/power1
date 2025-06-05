'use client'
import { slides } from '../data/slides'
import { useState, useEffect } from 'react'

export default function Sidebar() {
  const [currentSlide, setCurrentSlide] = useState(0)

  // Listen for slide changes from the main presentation
  useEffect(() => {
    const handleSlideChange = (event: CustomEvent) => {
      setCurrentSlide(event.detail.slideIndex)
    }

    window.addEventListener('slideChange', handleSlideChange as EventListener)
    return () => window.removeEventListener('slideChange', handleSlideChange as EventListener)
  }, [])

  const handleSlideClick = (index: number) => {
    setCurrentSlide(index)
    // Dispatch event to notify main presentation
    window.dispatchEvent(new CustomEvent('goToSlide', { detail: { slideIndex: index } }))
  }

  // Render content preview for sidebar thumbnails - matching main slide rendering
  const renderThumbnailContent = (content: string) => {
    const lines = content.split('\n').filter(line => line.trim() !== '')
    let bulletPoints: string[] = []
    const elements: JSX.Element[] = []
    
    lines.forEach((line, index) => {
      // Main title (# ) - Center aligned
      if (line.startsWith('# ')) {
        elements.push(
          <div key={index} className="text-center mb-2">
            <div className="text-[10px] font-bold text-gray-800 leading-tight">
              {line.slice(2)}
            </div>
            <div className="w-6 h-[1px] bg-blue-600 mx-auto mt-1"></div>
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
            <span className="w-[2px] h-2 bg-blue-500 mr-1"></span>
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
                  <span className="inline-block w-1 h-1 bg-blue-500 rounded-full mr-1 mt-1 flex-shrink-0"></span>
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
              <span className="inline-block w-2 h-2 bg-blue-500 text-white text-[5px] font-bold rounded-full mr-1 flex-shrink-0 flex items-center justify-center">
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

  return (
    <aside className="w-80 bg-gray-50 border-r border-gray-300 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 bg-white border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">Slides</h2>
        <p className="text-sm text-gray-500">{slides.length} slides</p>
      </div>
      
      {/* Slides Grid */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {slides.map((slide, index) => (
          <div
            key={index}
            onClick={() => handleSlideClick(index)}
            className={`relative cursor-pointer transition-all duration-200 group ${
              currentSlide === index ? 'ring-2 ring-blue-500' : ''
            }`}
          >
            {/* Slide Number */}
            <div className="absolute -top-2 -left-2 z-10 w-6 h-6 bg-gray-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
              {index + 1}
            </div>
            
            {/* Slide Thumbnail - Fixed aspect ratio like real slides */}
            <div className={`bg-white border-2 shadow-sm overflow-hidden aspect-[16/9] ${
              currentSlide === index ? 'border-blue-500' : 'border-gray-300'
            } group-hover:shadow-md transition-shadow`}>
              
              {/* Slide Content Preview - matching main slide layout */}
              <div className="p-3 h-full flex flex-col justify-start bg-white">
                <div className="flex-1 overflow-hidden">
                  {renderThumbnailContent(slide.content)}
                </div>
                
                {/* Mini footer like main slide */}
                <div className="border-t border-gray-200 pt-1 mt-1">
                  <div className="text-[6px] text-gray-500 text-center">
                    Slide {index + 1}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Current slide indicator */}
            {currentSlide === index && (
              <div className="absolute -right-2 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-blue-500 rounded-full"></div>
            )}
          </div>
        ))}
      </div>
      
      {/* Footer */}
      <div className="p-4 bg-white border-t border-gray-200">
        <div className="text-center">
          <div className="text-sm font-medium text-gray-700">
            Slide {currentSlide + 1} of {slides.length}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
            <div 
              className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>
    </aside>
  )
}