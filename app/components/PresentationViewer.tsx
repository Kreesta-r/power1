'use client'
import { Slide } from '../types/index'
import { useEffect } from 'react'

interface PresentationViewerProps {
  slide: Slide
  currentIndex: number
  totalSlides: number
}

export default function PresentationViewer({ slide, currentIndex, totalSlides }: PresentationViewerProps) {
  // Notify sidebar of slide changes
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('slideChange', { 
      detail: { slideIndex: currentIndex } 
    }))
  }, [currentIndex])

  // Convert markdown-like content to JSX with proper spacing and constraints
  const renderContent = (content: string) => {
    const lines = content.split('\n').filter(line => line.trim() !== '')
    let bulletPoints: string[] = []
    
    return lines.map((line, index) => {
      // Main title (# ) - Center aligned, large
      if (line.startsWith('# ')) {
        return (
          <div key={index} className="text-center mb-8">
            <h1 className="text-5xl font-bold text-gray-800 leading-tight">
              {line.slice(2)}
            </h1>
            <div className="w-24 h-1 bg-blue-600 mx-auto mt-4 rounded"></div>
          </div>
        )
      }
      
      // Section headers (## ) - Left aligned, medium
      if (line.startsWith('## ')) {
        return (
          <div key={index} className="mb-6">
            <h2 className="text-3xl font-semibold text-gray-700 border-b border-gray-300 pb-2">
              {line.slice(3)}
            </h2>
          </div>
        )
      }
      
      // Subsection headers (### ) - Left aligned, smaller
      if (line.startsWith('### ')) {
        return (
          <h3 key={index} className="text-2xl font-medium text-gray-600 mb-4 flex items-center">
            <span className="w-1 h-6 bg-blue-500 mr-3 rounded"></span>
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
              <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mr-4 mt-2 flex-shrink-0"></span>
              <span dangerouslySetInnerHTML={{ __html: item.replace(/\*\*(.*?)\*\*/g, '<strong class="text-gray-800 font-semibold">$1</strong>').replace(/\*(.*?)\*/g, '<em class="text-gray-600">$1</em>') }}></span>
            </li>
          ))
          bulletPoints = [] // Reset for next list
          
          return (
            <ul key={index} className="mb-6 ml-2">
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
            <div key={index} className="text-xl mb-3 text-gray-700 leading-relaxed flex items-start">
              <span className="inline-block w-8 h-8 bg-blue-500 text-white text-sm font-bold rounded-full mr-4 flex-shrink-0 flex items-center justify-center">
                {line.match(/^\d+/)?.[0]}
              </span>
              <span 
                className="mt-1"
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
          className="text-xl mb-4 text-gray-700 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: processedLine }}
        />
      )
    })
  }

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-gray-100 to-gray-200">
      {/* PowerPoint-style top bar */}
      <div className="bg-white border-b border-gray-300 px-6 py-2 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-4">
          <div className="w-6 h-6 bg-gradient-to-br from-orange-400 to-orange-600 rounded-sm flex items-center justify-center">
            <span className="text-white text-xs font-bold">P</span>
          </div>
          <span className="text-gray-700 font-medium">PowerPoint</span>
        </div>
        <div className="text-sm text-gray-600">
          {slide.title}
        </div>
      </div>

      {/* Slide counter */}
      <div className="absolute bottom-6 right-6 bg-white px-4 py-2 rounded-lg shadow-md text-sm text-gray-600 z-10 border border-gray-200">
        <span className="font-medium">{currentIndex + 1}</span>
        <span className="mx-1 text-gray-400">/</span>
        <span>{totalSlides}</span>
      </div>

      {/* Main slide area - Fixed dimensions like real PowerPoint */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-6xl aspect-[16/9] bg-white rounded-lg shadow-2xl overflow-hidden flex flex-col border border-gray-300">
          {/* Content area with fixed boundaries - like a real slide */}
          <div className="flex-1 p-16 bg-white overflow-hidden">
            <div className="h-full w-full">
              <div className="h-full flex flex-col justify-start">
                {renderContent(slide.content)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced progress bar */}
      <div className="h-3 bg-gray-300 relative">
        <div 
          className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500 ease-out relative overflow-hidden" 
          style={{ width: `${((currentIndex + 1) / totalSlides) * 100}%` }}
        >
          <div className="absolute top-0 left-0 right-0 bottom-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 animate-pulse"></div>
        </div>
        <div className="absolute top-0 right-0 h-full w-px bg-gray-400"></div>
      </div>
    </div>
  )
}