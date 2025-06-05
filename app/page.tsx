'use client'
import { useState } from 'react'
import { slides } from './data/slides'
import NavigationControls from './components/NavigationControls'
import PresentationViewer from './components/PresentationViewer'

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0)

  const nextSlide = () => {
    setCurrentSlide(prev => Math.min(prev + 1, slides.length - 1))
  }

  const prevSlide = () => {
    setCurrentSlide(prev => Math.max(prev - 1, 0))
  }

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
  }

  return (
    <div className="h-full flex flex-col">
      <PresentationViewer 
        slide={slides[currentSlide]} 
        currentIndex={currentSlide}
        totalSlides={slides.length}
      />
      <NavigationControls
        currentSlide={currentSlide}
        totalSlides={slides.length}
        onNext={nextSlide}
        onPrev={prevSlide}
        onGoToSlide={goToSlide}
      />
    </div>
  )
}