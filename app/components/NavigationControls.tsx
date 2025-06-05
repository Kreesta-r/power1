'use client'

import { useEffect } from 'react'

interface NavigationControlsProps {
  currentSlide: number
  totalSlides: number
  onNext: () => void
  onPrev: () => void
  onGoToSlide: (index: number) => void
}

export default function NavigationControls({
  currentSlide,
  totalSlides,
  onNext,
  onPrev,
  onGoToSlide
}: NavigationControlsProps) {

  // Listen for sidebar navigation
  useEffect(() => {
    const handleGoToSlide = (event: CustomEvent) => {
      onGoToSlide(event.detail.slideIndex)
    }

    window.addEventListener('goToSlide', handleGoToSlide as EventListener)
    return () => window.removeEventListener('goToSlide', handleGoToSlide as EventListener)
  }, [onGoToSlide])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight' || event.key === ' ') {
        event.preventDefault()
        onNext()
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault()
        onPrev()
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [onNext, onPrev])

  return (
    <div className="bg-gradient-to-r from-slate-800 to-slate-900 border-t border-slate-700 p-6 shadow-lg">
      <div className="flex justify-between items-center max-w-6xl mx-auto">
        
        {/* Previous Button */}
        <button
          onClick={onPrev}
          disabled={currentSlide === 0}
          className={`flex items-center px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
            currentSlide === 0
              ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
              : 'bg-slate-600 text-white hover:bg-slate-500 active:bg-slate-400 shadow-md hover:shadow-lg'
          }`}
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Previous
        </button>

        {/* Slide Counter & Progress */}
        <div className="flex flex-col items-center space-y-3">
          <div className="text-white font-medium">
            Slide {currentSlide + 1} of {totalSlides}
          </div>
          
          {/* Progress Bar */}
          <div className="w-64 bg-slate-700 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-full rounded-full transition-all duration-300 ease-out"
              style={{ width: `${((currentSlide + 1) / totalSlides) * 100}%` }}
            />
          </div>
          
          {/* Slide Indicator Dots */}
          <div className="flex space-x-2">
            {Array.from({ length: totalSlides }, (_, index) => (
              <button
                key={index}
                onClick={() => onGoToSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-200 ${
                  currentSlide === index
                    ? 'bg-blue-500 scale-125 shadow-lg'
                    : 'bg-slate-600 hover:bg-slate-500'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Next Button */}
        <button
          onClick={onNext}
          disabled={currentSlide === totalSlides - 1}
          className={`flex items-center px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
            currentSlide === totalSlides - 1
              ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-500 hover:to-purple-500 active:from-blue-700 active:to-purple-700 shadow-md hover:shadow-lg'
          }`}
        >
          Next
          <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Keyboard Hints */}
      <div className="text-center mt-4">
        <p className="text-sm text-slate-400">
          Use ← → arrow keys, spacebar, or click controls to navigate
        </p>
      </div>
    </div>
  )
}