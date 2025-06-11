'use client'

import { useEffect, useState, useCallback } from 'react'
import PresentationViewer from './components/PresentationViewer'

// Define the Slide type
interface Slide {
  id: number
  title: string
  content: string
  order: number
}

// Get API base URL from environment variable with fallback
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'

export default function Home() {
  const [slides, setSlides] = useState<Slide[]>([])
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch slides from API
  const fetchSlides = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/api/slides`)
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
      
      const data = await response.json()
      setSlides(data)

      // Adjust index if out of bounds
      if (data.length > 0 && currentSlideIndex >= data.length) {
        setCurrentSlideIndex(data.length - 1)
      } else if (data.length === 0) {
        setCurrentSlideIndex(0)
      }

      setError(null)
    } catch (err) {
      console.error('Error fetching slides:', err)
      setError('Failed to load slides')
    } finally {
      setLoading(false)
    }
  }, [currentSlideIndex])

  useEffect(() => {
    fetchSlides()
  }, [fetchSlides])

  // Listen for external slide navigation
  useEffect(() => {
    const handleGoToSlide = (event: CustomEvent) => {
      const { slideIndex } = event.detail
      if (slideIndex >= 0 && slideIndex < slides.length) {
        setCurrentSlideIndex(slideIndex)
      }
    }

    window.addEventListener('goToSlide', handleGoToSlide as EventListener)
    return () => window.removeEventListener('goToSlide', handleGoToSlide as EventListener)
  }, [slides.length])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) return

      switch (event.key) {
        case 'ArrowRight':
        case ' ':
          event.preventDefault()
          if (currentSlideIndex < slides.length - 1) {
            setCurrentSlideIndex(currentSlideIndex + 1)
          }
          break
        case 'ArrowLeft':
          event.preventDefault()
          if (currentSlideIndex > 0) {
            setCurrentSlideIndex(currentSlideIndex - 1)
          }
          break
        case 'Home':
          event.preventDefault()
          setCurrentSlideIndex(0)
          break
        case 'End':
          event.preventDefault()
          setCurrentSlideIndex(slides.length - 1)
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [currentSlideIndex, slides.length])

  // Navigation controls
  const nextSlide = () => setCurrentSlideIndex(i => Math.min(i + 1, slides.length - 1))
  const prevSlide = () => setCurrentSlideIndex(i => Math.max(i - 1, 0))
  const goToSlide = (index: number) => setCurrentSlideIndex(index)

  // Slide update handler
  const handleSlideUpdate = (updated: Slide) => {
    setSlides(slides => slides.map(slide => slide.id === updated.id ? updated : slide))
    window.dispatchEvent(new CustomEvent('slideUpdated'))
  }

  // Slide deletion handler
  const handleSlideDelete = (id: number) => {
    const deletedIndex = slides.findIndex(slide => slide.id === id)
    setSlides(prev => prev.filter(slide => slide.id !== id))

    if (slides.length <= 1) {
      setCurrentSlideIndex(0)
    } else if (deletedIndex === currentSlideIndex) {
      if (currentSlideIndex >= slides.length - 1) {
        setCurrentSlideIndex(slides.length - 2)
      }
    } else if (deletedIndex < currentSlideIndex) {
      setCurrentSlideIndex(i => i - 1)
    }

    window.dispatchEvent(new CustomEvent('slideDeleted'))
  }

  // Slide creation handler
  const handleSlideCreate = (newSlide: Slide) => {
    setSlides(prev => [...prev, newSlide])
    setCurrentSlideIndex(slides.length)
    window.dispatchEvent(new CustomEvent('slideCreated'))
  }

  // UI States
  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading presentation...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Presentation</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (slides.length === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="text-gray-400 text-6xl mb-4">📋</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">No Slides Found</h2>
          <p className="text-gray-600">There are no slides available in this presentation.</p>
        </div>
      </div>
    )
  }

  const currentSlide = slides[currentSlideIndex]

  return (
    <div className="h-full flex flex-col">
      <PresentationViewer 
        slide={currentSlide}
        currentIndex={currentSlideIndex}
        totalSlides={slides.length}
        onSlideUpdate={handleSlideUpdate}
        onSlideDelete={handleSlideDelete}
        onSlideCreate={handleSlideCreate}
      />
      {/* <NavigationControls
        currentSlide={currentSlideIndex}
        totalSlides={slides.length}
        onNext={nextSlide}
        onPrev={prevSlide}
        onGoToSlide={goToSlide}
      /> */}
    </div>
  )
}