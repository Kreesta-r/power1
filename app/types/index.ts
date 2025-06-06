// Core slide interface
export interface Slide {
  id: number
  title: string
  content: string
  metadata?: SlideMetadata
}

// Optional slide metadata
export interface SlideMetadata {
  duration?: number // Estimated reading time in seconds
  tags?: string[]
  difficulty?: 'beginner' | 'intermediate' | 'advanced'
  notes?: string // Speaker notes
  backgroundColor?: string
  textColor?: string
}

// Navigation state
export interface NavigationState {
  currentSlide: number
  totalSlides: number
  isPlaying?: boolean
  autoAdvance?: boolean
}

// Presentation configuration
export interface PresentationConfig {
  title: string
  author?: string
  description?: string
  theme?: 'light' | 'dark' | 'auto'
  autoAdvanceTime?: number // seconds
  showProgressBar?: boolean
  showSlideNumbers?: boolean
  allowKeyboardNavigation?: boolean
}

// Event types for custom events
export interface SlideChangeEvent extends CustomEvent {
  detail: {
    slideIndex: number
    previousIndex?: number
  }
}

export interface GoToSlideEvent extends CustomEvent {
  detail: {
    slideIndex: number
  }
}

// Component prop types
export interface PresentationViewerProps {
  slide: Slide
  currentIndex: number
  totalSlides: number
  config?: Partial<PresentationConfig>
}

export interface NavigationControlsProps {
  currentSlide: number
  totalSlides: number
  onNext: () => void
  onPrev: () => void
  onGoToSlide: (index: number) => void
  config?: Partial<PresentationConfig>
}

export interface SidebarProps {
  slides: Slide[]
  currentSlide: number
  onSlideSelect: (index: number) => void
  config?: Partial<PresentationConfig>
}

// Utility types
export type SlideDirection = 'next' | 'prev'
export type NavigationMethod = 'keyboard' | 'mouse' | 'sidebar' | 'auto'

// Future extension types
export interface SlideTransition {
  type: 'fade' | 'slide' | 'zoom' | 'flip'
  duration: number
  easing?: 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out'
}

export interface MediaElement {
  type: 'image' | 'video' | 'audio'
  src: string
  alt?: string
  caption?: string
}

// Extended slide for future features
export interface ExtendedSlide extends Slide {
  transition?: SlideTransition
  media?: MediaElement[]
  layout?: 'default' | 'split' | 'full-image' | 'title-only'
}

export interface Slide {
  id: number
  title: string
  content: string
  order: number
  presentationId: number
  createdAt?: string
  updatedAt?: string
}

export interface Presentation {
  id: number
  title: string
  description?: string
  slides: Slide[]
  createdAt?: string
  updatedAt?: string
}

export interface ApiResponse<T> {
  data: T
  success: boolean
  message?: string
}